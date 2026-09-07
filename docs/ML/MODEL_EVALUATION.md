# 🧪 Model Evaluation & Calibration

## 1. Evaluation Methodology
The scoring model has been calibrated to ensure:
1. **Separability**: Clear distinction between ideal, adjacent, and unrelated candidate profiles.
2. **Monotonicity**: Increasing user skill proficiencies strictly increases or maintains the composite score.
3. **No Penalty for Excess Skills**: Proficiencies exceeding the requirement are capped at $1.0$ ratio, preventing inflation while rewarding mastery.
