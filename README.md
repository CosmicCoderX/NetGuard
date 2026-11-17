# NetGuard

A machine-learning dashboard for classifying network flows using **78 features** and a refined **XGBoost** model. Built with React, TypeScript, Vite, Tailwind CSS, FastAPI, and scikit-learn.

[Live dashboard](https://netguard-1-ai4q.onrender.com) · [API docs](https://netguard-6vsn.onrender.com/docs) · [One-page project brief](output/pdf/NetGuard_Project_Writeup.pdf)

## Features

- Analyze recorded samples or manually enter flow measurements.
- Classify Normal, DoS / DDoS, Port Scanning, Brute Force, Web Attack, and Botnet traffic.
- Review probabilities, risk levels, global feature importance, and model comparisons.
- Explore samples and search or export browser-local prediction history.
- Use a responsive dashboard with searchable fields and expandable help.

## Model results

Measured on **504,184 test flows** from CIC-IDS2017:

| Model | Accuracy | Macro precision | Macro F1 |
| --- | ---: | ---: | ---: |
| XGBoost baseline | 99.9355% | 95.58% | 96.94% |
| **XGBoost refined (active)** | **99.9385%** | **96.23%** | **97.21%** |
| Random Forest | 99.8746% | 92.01% | 94.13% |

The pipeline uses 2,520,919 feature-unique flows and a stratified 60/20/20 train/validation/test split. Preprocessing is fitted on training data; selection uses validation scores. The active bundle is in `ml/models/validated/`.

**Limits:** these are internal benchmark results, not external network validation. Botnet precision is 78.73%; probabilities are uncalibrated. NetGuard analyzes supplied flow data and does not capture live packets or block attacks.

## Run locally

Use **Python 3.13** and **Node.js 22.12+**. From the repository root in PowerShell:

```powershell
python -m venv backend/venv
.\backend\venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite. In **Settings**, set the API base URL to `http://127.0.0.1:8000` for local inference.

Production builds use `VITE_API_BASE_URL` when set, otherwise the deployed Render API. A saved Settings value overrides both; the backend must allow the frontend origin through CORS.

## Checks

From the repository root:

```powershell
.\backend\venv\Scripts\python.exe -m unittest discover -s backend/tests -v
cd frontend
npm test
npm run build
npm run lint
```

## More details

- [Model methodology, results, and rollback](MODEL_IMPROVEMENTS.md)
- [UI changes and performance checks](UI_REFINEMENT.md)
- [Initial project review](PROJECT_REVIEW.md)
- [Machine-readable evaluation](ml/models/validated/evaluation_report.json)

Licensed under the [MIT License](LICENSE).
