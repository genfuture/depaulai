import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Data directory
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True)

# Model configuration
LLM_MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"  # Smaller alternative: "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Scraping configuration
SCRAPING_CONFIG = {
    'CONCURRENT_REQUESTS': 16,
    'DOWNLOAD_DELAY': 1,
    'ROBOTSTXT_OBEY': True,
    'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Text processing configuration
TEXT_PROCESSING_CONFIG = {
    'CHUNK_SIZE': 1000,
    'CHUNK_OVERLAP': 200,
    'MIN_CHUNK_LENGTH': 100
}

# Vector store configuration
VECTOR_STORE_CONFIG = {
    'PERSIST_DIRECTORY': str(DATA_DIR / 'chroma_db')
}

# Model quantization settings
QUANTIZATION_CONFIG = {
    'LOAD_IN_4BIT': True,
    'COMPUTE_DTYPE': 'float16',
    'QUANT_TYPE': 'nf4'
}

# Fallback model in case of memory issues
FALLBACK_MODEL = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
