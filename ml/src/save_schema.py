from pathlib import Path
import json

from preprocessing import (
    load_raw_data,
    clean_data,
    create_netguard_labels,
    prepare_dataset,
)


MODEL_DIR = (
    Path(__file__).resolve().parent.parent / "models"
)


def main():

    print("Loading dataset...")

    df = load_raw_data()

    df = clean_data(df)

    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    feature_names = X.columns.tolist()

    schema = {
        "num_features": len(feature_names),
        "features": feature_names,
        "classes": sorted(y.unique().tolist())
    }

    schema_path = MODEL_DIR / "netguard_schema.json"

    with open(
        schema_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            schema,
            file,
            indent=4
        )

    print("\nSchema saved to:")

    print(schema_path)

    print(
        f"\nFeatures: {len(feature_names)}"
    )

    print("\nClasses:")

    for class_name in schema["classes"]:
        print(f"- {class_name}")


if __name__ == "__main__":
    main()