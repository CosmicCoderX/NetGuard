from pathlib import Path
import json
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DIR = PROJECT_ROOT / "ml" / "data" / "raw" / "MachineLearningCVE"
OUTPUT_DIR = PROJECT_ROOT / "ml" / "data" / "processed"
OUTPUT_PATH = OUTPUT_DIR / "sample_flows.json"


CLASS_MAPPING = {
    "BENIGN": "Normal",
    "DoS Hulk": "DoS / DDoS",
    "DDoS": "DoS / DDoS",
    "DoS GoldenEye": "DoS / DDoS",
    "DoS slowloris": "DoS / DDoS",
    "DoS Slowhttptest": "DoS / DDoS",
    "PortScan": "Port Scanning",
    "FTP-Patator": "Brute Force",
    "SSH-Patator": "Brute Force",
    "Web Attack � Brute Force": "Web Attack",
    "Web Attack � XSS": "Web Attack",
    "Web Attack � Sql Injection": "Web Attack",
    "Bot": "Botnet",
}


TARGET_PER_CLASS = 20


def load_csv_files():

    csv_files = sorted(RAW_DIR.glob("*.csv"))

    print(f"Found {len(csv_files)} CSV files.")

    frames = []

    for csv_file in csv_files:

        print(f"Reading: {csv_file.name}")

        df = pd.read_csv(csv_file, low_memory=False)

        df.columns = df.columns.str.strip()

        frames.append(df)

    return pd.concat(frames, ignore_index=True)


def create_sample_dataset():

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = load_csv_files()

    print(f"Loaded {len(df):,} total rows.")

    df["ProductionClass"] = df["Label"].map(CLASS_MAPPING)

    df = df.dropna(subset=["ProductionClass"])

    feature_columns = [
        column
        for column in df.columns
        if column not in ["Label", "ProductionClass"]
    ]

    print(f"Feature count: {len(feature_columns)}")

    samples = {}

    for production_class in CLASS_MAPPING.values():

        if production_class in samples:
            continue

        class_df = df[df["ProductionClass"] == production_class]

        sample = class_df.sample(
            n=min(TARGET_PER_CLASS, len(class_df)),
            random_state=42,
        )

        records = []

        for _, row in sample.iterrows():

            features = {}

            for feature in feature_columns:

                value = row[feature]

                if pd.isna(value):
                    value = 0.0

                features[feature] = float(value)

            records.append(features)

        samples[production_class] = records

        print(
            f"{production_class}: "
            f"{len(records)} samples"
        )

    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            samples,
            file,
            indent=2,
        )

    print()
    print(f"Saved sample dataset to:")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    create_sample_dataset()