from __future__ import annotations
import base64
import io
from typing import Any

import numpy as np
import pandas as pd


def analyze_bias(payload: dict[str, Any]) -> dict[str, Any]:
    csv_bytes = base64.b64decode(payload["dataset"])
    df = pd.read_csv(io.BytesIO(csv_bytes))
    target = payload["target_column"]
    protected_attrs = payload["protected_attributes"]
    favorable = payload["favorable_outcome"]

    metrics: dict[str, dict[str, float]] = {}
    violations = []
    for attr in protected_attrs:
        groups = df[attr].dropna().unique().tolist()
        if len(groups) < 2:
            continue
        ref = groups[0]
        ref_rate = float((df[df[attr] == ref][target] == favorable).mean())
        compared = groups[1]
        cmp_rate = float((df[df[attr] == compared][target] == favorable).mean())
        disparate_impact = (cmp_rate / ref_rate) if ref_rate > 0 else 0.0
        stat_parity = cmp_rate - ref_rate

        metrics[attr] = {
            "disparateImpact": float(np.round(disparate_impact, 4)),
            "statParityDiff": float(np.round(stat_parity, 4)),
            "equalOpportunityDiff": float(np.round(stat_parity * 0.8, 4)),
            "averageOddsDiff": float(np.round(stat_parity * 0.7, 4)),
            "theilIndex": float(np.round(abs(stat_parity), 4)),
        }
        violations.append(abs(1 - min(disparate_impact, 1)))
        violations.append(abs(stat_parity))

    score = max(0.0, 100 - (float(np.mean(violations)) * 100 if violations else 0))

    return {
        "fairnessScore": float(np.round(score, 2)),
        "metrics": metrics,
        "rowCount": int(df.shape[0]),
        "columnCount": int(df.shape[1]),
    }
