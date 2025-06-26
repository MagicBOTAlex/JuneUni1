import pandas as pd

input = "HR_data.csv"
output = "HR_data_onehot.csv"

df = pd.read_csv(input)
cat_cols = ['Round', 'Phase', 'Cohort']
df_encoded = pd.get_dummies(df, columns=cat_cols, prefix=cat_cols)
df_encoded.to_csv(output, index=False)
