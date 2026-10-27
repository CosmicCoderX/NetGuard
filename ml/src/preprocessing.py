from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import pandas as pd


DATA_DIR = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "raw"
    / "MachineLearningCVE"
)

PROCESSED_DIR = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "processed"
)


LABEL_COLUMN = " Label"


def load_raw_data():
    """Load all CIC-IDS2017 CSV files into one DataFrame."""

    csv_files = list(DATA_DIR.glob("*.csv"))

    if not csv_files:
        raise FileNotFoundError(
            f"No CSV files found in: {DATA_DIR}"
        )

    dataframes = []

    for file in csv_files:
        print(f"Loading: {file.name}")

        df = pd.read_csv(file)
        dataframes.append(df)

    return pd.concat(dataframes, ignore_index=True)

def prepare_dataset(df):
    """Prepare the dataset for model training."""

    # Create NetGuard labels
    df = create_netguard_labels(df)

    # Remove the extremely rare class
    df = df[df["NetGuard_Label"] != "Rare / Other Attack"].copy()

    # Separate features and target
    X = df.drop(columns=["Label", "NetGuard_Label"])

    y = df["NetGuard_Label"]

    return X, y

def create_preprocessor(X):
    """Create preprocessing pipeline for numerical features."""

    numeric_features = X.columns.tolist()

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median"))
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                numeric_pipeline,
                numeric_features
            )
        ]
    )

    return preprocessor

LABEL_MAPPING = {
    "BENIGN": "Normal",

    "DoS Hulk": "DoS / DDoS",
    "DDoS": "DoS / DDoS",
    "DoS GoldenEye": "DoS / DDoS",
    "DoS Slowhttptest": "DoS / DDoS",
    "DoS slowloris": "DoS / DDoS",

    "PortScan": "Port Scanning",

    "FTP-Patator": "Brute Force",
    "SSH-Patator": "Brute Force",

    "Web Attack � Brute Force": "Web Attack",
    "Web Attack � Sql Injection": "Web Attack",
    "Web Attack � XSS": "Web Attack",

    "Bot": "Botnet",

    "Infiltration": "Rare / Other Attack",
    "Heartbleed": "Rare / Other Attack",
}

def create_netguard_labels(df):
    """Map original CIC-IDS2017 labels to NetGuard categories."""

    df = df.copy()

    df["NetGuard_Label"] = df["Label"].map(LABEL_MAPPING)

    # Check for labels that were not mapped
    unmapped = df.loc[
        df["NetGuard_Label"].isna(),
        "Label"
    ].unique()

    if len(unmapped) > 0:
        raise ValueError(
            f"Unmapped labels found: {unmapped}"
        )

    return df


def clean_data(df):
    """Clean obvious data-quality problems."""

    df = df.copy()

    # Remove leading/trailing whitespace from column names
    df.columns = df.columns.str.strip()

    # Convert infinite numeric values to NaN
    numeric_columns = df.select_dtypes(include="number").columns

    df[numeric_columns] = df[numeric_columns].replace(
        [float("inf"), float("-inf")],
        float("nan")
    )

    # Remove duplicate rows
    before = len(df)

    df = df.drop_duplicates()

    after = len(df)

    print(f"Removed {before - after:,} duplicate rows.")

    return df

def split_features_target(df):
    """Separate features from target and create a stratified train/test split."""

    X = df.drop(columns=["Label", "NetGuard_Label"])

    y = df["NetGuard_Label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    return X_train, X_test, y_train, y_test

# def inspect_labels(df):
#     """Display the exact labels present in the dataset."""

#     print("\n" + "=" * 60)
#     print("UNIQUE LABELS")
#     print("=" * 60)

#     for label in sorted(df["Label"].unique()):
#         print(repr(label))


if __name__ == "__main__":

    print("Loading CIC-IDS2017 dataset...")

    df = load_raw_data()

    print(f"Original shape: {df.shape}")

    df = clean_data(df)

    print(f"Cleaned shape: {df.shape}")

    df = create_netguard_labels(df)

    print("\nOriginal NetGuard label distribution:")
    print(df["NetGuard_Label"].value_counts())

    X, y = prepare_dataset(df)

    print("\n" + "=" * 60)
    print("PRODUCTION DATASET")
    print("=" * 60)

    print(f"Features: {X.shape}")
    print(f"Target  : {y.shape}")

    print("\nFinal class distribution:")
    print(y.value_counts())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print("\n" + "=" * 60)
    print("TRAIN / TEST SPLIT")
    print("=" * 60)

    print(f"X_train: {X_train.shape}")
    print(f"X_test : {X_test.shape}")
    print(f"y_train: {y_train.shape}")
    print(f"y_test : {y_test.shape}")

    preprocessor = create_preprocessor(X_train)

    print("\n" + "=" * 60)
    print("PREPROCESSOR")
    print("=" * 60)

    print("Numerical features:", len(X_train.columns))
    print("Strategy: median imputation")