from setuptools import setup, find_packages

setup(
    name="ml_service",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "pydantic",
        "pandas",
        "numpy",
        "xgboost",
        "joblib",
        "scikit-learn",
    ],
)