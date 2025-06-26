import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import ttest_rel, wilcoxon

# model 1 = reduced
model1_scores = [0.8090964555740356, 0.9732205867767334, 0.2743905484676361, 0.7069059014320374, 0.8138278722763062, 0.7028706669807434, 0.6035595536231995, 0.9424499273300171, 0.5997419357299805, 0.7330678701400757]
model2_scores = [0.490458220243454, 0.8472049832344055, 0.44835370779037476, 0.6052634716033936, 0.5895392298698425, 0.8263911008834839, 0.5817957520484924, 0.9035923480987549, 0.6060190796852112, 0.774731457233429]

mean1, std1 = np.mean(model1_scores), np.std(model1_scores, ddof=1)
mean2, std2 = np.mean(model2_scores), np.std(model2_scores, ddof=1)

print(f"Model 1 → mean={mean1:.3f}, std={std1:.3f}")
print(f"Model 2 → mean={mean2:.3f}, std={std2:.3f}")

plt.boxplot([model1_scores, model2_scores],
            labels=["Model 1", "Model 2"])
plt.ylabel("Accuracy")
plt.show()


t_stat, p_val = ttest_rel(model1_scores, model2_scores)
print("Paired t-test p-value:", p_val)

w_stat, p_val_w = wilcoxon(model1_scores, model2_scores)
print("Wilcoxon p-value:", p_val_w)
