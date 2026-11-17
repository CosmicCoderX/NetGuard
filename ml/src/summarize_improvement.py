"""Append measured comparison scores to the human-readable improvement notes."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main():
    report = json.loads((ROOT / 'ml/models/validated/evaluation_report.json').read_text())
    notes = ROOT / 'MODEL_IMPROVEMENTS.md'
    text = notes.read_text(encoding='utf-8').split('\n## Measured results')[0]
    text = text.replace('Measured scores and final verification are recorded below after the run completes.', '')
    lines = ['\n## Measured results', '', f'Evaluated at: {report["evaluated_at"]}.', '',
             f'Train: {report["train_rows"]:,}; validation: {report["validation_rows"]:,}; test: {report["test_rows"]:,}.',
             f'Additional duplicate/conflicting feature rows excluded: {report["additional_excluded_rows"]:,}.', '',
             '| Model | Test accuracy | Macro precision | Macro F1 | Median inference | Training |',
             '| --- | ---: | ---: | ---: | ---: | ---: |']
    selected = next(row for row in report['comparison'] if row['selected'])
    baseline = next(row for row in report['comparison'] if row['name'] == 'XGBoost baseline')
    for row in report['comparison']:
        label = row['name'] + (' (selected)' if row['selected'] else '')
        score = row['test']
        lines.append(f'| {label} | {score["accuracy"] * 100:.4f}% | {score["macro_precision"] * 100:.4f}% | {score["macro_f1"] * 100:.4f}% | {row["single_flow_ms"]:.3f} ms | {row["training_seconds"]:.1f} s |')
    lines += ['', f'Selected by validation only: **{selected["name"]}**.', '',
              'Changes relative to the refitted baseline on the same test partition:', '']
    for key in ('accuracy', 'macro_precision', 'macro_f1'):
        delta = (selected['test'][key] - baseline['test'][key]) * 100
        lines.append(f'- {key.replace("_", " ").title()}: {delta:+.4f} percentage points.')
    latency_delta = selected['single_flow_ms'] - baseline['single_flow_ms']
    lines += [f'- Single-flow classifier latency: {latency_delta:+.3f} ms. Timings vary by hardware and load.', '',
              '### Selected-model per-class test results', '',
              '| Class | Precision | Recall | F1 | Test flows |', '| --- | ---: | ---: | ---: | ---: |']
    for label in report['classes']:
        score = report['classification_report'][label]
        lines.append(f'| {label} | {score["precision"] * 100:.2f}% | {score["recall"] * 100:.2f}% | {score["f1-score"] * 100:.2f}% | {int(score["support"]):,} |')
    lines += ['', 'The original trained artifacts remain unchanged. The activated model is loaded from `ml/models/validated/`.', '']
    notes.write_text(text.rstrip() + '\n' + '\n'.join(lines), encoding='utf-8')
    print(f'Updated {notes}')


if __name__ == '__main__':
    main()
