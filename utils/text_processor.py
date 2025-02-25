import json
from pathlib import Path
from typing import List, Dict
import re
from tqdm import tqdm
from langchain.text_splitter import RecursiveCharacterTextSplitter

class TextProcessor:
    def __init__(self, data_dir: str = '../data'):
        self.data_dir = Path(data_dir)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def load_scraped_data(self) -> List[Dict]:
        """Load all scraped JSON files from the data directory."""
        data = []
        json_files = list(self.data_dir.glob('*.json'))
        
        for file_path in tqdm(json_files, desc="Loading scraped data"):
            with open(file_path, 'r', encoding='utf-8') as f:
                data.append(json.load(f))
        return data

    def clean_text(self, text: str) -> str:
        """Clean the text content."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        return text.strip()

    def prepare_documents(self) -> List[Dict]:
        """Prepare documents for the LLM by cleaning and splitting text."""
        documents = []
        scraped_data = self.load_scraped_data()

        for item in tqdm(scraped_data, desc="Preparing documents"):
            cleaned_text = self.clean_text(item['content'])
            chunks = self.text_splitter.split_text(cleaned_text)
            
            for chunk in chunks:
                documents.append({
                    'text': chunk,
                    'metadata': {
                        'url': item['url'],
                        'title': item['title']
                    }
                })

        return documents

    def save_processed_documents(self, documents: List[Dict], output_file: str = 'processed_documents.json'):
        """Save processed documents to a JSON file."""
        output_path = self.data_dir / output_file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(documents, f, ensure_ascii=False, indent=2)
        
        print(f"Processed documents saved to {output_path}")
