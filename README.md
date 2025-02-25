# DePaul University Chatbot

A chatbot that can answer questions about DePaul University using data scraped from the university's website.

## Features

- Web scraping of DePaul University's website using Scrapy
- Intelligent content extraction with JavaScript handling
- Text processing and chunking for optimal LLM input
- Conversational AI powered by Hugging Face models (Mistral-7B)
- Vector storage using ChromaDB for efficient retrieval
- Conversation history management
- 4-bit quantization for efficient model loading

## Setup

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

1. Run the web scraper to collect data:
```bash
cd scraper
scrapy crawl depaul
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# depaulmodel
