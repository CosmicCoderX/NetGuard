"""Check the completed comparison bundle and its split provenance."""
import hashlib
import json
from pathlib import Path
import unittest

import numpy as np

DIRECTORY = Path(__file__).resolve().parents[1] / 'models/validated'


class ImprovementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads((DIRECTORY / 'evaluation_report.json').read_text())

    def test_no_feature_signature_overlap(self):
        with np.load(DIRECTORY / 'split_manifest.npz') as manifest:
            parts = [set(manifest[key].tolist()) for key in ('train', 'validation', 'test')]
            for i, first in enumerate(parts):
                for second in parts[i + 1:]:
                    self.assertFalse(first & second)
            for name in ('train', 'validation', 'test'):
                self.assertEqual(len(manifest[name]), self.report[f'{name}_rows'])

    def test_selection_uses_validation_only(self):
        records = self.report['comparison']
        self.assertGreaterEqual(len(records), 3)
        selected = [row for row in records if row['selected']]
        self.assertEqual(len(selected), 1)
        self.assertEqual(selected[0]['selection_score'], max(row['selection_score'] for row in records))
        for row in records:
            self.assertAlmostEqual(row['selection_score'], (row['validation']['macro_f1'] + row['validation']['macro_precision']) / 2)
            for value in row['test'].values():
                self.assertGreaterEqual(value, 0)
                self.assertLessEqual(value, 1)
        self.assertEqual(selected[0]['test']['accuracy'], self.report['accuracy'])

    def test_report_matches_saved_artifacts(self):
        for name, expected in self.report['artifact_sha256'].items():
            self.assertEqual(hashlib.sha256((DIRECTORY / name).read_bytes()).hexdigest(), expected)
        self.assertEqual(hashlib.sha256((DIRECTORY / 'split_manifest.npz').read_bytes()).hexdigest(), self.report['manifest_sha256'])
        self.assertEqual(sum(map(sum, self.report['confusion_matrix'])), self.report['test_rows'])


if __name__ == '__main__':
    unittest.main()
