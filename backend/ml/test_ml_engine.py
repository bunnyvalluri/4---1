#!/usr/bin/env python3
"""
Python Machine Learning Test Suite
Verifies:
1. Feature extraction with pandas and numpy
2. TF-IDF vectorization and cosine similarity
3. Ranking behavior across multiple distinct personas
4. Factor attribution and explainability scores
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import unittest
import numpy as np
import pandas as pd
from career_recommender import PythonCareerRecommender

class TestPythonMLEngine(unittest.TestCase):
    def setUp(self):
        self.recommender = PythonCareerRecommender()
        self.careers = [
            {
                "id": "c_fe",
                "title": "Frontend Developer",
                "category": "Software Engineering",
                "overview": "Build modern responsive web applications using JavaScript, TypeScript, and React.",
                "skills": [
                    {"skill": {"name": "JavaScript"}, "isRequired": True},
                    {"skill": {"name": "TypeScript"}, "isRequired": True},
                    {"skill": {"name": "React.js"}, "isRequired": True},
                ],
                "aptitudeReqs": {"LOGICAL": 75, "QUANTITATIVE": 60, "VERBAL": 70, "ANALYTICAL": 75, "PROBLEM_SOLVING": 80}
            },
            {
                "id": "c_ai",
                "title": "AI / Machine Learning Engineer",
                "category": "Artificial Intelligence & Data",
                "overview": "Design deep neural networks, train transformers, and deploy scalable ML models with PyTorch and Python.",
                "skills": [
                    {"skill": {"name": "Python"}, "isRequired": True},
                    {"skill": {"name": "Machine Learning"}, "isRequired": True},
                    {"skill": {"name": "PyTorch"}, "isRequired": True},
                ],
                "aptitudeReqs": {"LOGICAL": 85, "QUANTITATIVE": 90, "VERBAL": 70, "ANALYTICAL": 90, "PROBLEM_SOLVING": 95}
            },
            {
                "id": "c_sec",
                "title": "Cybersecurity Analyst",
                "category": "Security & Operations",
                "overview": "Implement network defense, threat intelligence, and vulnerability assessments.",
                "skills": [
                    {"skill": {"name": "Network Security"}, "isRequired": True},
                    {"skill": {"name": "Cryptography"}, "isRequired": True},
                ],
                "aptitudeReqs": {"LOGICAL": 80, "QUANTITATIVE": 70, "VERBAL": 70, "ANALYTICAL": 85, "PROBLEM_SOLVING": 85}
            }
        ]

    def test_frontend_persona(self):
        candidate = {
            "name": "Sarah Chen",
            "degree": "B.S. in Computer Science",
            "skills": [{"name": "JavaScript"}, {"name": "TypeScript"}, {"name": "React.js"}],
            "interests": ["Frontend Architecture", "Web Design"],
            "preferredRoles": ["Frontend Developer"],
            "aptitudeScores": {
                "categoryScores": {"LOGICAL": 80, "QUANTITATIVE": 65, "VERBAL": 75, "ANALYTICAL": 80, "PROBLEM_SOLVING": 85}
            }
        }
        results = self.recommender.rank_careers(candidate, self.careers)
        self.assertEqual(results[0]["title"], "Frontend Developer", "Frontend candidate should rank Frontend Developer #1")
        self.assertGreaterEqual(results[0]["matchScore"], 80)
        self.assertTrue(len(results[0]["factors"]) >= 5, "Exposes explainable contributing factor breakdown")

    def test_ai_ml_persona(self):
        candidate = {
            "name": "Marcus Vance",
            "degree": "M.S. in Data Science",
            "skills": [{"name": "Python"}, {"name": "Machine Learning"}, {"name": "PyTorch"}, {"name": "TensorFlow"}],
            "interests": ["Artificial Intelligence", "Deep Learning"],
            "preferredRoles": ["AI / Machine Learning Engineer"],
            "aptitudeScores": {
                "categoryScores": {"LOGICAL": 90, "QUANTITATIVE": 92, "VERBAL": 75, "ANALYTICAL": 95, "PROBLEM_SOLVING": 95}
            }
        }
        results = self.recommender.rank_careers(candidate, self.careers)
        self.assertEqual(results[0]["title"], "AI / Machine Learning Engineer", "ML candidate should rank AI/ML Engineer #1")
        self.assertGreaterEqual(results[0]["matchScore"], 85)

    def test_explainability_factors(self):
        candidate = {
            "name": "Test User",
            "skills": [{"name": "Python"}],
            "aptitudeScores": {"categoryScores": {"LOGICAL": 70}}
        }
        results = self.recommender.rank_careers(candidate, self.careers)
        top = results[0]
        self.assertIn("factors", top)
        factor_names = [f["name"] for f in top["factors"]]
        self.assertIn("Verified Skills Overlap", factor_names)
        self.assertIn("Cognitive Aptitude Alignment", factor_names)
        self.assertIn("Semantic Domain Similarity", factor_names)

if __name__ == "__main__":
    unittest.main()
