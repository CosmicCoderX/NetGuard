"""Exercise the real HTTP API and saved artifacts with standard-library tools.

Run from the repository root:
    backend/venv/Scripts/python.exe -m unittest discover -s backend/tests -v
"""
import json
import math
import re
from pathlib import Path
import socket
import subprocess
import sys
import time
import unittest
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        cls.base = f"http://127.0.0.1:{port}"
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", str(port)],
            cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        cls.addClassCleanup(cls.stop_server)
        deadline = time.monotonic() + 60
        while time.monotonic() < deadline:
            if cls.server.poll() is not None:
                raise RuntimeError("API failed to start")
            try:
                cls.request("/health")
                break
            except (URLError, TimeoutError):
                time.sleep(0.25)
        else:
            raise RuntimeError("API startup timed out")
        cls.samples = json.loads((ROOT / "ml/data/processed/sample_flows.json").read_text())
        cls.example = dict(cls.samples["Normal"][0])

    @classmethod
    def stop_server(cls):
        cls.server.terminate()
        cls.server.wait(timeout=10)

    @classmethod
    def request(cls, path, body=None, headers=None, method=None):
        request = Request(cls.base + path,
                          data=json.dumps(body).encode() if body is not None else None,
                          headers={"Content-Type": "application/json", **(headers or {})}, method=method)
        try:
            with urlopen(request, timeout=30) as response:
                return response.status, json.load(response), response.headers
        except HTTPError as error:
            return error.code, json.load(error), error.headers

    def test_health_and_metadata(self):
        status, health, _ = self.request("/health")
        self.assertEqual(status, 200)
        self.assertTrue(health["model_loaded"])
        status, meta, _ = self.request("/metadata")
        self.assertEqual(status, 200)
        self.assertEqual(len(meta["features"]), 78)
        self.assertEqual(set(meta["classes"]), set(self.samples))
        self.assertEqual(meta["sample_counts"], {key: len(value) for key, value in self.samples.items()})
        if meta["evaluation"]:
            report = meta["evaluation"]
            self.assertEqual(sum(map(sum, report["confusion_matrix"])), report["test_rows"])
            if "comparison" in report:
                self.assertGreaterEqual(len(report["comparison"]), 3)
                self.assertEqual(meta["model"], report["model_name"])
                selected = [row for row in report["comparison"] if row["selected"]]
                self.assertEqual(len(selected), 1)
                self.assertEqual(selected[0]["name"], report["model_name"])
                for row in report["comparison"]:
                    for metric in ("accuracy", "macro_precision", "macro_f1"):
                        self.assertTrue(0 <= row["test"][metric] <= 1)

    def test_all_demo_flows_return_consistent_predictions(self):
        mismatches = []
        for label, samples in self.samples.items():
            for index, sample in enumerate(samples):
                with self.subTest(label=label, index=index):
                    status, result, _ = self.request("/predict", {"features": sample})
                    self.assertEqual(status, 200, result)
                    probs = result["probabilities"]
                    self.assertEqual(set(probs), set(self.samples))
                    self.assertTrue(all(math.isfinite(p) and 0 <= p <= 1 for p in probs.values()))
                    self.assertAlmostEqual(sum(probs.values()), 1, places=5)
                    self.assertEqual(result["prediction"], max(probs, key=probs.get))
                    self.assertAlmostEqual(result["confidence"], probs[result["prediction"]])
                    expected_risk = "Low" if result["prediction"] == "Normal" else "High" if result["prediction"] in ["DoS / DDoS", "Port Scanning"] else "Critical"
                    self.assertEqual(result["risk_level"], expected_risk)
                    self.assertEqual(len(result["feature_importances"]), 10)
                    if result["prediction"] != label:
                        mismatches.append({"actual": label, "index": index, "predicted": result["prediction"]})
        print(f"\nDemo flows: {sum(map(len, self.samples.values()))}; label mismatches: {mismatches}")

    def test_sample_endpoint_all_classes(self):
        for label in self.samples:
            status, sample, _ = self.request("/sample?" + urlencode({"traffic_type": label}))
            self.assertEqual(status, 200)
            self.assertEqual(sample["traffic_type"], label)
            self.assertEqual(set(sample["features"]), set(self.example))
        self.assertEqual(self.request("/sample?traffic_type=Unknown")[0], 404)
        self.assertEqual(self.request("/sample")[0], 422)

    def test_missing_and_unknown_features(self):
        for features in ({}, {**self.example, "unknown": 1}, {k: v for k, v in self.example.items() if k != "Destination Port"}):
            self.assertEqual(self.request("/predict", {"features": features})[0], 400)

    def test_invalid_values(self):
        for value in (True, "80", None, float("nan"), float("inf"), -float("inf"), [], {}):
            with self.subTest(value=repr(value)):
                status, _, _ = self.request("/predict", {"features": {**self.example, "Destination Port": value}})
                self.assertEqual(status, 422)
        self.assertEqual(self.request("/predict", {"features": self.example, "unexpected": 1})[0], 422)

    def test_feature_order_does_not_change_prediction(self):
        first = self.request("/predict", {"features": self.example})[1]
        reordered = self.request("/predict", {"features": dict(reversed(list(self.example.items())))})[1]
        self.assertEqual(first, reordered)

    def test_cors(self):
        for origin in ("http://localhost:5173", "http://127.0.0.1:5173",
                       "http://localhost:5174", "http://127.0.0.1:5174",
                       "https://netguard-1-ai4q.onrender.com"):
            with self.subTest(origin=origin):
                status, _, headers = self.request("/health", headers={"Origin": origin})
                self.assertEqual(status, 200)
                self.assertEqual(headers.get("Access-Control-Allow-Origin"), origin)
        _, _, headers = self.request("/health", headers={"Origin": "https://untrusted.example"})
        self.assertIsNone(headers.get("Access-Control-Allow-Origin"))
        origin = "https://netguard-1-ai4q.onrender.com"
        request = Request(self.base + "/predict", method="OPTIONS", headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        with urlopen(request, timeout=10) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), origin)
            self.assertIn("POST", response.headers.get("Access-Control-Allow-Methods"))

    def test_frontend_feature_names_match_artifacts(self):
        source = (ROOT / "frontend/src/data/features.ts").read_text(encoding="utf-8")
        names = re.findall(r'name:\s*"([^"]+)"', source)
        self.assertEqual(len(names), 78)
        self.assertEqual(set(names), set(self.example))


if __name__ == "__main__":
    unittest.main()
