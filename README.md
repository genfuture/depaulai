# DePaul University Chatbot
- Prem Kumar Gadwal (pgadwal@depaul.edu)

A chatbot that can answer questions about DePaul University using data scraped from the university's website.

## 🚀 Features
- **Comprehensive Knowledge**: Covers all web pages of DePaul University.
- **Advanced NLP Pipeline**: Utilizes state-of-the-art preprocessing and training methodologies.
- **Optimized for Accuracy**: Achieves high precision in extracting and answering queries.
- **Self-Hosted**: No external APIs or third-party dependencies.
- **Frontend Stack**: Built with **React** for a dynamic user interface.
- **Model**: trained model [model](https://huggingface.co/prem234/detrained) for enhanced performance.

## 🛠️ Advanced Techniques Used
### Data Preprocessing
- **Text Normalization**: Applied stemming, lemmatization, and stop-word removal.
- **Entity Recognition**: Enhanced dataset by tagging important university-related entities.
- **Vector Embedding Optimization**: Used TF-IDF and word embeddings (FastText) for better context understanding.

### Model Training
- **Transformer-Based Fine-Tuning**: Trained a large-scale llama-like model specifically on DePaul content.
- **Multi-Stage Training**:
  - Initial pretraining on large academic datasets.
  - Fine-tuning with domain-specific DePaul university data.
- **Knowledge Distillation**: Compressed model while maintaining high accuracy.
- **Contrastive Learning**: Improved retrieval-based responses by training on question-answer pairs with hard negatives.
- **Hybrid Retrieval**: Combined keyword-based (BM25) and semantic search (FAISS + dense vectors) for accurate information retrieval.

### Optimization
- **Efficient Indexing**: Used FAISS for fast similarity searches.
- **Dynamic Re-Ranking**: Applied a lightweight transformer-based reranker to prioritize relevant results.
- **Query Expansion**: Improved response accuracy by dynamically expanding user queries with related terms.
- **Low-Latency Deployment**: Optimized inference speed with model quantization and ONNX runtime.

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install the required packages:
```bash
pip install -r requirements.txt
```

3. Make sure you have enough disk space and RAM:
   - At least 8GB of RAM for the 4-bit quantized model
   - At least 5GB of disk space for model files

## Usage


```

2. Process the scraped data:
```python
from utils.text_processor import TextProcessor

processor = TextProcessor()
documents = processor.prepare_documents()
processor.save_processed_documents(documents)
```

3. Use the chatbot:
```python
from models.chatbot import DePaulChatbot

# Initialize with default Mistral-7B model
chatbot = DePaulChatbot()

# Or use a smaller model if you have limited resources
# chatbot = DePaulChatbot(model_name="TinyLlama/TinyLlama-1.1B-Chat-v1.0")

chatbot.load_documents()

# Ask questions
response = chatbot.chat("What are DePaul's admission requirements?")
print(response)

# Save conversation history
chatbot.save_conversation_history()
```

## Project Structure

- `scraper/`: Contains the Scrapy spider for web scraping
- `utils/`: Utility functions for text processing
- `models/`: Contains the chatbot implementation
- `data/`: Stores scraped data and processed documents
- `config.py`: Configuration settings
- `requirements.txt`: Project dependencies

## Model Options

The chatbot supports various Hugging Face models:

- **Default**: `mistralai/Mistral-7B-Instruct-v0.2` - Good balance of quality and size
- **Smaller**: `TinyLlama/TinyLlama-1.1B-Chat-v1.0` - For limited resources
- **Embedding**: `sentence-transformers/all-MiniLM-L6-v2` - For vector embeddings

You can change these in `config.py` or when initializing the chatbot.

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request


