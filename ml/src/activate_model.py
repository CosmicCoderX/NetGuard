"""Activate or roll back the validated bundle after integrity checks.

The backend reloads on Python changes; otherwise restart it after running this tool.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path


DIRECTORY = Path(__file__).resolve().parents[1] / 'models/validated'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--rollback', action='store_true', help='Use the preserved original serving artifacts.')
    args = parser.parse_args()
    marker = DIRECTORY / 'active.json'
    if args.rollback:
        marker.unlink(missing_ok=True)
        print('Original bundle selected. Restart the API.')
        return
    path = DIRECTORY / 'evaluation_report.json'
    report = json.loads(path.read_text(encoding='utf-8'))
    for name, expected in report['artifact_sha256'].items():
        if hashlib.sha256((DIRECTORY / name).read_bytes()).hexdigest() != expected:
            raise ValueError(f'Artifact hash mismatch: {name}')
    if hashlib.sha256((DIRECTORY / 'split_manifest.npz').read_bytes()).hexdigest() != report['manifest_sha256']:
        raise ValueError('Split manifest hash mismatch.')
    winner = max(report['comparison'], key=lambda record: record['selection_score'])
    if winner['name'] != report['model_name']:
        raise ValueError('Selected model does not match validation winner.')
    temporary = DIRECTORY / 'active.tmp'
    temporary.write_text(json.dumps({'model': report['model_name'],
                                    'activated_at': datetime.now(timezone.utc).isoformat(),
                                    'report_sha256': hashlib.sha256(path.read_bytes()).hexdigest()}, indent=2), encoding='utf-8')
    temporary.replace(marker)
    print(f'Activated {report["model_name"]}. Restart the API.')


if __name__ == '__main__':
    main()
