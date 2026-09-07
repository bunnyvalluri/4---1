# 📐 Composite Scoring Model Formulation

Located in `backend/app/ml/scoring.py`, the master match score is computed as:

$$\text{Composite Match Score} = (S \times 0.40) + (A \times 0.25) + (I \times 0.20) + (E \times 0.15)$$

---

## 1. Technical Skill Score ($S$)
$$S = \frac{\sum_{i} w_i \cdot \min\left(1.0, \frac{p_{user, i}}{p_{req, i}}\right)}{\sum_{i} w_i} \times 100$$
Where:
- $w_i$: Skill importance weight (multiplied by $1.5$ if the skill is strictly required).
- $p_{user, i}$: User's self-assessed proficiency ($1-5$).
- $p_{req, i}$: Career's required proficiency ($1-5$).

---

## 2. Cognitive Aptitude Score ($A$)
$$A = \text{mean}_{c} \left(\min\left(1.2, \frac{\text{Score}_{user, c}}{\text{Benchmark}_c}\right)\right) \times 80$$

---

## 3. Semantic Interest Score ($I$)
$$I = \min(100.0, \max(40.0, \cos(\mathbf{u}, \mathbf{c}) \times 120.0 + 30.0))$$
Where $\cos(\mathbf{u}, \mathbf{c})$ is the cosine distance between the candidate's profile TF-IDF vector and the career overview vector.

---

## 4. Experience Curve Score ($E$)
Evaluates years of experience against target seniority thresholds:
- **Entry-Level**: $95.0$ if $\le 3$ years, $80.0$ if $> 3$ years.
- **Mid-Level**: $90.0$ if $\ge 2$ years, else $70.0 + (\text{years} \times 10.0)$.
- **Senior-Level**: $95.0$ if $\ge 5$ years, else $50.0 + (\text{years} \times 8.0)$.
