# 📄 Resume Analysis & ATS Intelligence

## 1. Document Extraction Pipeline
Located in `backend/app/ai/resume_analyzer.py`:
- **PDF Documents**: Parsed using **PyMuPDF (`fitz`)**, extracting textual layout without loss of order.
- **DOCX Documents**: Parsed using **`python-docx`**, scanning paragraph runs and tables.

---

## 2. The 5-Point ATS Audit

### 1. Section Header Verification
Verifies presence of 4 essential sections: `Experience`, `Education`, `Skills`, and `Projects`.

### 2. Action Verb & Impact Audit
Detects weak verbs (`responsible for`, `helped with`, `worked on`) and recommends high-impact **XYZ formula** alternatives:
$$\text{Accomplished } [X] \text{ as measured by } [Y] \text{ by doing } [Z]$$

### 3. Metric Density Check
Ensures that at least $40\%$ of bullet points contain quantifiable numbers, percentages, or dollar amounts.

### 4. Skill Keyword Matching
Matches extracted tokens against the 100+ normalized platform skill taxonomy.

### 5. Composite ATS Score (0–100%)
Aggregates header integrity, metric density, keyword match, and verb strength into a single readable score.
