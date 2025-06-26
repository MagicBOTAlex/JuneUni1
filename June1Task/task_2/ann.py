import argparse
import numpy as np
import pandas as pd
import torch
import torch.optim as optim
import matplotlib.pyplot as plt
from sklearn.model_selection import KFold
from concurrent.futures import ProcessPoolExecutor, as_completed

# ----------------------
# Argument Parsing
# ----------------------
parser = argparse.ArgumentParser(
    description="Train ANN with either 3 HR features or all features."
)
parser.add_argument(
    "--all-features",
    action="store_true",
    help="Use all columns except target as input features"
)
args = parser.parse_args()

# ----------------------
# Data Loading and Preprocessing
# ----------------------
print("Loading data…")
df = pd.read_csv('HR_data_onehot.csv', index_col=0)

# choose columns based on flag
if args.all_features:
    feature_cols = [c for c in df.columns if c not in ('Frustrated')]
    print(f"Using all {len(feature_cols)} features.")
else:
    feature_cols = ["Puzzler", "Phase_phase1", "Phase_phase2", "Phase_phase3"]
    print(f"Using only 3 HR features: {feature_cols!r}")

X = df[feature_cols].to_numpy(dtype=np.float32)
y = df['Frustrated'].to_numpy(dtype=np.float32)

print(f"Raw X dtype: {X.dtype}, shape: {X.shape}")
print(f"Raw y dtype: {y.dtype}, shape: {y.shape}")

# standardize X
X_mean, X_std = X.mean(0), X.std(0)
X_scaled = (X - X_mean) / X_std
n_features = X_scaled.shape[1]
print(f"Standardized inputs; n_features = {n_features}")

# standardize y
y_mean, y_std = y.mean(), y.std()
Y_scaled = ((y - y_mean) / y_std).reshape(-1, 1)

# convert once to torch tensors
device = torch.device("cpu")
X_tensor = torch.tensor(X_scaled, dtype=torch.float32, device=device)
Y_tensor = torch.tensor(Y_scaled, dtype=torch.float32, device=device)
print(f"Tensors ready on {device}.")

# ----------------------
# CV and Training Setup
# ----------------------
K1, K2 = 10, 5
CV_outer = KFold(n_splits=K1, shuffle=True, random_state=42)
folds = list(CV_outer.split(X_scaled))
hidden_units_candidates = [1, 2, 4, 8, 16, 32]
max_iter, n_replicates = 250, 1
loss_fn = torch.nn.MSELoss()

def train_neural_net(model_fn, loss_fn, X, y, n_replicates=1, max_iter=1000):
    best_net, best_loss, best_curve = None, float('inf'), None
    for rep in range(1, n_replicates+1):
        print(f"  Replicate {rep}/{n_replicates}")
        net = model_fn()
        optimizer = optim.Adam(net.parameters(), lr=0.01)
        curve = []
        for i in range(1, max_iter+1):
            optimizer.zero_grad()
            loss = loss_fn(net(X), y)
            loss.backward()
            optimizer.step()
            curve.append(loss.item())
            if i % 200 == 0:
                print(f"    Iter {i}/{max_iter}: loss = {loss.item():.4f}")
        print(f"  → Replicate {rep} final loss {curve[-1]:.4f}")
        if curve[-1] < best_loss:
            best_loss, best_net, best_curve = curve[-1], net, curve
    print(f"  Best replicate loss = {best_loss:.4f}")
    return best_net, best_loss, best_curve

def run_one_outer_fold(outer_idx, train_idx, test_idx):
    print(f"\nOuter fold {outer_idx+1}/{K1}")
    # get the outer train/test split
    X_tr, X_te = X_tensor[train_idx], X_tensor[test_idx]
    Y_tr, Y_te = Y_tensor[train_idx], Y_tensor[test_idx]

    # inner CV to pick best hidden size
    CV_inner = KFold(n_splits=K2, shuffle=True, random_state=42)
    errors = np.zeros(len(hidden_units_candidates))

    for inner_fold, (it, iv) in enumerate(CV_inner.split(X_tr), start=1):
        print(f"  Inner fold {inner_fold}/{K2}")
        X_it, X_iv = X_tr[it], X_tr[iv]
        Y_it, Y_iv = Y_tr[it], Y_tr[iv]

        for ci, h in enumerate(hidden_units_candidates):
            model_fn = lambda: torch.nn.Sequential(
                torch.nn.Linear(n_features, h),
                torch.nn.Tanh(),
                torch.nn.Linear(h, 1)
            ).to(device)

            # train and get the best replicate
            best_net, _, _ = train_neural_net(
                model_fn, loss_fn, X_it, Y_it,
                n_replicates=n_replicates, max_iter=max_iter
            )

            # validate with the trained net
            pred = best_net(X_iv)
            errors[ci] += ((pred - Y_iv)**2).mean().item() / K2
            print(f"    Hidden {h}: cum. error = {errors[ci]:.4f}")

    best_h = hidden_units_candidates[np.argmin(errors)]
    print(f"  Best hidden units = {best_h}")

    # retrain on full outer train with best_h
    model_fn = lambda: torch.nn.Sequential(
        torch.nn.Linear(n_features, best_h),
        torch.nn.Tanh(),
        torch.nn.Linear(best_h, 1)
    ).to(device)
    net, _, learning_curve = train_neural_net(
        model_fn, loss_fn, X_tr, Y_tr,
        n_replicates=n_replicates, max_iter=max_iter
    )

    # test error
    pred_test = net(X_te)
    mse_test = ((pred_test - Y_te)**2).mean().item()
    print(f"Outer fold {outer_idx+1} MSE = {mse_test:.4f}")

    return outer_idx, mse_test, best_h, learning_curve

if __name__ == "__main__":
    print("\nStarting cross-validation…")
    ANN_errors = [None] * K1
    best_hidden = [None] * K1
    learning_curves = [None] * K1

    with ProcessPoolExecutor(max_workers=K1) as exe:
        futures = [
            exe.submit(run_one_outer_fold, idx, tr, te)
            for idx, (tr, te) in enumerate(folds)
        ]
        for fut in as_completed(futures):
            idx, mse, h, curve = fut.result()
            ANN_errors[idx] = mse
            best_hidden[idx] = h
            learning_curves[idx] = curve
            print(f"[Main] Collected fold {idx+1} results")

    # plotting
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    colors = plt.cm.tab10.colors

    for i, curve in enumerate(learning_curves):
        axes[0].plot(curve, color=colors[i], label=f"Fold {i+1}")
    axes[0].set(
        title="Learning Curves",
        xlabel="Iteration",
        ylabel="Loss",
        xlim=(0, max_iter)
    )
    axes[0].legend()

    axes[1].bar(
        np.arange(1, K1+1),
        ANN_errors,
        color=colors[:K1]
    )
    axes[1].set(
        title="Test MSE",
        xlabel="Fold",
        ylabel="MSE",
        xticks=np.arange(1, K1+1)
    )

    plt.tight_layout()
    plt.show()

    print("\nDone.")
    print("ANN errors:", ANN_errors)
    print("Best hidden units:", best_hidden)

