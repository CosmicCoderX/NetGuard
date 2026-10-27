from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import f1_score

from xgboost import XGBClassifier

from preprocessing import (
    load_raw_data,
    clean_data,
    create_netguard_labels,
    prepare_dataset,
    create_preprocessor,
)


def calculate_sqrt_weights(y):
    """Calculate square-root balanced sample weights."""

    counts = pd.Series(y).value_counts()

    total = len(y)
    num_classes = len(counts)

    class_weights = {
        class_id: np.sqrt(
            total / (num_classes * count)
        )
        for class_id, count in counts.items()
    }

    return np.array([
        class_weights[class_id]
        for class_id in y
    ])


def main():

    print("Loading dataset...")

    df = load_raw_data()
    df = clean_data(df)
    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    print(f"Dataset: {X.shape}")

    # Encode target
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    # Reproducible split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.20,
        random_state=42,
        stratify=y_encoded,
    )

    # Smaller validation experiment
    experiment_size = 500_000

    X_train, _, y_train, _ = train_test_split(
        X_train,
        y_train,
        train_size=experiment_size,
        random_state=42,
        stratify=y_train,
    )

    print(
        f"Experiment training samples: "
        f"{len(X_train):,}"
    )

    # Preprocess
    preprocessor = create_preprocessor(X_train)

    X_train_processed = preprocessor.fit_transform(
        X_train
    )

    X_test_processed = preprocessor.transform(
        X_test
    )

    # √ balanced weights
    sample_weights = calculate_sqrt_weights(
        y_train
    )

    # Hyperparameter configurations
    configurations = [
        {
            "name": "baseline",
            "n_estimators": 300,
            "max_depth": 8,
            "learning_rate": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },
        {
            "name": "shallower",
            "n_estimators": 400,
            "max_depth": 6,
            "learning_rate": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },
        {
            "name": "deeper",
            "n_estimators": 300,
            "max_depth": 10,
            "learning_rate": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },
        {
            "name": "lower_learning_rate",
            "n_estimators": 500,
            "max_depth": 8,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },
        {
            "name": "more_subsampling",
            "n_estimators": 300,
            "max_depth": 8,
            "learning_rate": 0.1,
            "subsample": 0.7,
            "colsample_bytree": 0.7,
        },
    ]

    results = []

    for config in configurations:

        print("\n" + "=" * 60)
        print(
            f"CONFIGURATION: "
            f"{config['name']}"
        )
        print("=" * 60)

        model = XGBClassifier(
            objective="multi:softprob",
            num_class=len(encoder.classes_),

            n_estimators=config["n_estimators"],
            max_depth=config["max_depth"],
            learning_rate=config["learning_rate"],

            subsample=config["subsample"],
            colsample_bytree=config["colsample_bytree"],

            tree_method="hist",
            eval_metric="mlogloss",

            random_state=42,
            n_jobs=-1,
        )

        print("Training...")

        model.fit(
            X_train_processed,
            y_train,
            sample_weight=sample_weights,
            verbose=False,
        )

        print("Predicting...")

        predictions = model.predict(
            X_test_processed
        )

        predictions = predictions.astype(int).ravel()

        macro_f1 = f1_score(
            y_test,
            predictions,
            average="macro",
        )

        weighted_f1 = f1_score(
            y_test,
            predictions,
            average="weighted",
        )

        results.append({
            "configuration": config["name"],
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
        })

        print(
            f"Macro F1    : {macro_f1:.4f}"
        )

        print(
            f"Weighted F1 : {weighted_f1:.4f}"
        )

    comparison = pd.DataFrame(results)

    print("\n" + "=" * 60)
    print("HYPERPARAMETER COMPARISON")
    print("=" * 60)

    print(
        comparison.sort_values(
            "macro_f1",
            ascending=False
        ).to_string(index=False)
    )


if __name__ == "__main__":
    main()