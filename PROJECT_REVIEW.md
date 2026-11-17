# NetGuard review — 17 November 2026

The saved model reproduces the documented benchmark, but neither that benchmark nor
the application checks establish that every future prediction will be correct.
The model artifacts were evaluated as supplied; they were not retrained or replaced.

## Measured prediction results

Local preprocessing produced 2,522,315 flows and 78 features after removing 308,381
duplicates and excluding Infiltration and Heartbleed. Evaluation reconstructed the
existing stratified 80/20 split with seed 42 and the current CSV enumeration order.
The original training row manifest is absent, so exact holdout independence cannot
be proven. The development scripts also reuse this split for model comparison.

| Metric | Result |
| --- | ---: |
| Test flows | 504,463 |
| Accuracy | 99.9066% |
| Macro F1 | 96.6104% |
| Weighted F1 | 99.9086% |
| Incorrect classifications | 471 |
| Botnet precision | 73.1313% |
| Botnet recall | 92.8205% |
| Botnet F1 | 81.8079% |

Of 390 actual Botnet test flows, 362 were detected and 28 were classified Normal.
133 actual Normal flows were classified Botnet. This is the clearest class-specific
weakness hidden by the overall accuracy. Two of the 20 bundled Botnet demo samples
(zero-based indices 11 and 17) are also classified Normal. Demo samples were drawn
from the full raw data and are not an independent accuracy benchmark.

The machine-readable report is `ml/models/evaluation_report.json`. It contains
per-class precision/recall/F1, the confusion matrix, limitations, and SHA-256 hashes
of the four serving artifacts. The metadata API suppresses metrics when the files
no longer match those hashes. Restart the API whenever replacing model artifacts.

## Implemented and repaired

- Strict finite numeric request validation, rejection of unexpected envelope fields,
  model/schema consistency checks, and probability sanity checks.
- NaN/Infinity validation now returns a JSON 422 response instead of crashing during
  error serialization. Unknown/missing features return 400; internal failures use 500.
- Repaired two infinite values in one bundled Botnet flow using the fitted training
  medians. Future sample generation uses the same imputer and emits strict JSON.
- API health display now polls the backend instead of always claiming it is online.
- Dashboard metrics and class counts come from the measured report. Recent results
  come from actual analyses in the current browser; fabricated rows were removed.
- Model Lab displays per-class metrics, confusion matrix, and evaluation limitations.
- Dataset Explorer displays class/sample counts and searchable sample feature tables.
  It is a curated sample inspector, not a browser for every raw CSV row.
- History stores up to 500 analyses in the current browser, supports search/risk
  filtering and CSV export, and can be cleared. It is not a shared server audit log.
- Settings saves the API endpoint and tests the saved connection. Server CORS must
  allow the frontend origin; changing this setting does not change CORS or risk policy.
- Analysis clears stale results after feature edits, handles API validation messages,
  stores successful predictions, and labels global importances accurately. They are
  not individual explanations or causal contributions.

## Verification and remaining limits

- Eight HTTP integration tests exercise the real API and saved artifacts, including
  every one of the 120 sample flows, all six sample endpoints, probability/risk
  consistency, feature ordering, frontend/schema agreement, invalid values, and CORS.
- Five frontend client tests cover persistence, the 500-entry bound, corrupted storage,
  endpoint configuration, request payloads, and server/network errors.
- TypeScript/Vite production build and ESLint checks pass. Vite warns about a large
  JavaScript bundle; route splitting remains an optimization opportunity.
- Browser UI verification could not be completed: the available browser could not
  connect to the workspace's local preview. Click paths, responsive layout, and actual
  browser CSV downloads therefore still require end-to-end verification.
- Existing test JSON files may represent synthetic flows; their names are not ground
  truth. Generated flow labels are reference labels, not promises of model output.
- There is no packet capture, PCAP-to-feature conversion, shared history database,
  authentication, alert delivery, or calibrated uncertainty/review policy implemented.

## Recommended next work, in priority order

1. Establish an untouched external test set and save exact row/source manifests plus
   artifact/library versions during training. Add capture/session/time-aware validation
   with explicit class coverage. Keep tuning separate from the final test set. See
   [scikit-learn's data leakage guidance](https://scikit-learn.org/stable/common_pitfalls.html).
2. Investigate Botnet errors with packet/flow context and subtype-level reports. Tune
   class weights and decision policies against precision/recall targets using validation
   data, then measure on the untouched test set before replacing the serving model.
3. Calibrate probabilities on a separate validation set and measure reliability, log
   loss, and false-alarm rates. Add a review state only after validating its threshold;
   high confidence alone does not detect unfamiliar attacks. See
   [scikit-learn's calibration guide](https://scikit-learn.org/stable/modules/calibration.html).
4. Add batch CSV ingestion with schema/unit validation and bounded upload sizes. For
   PCAP/live capture, verify feature extraction matches training units, directions,
   timeout rules, and sentinel conventions before feeding the model.
5. Add SQLite/PostgreSQL prediction history with model version and source provenance;
   then implement authenticated access, alerts, retention, and monitoring as needed.
6. Add per-flow SHAP explanations with latency checks, CI for the current tests, browser
   end-to-end tests, containerized startup, and input drift monitoring.

## Reproduce checks (PowerShell from repository root)

```powershell
.\backend\venv\Scripts\python.exe -m unittest discover -s backend/tests -v
.\backend\venv\Scripts\python.exe ml/src/evaluate_final.py --no-plot
cd frontend
npm test
npm run build
npm run lint
```

Use your own activated environment if the local `backend/venv` does not exist.
The headless evaluator needs only the backend's ML dependencies; plotting is optional.
Frontend client tests require Node 22.6+ for TypeScript stripping (verified on 22.14).
