#!/usr/bin/env python3
"""
Model Training & Evaluation Pipeline
Trains and validates a supervised career fit classifier using pandas, numpy, and scikit-learn.
Saves model artifact to backend/ml/models/career_classifier.joblib.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def generate_synthetic_training_data(n_samples=500):
    np.random.seed(42)
    # Target careers (0: Frontend, 1: AI/ML, 2: DevOps, 3: Security, 4: Data, 5: Mobile)
    data = []
    for _ in range(n_samples):
        role_label = np.random.randint(0, 6)
        exp_years = np.random.exponential(scale=2.0)
        edu_tier = np.random.choice([3, 4, 5, 6], p=[0.1, 0.6, 0.25, 0.05])
        
        # Aptitude correlated with role
        logical = np.clip(np.random.normal(75, 12), 40, 100)
        quant = np.clip(np.random.normal(80 if role_label in [1, 4] else 65, 10), 40, 100)
        verbal = np.clip(np.random.normal(70, 10), 40, 100)
        analytical = np.clip(np.random.normal(85 if role_label in [1, 3] else 70, 10), 40, 100)
        prob_solving = np.clip(np.random.normal(80, 10), 40, 100)
        skill_overlap = np.clip(np.random.normal(0.75, 0.15), 0.1, 1.0)
        
        data.append([exp_years, edu_tier, logical, quant, verbal, analytical, prob_solving, skill_overlap, role_label])
        
    cols = ['exp_years', 'edu_tier', 'logical', 'quant', 'verbal', 'analytical', 'prob_solving', 'skill_overlap', 'role_label']
    return pd.DataFrame(data, columns=cols)

def train_and_save():
    df = generate_synthetic_training_data(600)
    X = df.drop(columns=['role_label'])
    y = df['role_label'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = RandomForestClassifier(n_estimators=50, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)

    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"[ML Training] Model trained successfully with accuracy: {acc * 100:.2f}%")

    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'career_classifier.joblib')
    joblib.dump(clf, model_path)
    print(f"[ML Training] Model artifact saved to: {model_path}")

if __name__ == "__main__":
    train_and_save()
