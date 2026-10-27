# NetGuard 🛡️ — AI-Powered Network Intrusion Detection System

<p align="center">
  <img src="frontend/src/assets/hero.png" alt="NetGuard Banner" width="700" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.4);" />
</p>

<p align="center">
  <strong>Next-generation network threat detection and cybersecurity intelligence powered by Machine Learning (XGBoost) and modern web telemetry.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Under%20Active%20Development-orange?style=for-the-badge&logo=git" alt="Status" />
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/XGBoost-3.4-EB4034?style=for-the-badge" alt="XGBoost" />
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Project Progress & Roadmap](#-project-progress--roadmap)
- [Key Features](#-key-features)
- [Threat Classification Scope](#-threat-classification-scope)
- [Machine Learning Performance](#-machine-learning-performance)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. ML Pipeline & Retraining (Optional)](#3-ml-pipeline--retraining-optional)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**NetGuard** is an end-to-end intelligent intrusion detection system (NIDS) designed to protect modern computer networks against malicious intrusions, reconnaissance probes, volumetric attacks, and automated exploit tooling.

Trained on over **2.52 Million network flows** from the Canadian Institute for Cybersecurity (**CIC-IDS2017**) benchmark, NetGuard analyzes network flow telemetry across **78 distinct traffic features** (such as inter-arrival times, packet distributions, header flags, flow durations, and window sizes) to deliver millisecond-level threat classifications, confidence scoring, and risk categorization.

---

## 📊 Project Progress & Roadmap

> [!NOTE]
> NetGuard is currently **under active development**. Core ML pipelines, backend inference APIs, and primary dashboard capabilities are operational, while extended modules (real-time packet sniffers, history logging, and advanced analytics) are being rolled out.

### Development Status Tracker

| Phase | Component / Feature | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Phase 1** | **Dataset Preprocessing & Cleaning** | ✅ Completed | Preprocessing pipeline handling 2.52M flows, cleaning infinite values and median imputation. |
| **Phase 2** | **ML Model Engineering & Tuning** | ✅ Completed | Trained and tuned Random Forest & XGBoost. XGBoost achieved **99.91% accuracy**. |
| **Phase 3** | **Model Serialization & Schemas** | ✅ Completed | Joblib export for models, label encoders, preprocessors, and JSON feature schemas. |
| **Phase 4** | **Backend Inference API (FastAPI)** | ✅ Completed | REST API with `/predict`, `/sample`, `/health` endpoints and CORS middleware. |
| **Phase 5** | **Frontend: Overview Dashboard** | ✅ Completed | Real-time security metrics, KPI cards, threat distribution, and model benchmark cards. |
| **Phase 6** | **Frontend: Analyze Traffic Page** | ✅ Completed | Interactive flow telemetry generator, manual inspection, risk badges, and top-10 feature explainability. |
| **Phase 7** | **Frontend: Model Lab Page** | 🔄 In Progress | Model comparison playground, ROC curves, confusion matrices, and metrics deep dive. |
| **Phase 8** | **Frontend: Dataset Explorer** | 🔄 In Progress | Interactive CIC-IDS2017 dataset browser, class balance inspector, and raw flow telemetry table. |
| **Phase 9** | **Frontend: Threat History & Audit Logs** | 🔄 In Progress | Historical threat log table, timestamp search, risk-level filters, and CSV export. |
| **Phase 10**| **Frontend: Settings & Threshold Config** | 🔄 In Progress | User preferences, custom API endpoint targeting, and risk threshold adjustments. |
| **Phase 11**| **Live Network Sniffing & PCAP Ingestion**| ⏳ Planned | Scapy / libpcap live packet capture to flow converter for direct interface monitoring. |
| **Phase 12**| **Alerting & Notification Engine** | ⏳ Planned | Webhooks (Slack/Discord), syslog export, and automated email alerts for Critical threats. |
| **Phase 13**| **Containerization & Cloud Deployment** | ⏳ Planned | Docker Compose bundle for backend, frontend, and automated health checks. |

---

## 🚀 Key Features

- **⚡ Millisecond Threat Inference**: Highly optimized XGBoost inference pipeline capable of real-time classification.
- **🎯 6-Class Deep Threat Taxonomy**: Categorizes traffic into Normal or 5 prominent cyberattack archetypes.
- **🔍 Explainable AI (XAI)**: Returns top 10 contributing feature importances for every prediction to assist security analysts in root-cause investigation.
- **🧪 Interactive Attack Simulator**: Pre-loaded with realistic sample traffic flows (Normal, DoS/DDoS, Port Scanning, Brute Force, Web Attacks, Botnets) to test detection without live exploits.
- **🛡️ Risk Categorization**: Dynamically assigns risk posture (`Low`, `High`, `Critical`) along with granular class-by-class probability distribution.
- **✨ High-Performance Modern UI**: Cyberpunk-inspired dark UI built with React 19, Tailwind CSS v4, Lucide icons, and Recharts.

---

## 🎯 Threat Classification Scope

NetGuard groups real-world network intrusions from the CIC-IDS2017 dataset into 6 consolidated classifications:

| Category | Associated Attack Vectors & Signatures | Default Risk Level |
| :--- | :--- | :---: |
| **Normal** | Legitimate user, server, and background network traffic (BENIGN). | <span style="color:#22c55e;">**Low**</span> |
| **DoS / DDoS** | DoS Hulk, DDoS, DoS GoldenEye, DoS Slowhttptest, DoS Slowloris. | <span style="color:#f59e0b;">**High**</span> |
| **Port Scanning** | Systematic port enumeration, Nmap reconnaissance sweeps, host discovery. | <span style="color:#f59e0b;">**High**</span> |
| **Brute Force** | Automated credential stuffing, SSH-Patator, FTP-Patator dictionary attacks. | <span style="color:#ef4444;">**Critical**</span> |
| **Web Attack** | SQL Injections (SQLi), Cross-Site Scripting (XSS), Web Brute Force logins. | <span style="color:#ef4444;">**Critical**</span> |
| **Botnet** | Command & Control (C2) beacons, ARES botnet infections, zombie node queries. | <span style="color:#ef4444;">**Critical**</span> |

---

## 🧠 Machine Learning Performance

The models were evaluated against an independent stratified test partition of the CIC-IDS2017 dataset:

| Model Architecture | Accuracy | Macro F1-Score | Inference Latency | Production Status |
| :--- | :---: | :---: | :---: | :---: |
| **XGBoost (Champion)** | **99.91%** | **96.61%** | **~2.8 ms** | 🏆 **Production Model** |
| Random Forest | 99.88% | 96.00% | ~8.4 ms | Evaluated |
| Logistic Regression (Baseline) | — | — | — | In Roadmap |

### Key Flow Features
The model leverages critical network flow indicators including:
- `Destination Port`, `Flow Duration`
- `Total Fwd Packets`, `Total Backward Packets`
- `Fwd Packet Length Max/Mean/Std`, `Bwd Packet Length Max/Mean/Std`
- `Flow IAT Mean/Std/Max`, `Fwd IAT Total/Mean`, `Bwd IAT Total/Mean`
- `FIN/SYN/RST/PSH/ACK/URG` Flag counts
- `Init_Win_bytes_forward`, `Init_Win_bytes_backward`
- `Active Mean/Max`, `Idle Mean/Max`

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client / Analyst Interface"]
        UI["React 19 + Vite Dashboard"]
        Inspector["Traffic Flow Inspector"]
        Presets["Sample Attack Generator"]
    end

    subgraph API ["FastAPI Application (Port 8000)"]
        Router["FastAPI Endpoint Router"]
        Validate["Pydantic Schema Validation"]
        SampleStore["Sample Flow Store (sample_flows.json)"]
    end

    subgraph MLEngine ["ML Inference Engine"]
        Imputer["Scikit-Learn Preprocessor (Median Imputer)"]
        XGB["XGBoost Classification Engine"]
        Encoder["Label Encoder"]
        Explainer["Feature Importance & Risk Evaluator"]
    end

    Presets -->|GET /sample?traffic_type=...| Router
    Router --> SampleStore
    SampleStore -->|Mock Flow Telemetry| Inspector

    Inspector -->|POST /predict (78 Features)| Router
    Router --> Validate
    Validate --> Imputer
    Imputer --> XGB
    XGB --> Encoder
    Encoder --> Explainer
    Explainer -->|Prediction, Risk Level, Probabilities| UI
```

---

## 📂 Repository Structure

```text
NetGuard/
├── backend/                        # FastAPI REST service
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py               # Paths to models, schemas, and datasets
│   │   ├── main.py                 # FastAPI application and route handlers
│   │   ├── model.py                # Model loader, preprocessing, inference logic
│   │   └── schemas.py              # Pydantic request and response models
│   └── requirements.txt            # Backend Python dependencies
│
├── frontend/                       # React 19 + TypeScript + Tailwind CSS UI
│   ├── public/                     # Icons, SVGs, static assets
│   ├── src/
│   │   ├── assets/                 # Graphics and brand assets
│   │   ├── components/             # Reusable UI components
│   │   │   ├── charts/             # TrafficDistribution, ModelPerformance charts
│   │   │   ├── layout/             # Sidebar, TopBar navigation
│   │   │   └── ui/                 # Buttons, badges, and cards
│   │   ├── data/                   # Feature definitions and groups (features.ts)
│   │   ├── pages/
│   │   │   ├── Overview.tsx        # High-level threat intelligence dashboard
│   │   │   ├── AnalyzeTraffic.tsx  # Interactive telemetry inspector & classifier
│   │   │   ├── ModelLab.tsx        # [In Progress] Model comparison lab
│   │   │   ├── Dataset.tsx         # [In Progress] Dataset explorer
│   │   │   ├── History.tsx         # [In Progress] Threat history and alerts
│   │   │   └── Settings.tsx        # [In Progress] User and threshold settings
│   │   ├── App.tsx                 # Route declarations and layout shell
│   │   └── main.tsx                # Application entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── ml/                             # Machine learning research and pipelines
│   ├── data/
│   │   ├── processed/
│   │   │   └── sample_flows.json   # Curated sample flows for interactive testing
│   │   └── raw/                    # CIC-IDS2017 CSV captures (gitignored)
│   ├── models/
│   │   ├── netguard_final_xgboost.joblib          # Production XGBoost model
│   │   ├── netguard_final_preprocessor.joblib     # Preprocessor pipeline
│   │   ├── netguard_final_label_encoder.joblib    # Label encoder
│   │   └── netguard_schema.json                   # 78-feature schema definition
│   ├── src/
│   │   ├── compare_models.py       # Benchmark evaluation script
│   │   ├── create_sample_dataset.py# Extracts representative samples
│   │   ├── evaluate_final.py       # Metrics, confusion matrix, classification report
│   │   ├── preprocessing.py        # Data cleaning and pipeline definitions
│   │   ├── save_schema.py          # Serializes JSON schema
│   │   ├── train_final.py          # Final production training script
│   │   └── tune_xgboost.py         # Hyperparameter tuning script
│   ├── requirements.txt            # ML Python dependencies
│   ├── test_request.json           # Sample JSON payload for Normal traffic
│   └── test_ddos_request.json      # Sample JSON payload for DDoS traffic
│
├── .gitignore                      # Git ignore configuration
└── README.md                       # Project documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**

---

### 1. Backend Setup

Open a terminal and set up the Python virtual environment:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Docs**: `http://127.0.0.1:8000/redoc`

---

### 2. Frontend Setup

In a separate terminal:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

### 3. ML Pipeline & Retraining (Optional)

To train or evaluate the models from scratch:

1. Download the [CIC-IDS2017 Dataset](https://www.unb.ca/cic/datasets/ids-2017.html) (MachineLearningCVE CSVs).
2. Place the CSV files into `ml/data/raw/MachineLearningCVE/`.
3. Activate the ML environment and execute:

```bash
cd ml
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run preprocessing and training:
python src/train_final.py

# Evaluate test accuracy and confusion matrix:
python src/evaluate_final.py
```

---

## 📡 API Reference

### 1. Root & Health

#### `GET /`
Returns service status and current model engine.

```json
{
  "name": "NetGuard",
  "status": "running",
  "model": "XGBoost"
}
```

#### `GET /health`
Returns health status: `{"status": "healthy"}`.

---

### 2. Fetch Sample Network Flow

#### `GET /sample?traffic_type={traffic_type}`
Fetches a pre-recorded, realistic network flow vector for interactive testing.

**Parameters:**
- `traffic_type`: `"Normal"` | `"DoS / DDoS"` | `"Port Scanning"` | `"Brute Force"` | `"Web Attack"` | `"Botnet"`

**Example Response:**
```json
{
  "traffic_type": "DoS / DDoS",
  "features": {
    "Destination Port": 80,
    "Flow Duration": 115201,
    "Total Fwd Packets": 4,
    "Total Backward Packets": 0,
    "Total Length of Fwd Packets": 24,
    "...": "..."
  }
}
```

---

### 3. Predict Network Flow

#### `POST /predict`
Analyzes a 78-dimensional network flow telemetry dictionary and returns threat classification, confidence, risk score, probability breakdown, and top 10 feature importances.

**Request Body:**
```json
{
  "features": {
    "Destination Port": 80,
    "Flow Duration": 115201,
    "Total Fwd Packets": 4,
    "Total Backward Packets": 0,
    "...": "..."
  }
}
```

**Response Body:**
```json
{
  "prediction": "DoS / DDoS",
  "confidence": 0.9998,
  "risk_level": "High",
  "probabilities": {
    "Normal": 0.0001,
    "DoS / DDoS": 0.9998,
    "Port Scanning": 0.0000,
    "Brute Force": 0.0000,
    "Web Attack": 0.0000,
    "Botnet": 0.0001
  },
  "feature_importances": [
    { "feature": "Destination Port", "importance": 0.1842 },
    { "feature": "Init_Win_bytes_forward", "importance": 0.1421 },
    { "feature": "Bwd Packet Length Mean", "importance": 0.1105 }
  ]
}
```

---

## 💻 Tech Stack

### Machine Learning & Data Science
- **Python 3.10+**
- **XGBoost 3.4**: Gradient-boosted decision trees for multi-class classification
- **Scikit-learn 1.9**: Feature preprocessing pipelines, metrics, and imputation
- **Pandas 3.0 & NumPy 2.5**: High-speed numerical tabular processing
- **Joblib 1.6**: Model artifact serialization

### Backend API
- **FastAPI 0.141**: Modern, asynchronous web API framework
- **Pydantic 2.13**: Data validation and type safety
- **Uvicorn 0.52**: Lightning-fast ASGI production server

### Frontend Application
- **React 19**: Modern UI library
- **TypeScript 6.0**: Strong typing and code predictability
- **Vite 8.2**: Next-generation frontend tooling and bundler
- **Tailwind CSS v4**: Utility-first responsive styling
- **Lucide React**: Vector cybersecurity iconography
- **Recharts 3.10**: Declarative data visualization charts

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are warmly welcomed!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
