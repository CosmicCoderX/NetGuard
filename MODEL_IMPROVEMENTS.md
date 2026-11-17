# Model and dashboard enhancements

This update adds a measured model comparison and explains the purpose of the dashboard in plain language. The original model bundle remains available for rollback.

## What changed in model development

- Added a reproducible 60/20/20 training, validation, and test split using seeds 2026 and 2027.
- Removed repeated feature vectors and excluded vectors carrying conflicting class labels before splitting. This prevents identical feature vectors crossing partitions.
- Fitted the median imputer only on training data.
- Compared a refitted XGBoost baseline, refined XGBoost, and Random Forest on the same partitions.
- Refined XGBoost reduces the class-weight exponent from 0.5 to 0.25 to reduce minority-class overprediction. It uses 450 trees, learning rate 0.08, depth 9, minimum child weight 3, L2 penalty 3, and L1 penalty 0.1.
- Selected the winner using the mean of validation macro F1 and macro precision. Test scores are reported after selection and are not used to select the model.
- Saved row-signature split manifests, model/preprocessor/encoder/schema hashes, dependency versions, source file information, training times, and inference timings.
- Added tests for partition separation, artifact integrity, and validation-only selection.

The refitted baseline uses the existing XGBoost recipe: 300 trees, depth 8, learning rate 0.1, and square-root class weights. The prior serving model was trained on a different split; its historical scores should not be treated as an apples-to-apples baseline for this experiment.

## Dashboard additions

- **Why NetGuard:** a visual three-step card connects understanding traffic, recognizing patterns, and supporting human review.
- **Why explanations:** purpose cards explain the overview metrics, traffic imbalance, model comparison, recent predictions, analysis inputs/results, probabilities, feature importances, dataset samples, per-class evaluation, confusion matrix, limitations, history, and connection settings.
- **Model comparison:** grouped bars show test accuracy, macro precision, and macro F1 on a fixed 0–100% scale. The accessible table supplies exact scores and median single-flow classifier latency. A results paragraph describes changes relative to the refitted baseline.
- The chart appears on Overview and Model Lab, with consistent sky/violet/emerald colors, dark panels, legends, tooltips, and plain-language definitions.

## Reproduce

Run from the repository root in PowerShell:

```powershell
.\backend\venv\Scripts\python.exe -u ml/src/improve_model.py
.\backend\venv\Scripts\python.exe -m unittest discover -s ml/src -p test_improvement.py -v
.\backend\venv\Scripts\python.exe ml/src/activate_model.py
.\backend\venv\Scripts\python.exe -m unittest discover -s backend/tests -v
cd frontend
npm test
npm run build
npm run lint
```

Restart the API after activation. To return to the preserved original model:

```powershell
.\backend\venv\Scripts\python.exe ml/src/activate_model.py --rollback
```

Then restart the API again. The original evaluator (`evaluate_final.py`) still evaluates the original bundle and split; use `improve_model.py` for this experiment.

## Interpretation limits

These are internal CIC-IDS2017 results, not external network validation. The dataset is heavily imbalanced. Macro scores give every category equal weight. Infiltration and Heartbleed remain excluded; probabilities remain uncalibrated. Single-flow timings exclude preprocessing, transport, and UI time. No model can guarantee correct predictions for every flow.

## Measured results

Evaluated at: 2026-11-17T19:27:28.975210+00:00.

Train: 1,512,551; validation: 504,184; test: 504,184.
Additional duplicate/conflicting feature rows excluded: 1,396.

| Model | Test accuracy | Macro precision | Macro F1 | Median inference | Training |
| --- | ---: | ---: | ---: | ---: | ---: |
| XGBoost baseline | 99.9355% | 95.5792% | 96.9428% | 1.401 ms | 359.0 s |
| XGBoost refined (selected) | 99.9385% | 96.2282% | 97.2084% | 2.545 ms | 839.7 s |
| Random Forest | 99.8746% | 92.0095% | 94.1280% | 38.769 ms | 179.4 s |

Selected by validation only: **XGBoost refined**.

Changes relative to the refitted baseline on the same test partition:

- Accuracy: +0.0030 percentage points.
- Macro Precision: +0.6490 percentage points.
- Macro F1: +0.2656 percentage points.
- Single-flow classifier latency: +1.144 ms. Timings vary by hardware and load.

### Selected-model per-class test results

| Class | Precision | Recall | F1 | Test flows |
| --- | ---: | ---: | ---: | ---: |
| Botnet | 78.73% | 91.82% | 84.77% | 391 |
| Brute Force | 99.95% | 99.89% | 99.92% | 1,830 |
| DoS / DDoS | 99.91% | 99.96% | 99.93% | 64,326 |
| Normal | 99.99% | 99.95% | 99.97% | 419,157 |
| Port Scanning | 99.51% | 99.93% | 99.72% | 18,051 |
| Web Attack | 99.30% | 98.60% | 98.95% | 429 |

The original trained artifacts remain unchanged. The activated model is loaded from `ml/models/validated/`.

## Final verification

- 3 model integrity/provenance tests passed.
- 8 real HTTP API tests passed against the activated model, including all 120 demo flows; one Botnet sample (index 17) was classified Normal.
- 5 frontend client tests, TypeScript/Vite build, and ESLint passed.
- Browser smoke checks verified the purpose card, section explanations, sample loading, prediction, history persistence, connection test, and live comparison scores.
- The running API reports XGBoost refined and serves all three measured comparison records.
