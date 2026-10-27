from pathlib import Path
import pandas as pd


# Path to the directory containing the CSV files
DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "raw" / "MachineLearningCVE"


def load_dataset():
    csv_files = list(DATA_DIR.glob("*.csv"))

    print(f"Found {len(csv_files)} CSV files.")

    dataframes = []

    for file in csv_files:
        print(f"Loading: {file.name}")

        df = pd.read_csv(file)
        dataframes.append(df)

    combined_df = pd.concat(dataframes, ignore_index=True)

    return combined_df


def inspect_dataset(df):
    print("\n" + "=" * 60)
    print("DATASET SHAPE")
    print("=" * 60)

    print(f"Rows    : {df.shape[0]:,}")
    print(f"Columns : {df.shape[1]:,}")

    print("\n" + "=" * 60)
    print("LABEL DISTRIBUTION")
    print("=" * 60)

    print(df[" Label"].value_counts())

    print("\n" + "=" * 60)
    print("MISSING VALUES")
    print("=" * 60)

    missing_values = df.isnull().sum()
    missing_values = missing_values[missing_values > 0]

    if missing_values.empty:
        print("No missing values found.")
    else:
        print(missing_values)

    print("\n" + "=" * 60)
    print("INFINITE VALUES")
    print("=" * 60)

    numeric_df = df.select_dtypes(include="number")

    infinite_values = numeric_df.isin([float("inf"), float("-inf")]).sum()
    infinite_values = infinite_values[infinite_values > 0]

    if infinite_values.empty:
        print("No infinite values found.")
    else:
        print(infinite_values)

    print("\n" + "=" * 60)
    print("DUPLICATE ROWS")
    print("=" * 60)

    duplicate_count = df.duplicated().sum()

    print(f"Duplicate rows: {duplicate_count:,}")

    print("\n" + "=" * 60)
    print("DATA TYPES")
    print("=" * 60)

    print(df.dtypes.value_counts())


if __name__ == "__main__":
    dataset = load_dataset()
    inspect_dataset(dataset)