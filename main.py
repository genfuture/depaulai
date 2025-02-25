#!/usr/bin/env python3
import os
import argparse
import subprocess
from pathlib import Path
import sys

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from depaul_chatbot.utils.text_processor import TextProcessor
from depaul_chatbot.models.chatbot import DePaulChatbot
from depaul_chatbot.config import LLM_MODEL_NAME, EMBEDDING_MODEL_NAME

def run_scraper():
    """Run the Scrapy spider to scrape DePaul's website."""
    print("Starting web scraper...")
    
    # Get the path to the spider
    spider_dir = Path(__file__).parent / 'scraper'

    print(f"Spider directory: {spider_dir}")
    
    # Change to the spider directory and run scrapy
    os.chdir(spider_dir)
    print(f"Current working directory: {os.getcwd()}")
    result = subprocess.run(['scrapy', 'crawl', 'depaul'], capture_output=True, text=True)

    
    if result.returncode != 0:
        print(f"Error running scraper: {result.stderr}")
        return False
    
    print("Scraping completed successfully!")
    return True

def process_data():
    """Process the scraped data."""
    print("Processing scraped data...")
    
    processor = TextProcessor(data_dir=str(Path(__file__).parent / 'data'))
    documents = processor.prepare_documents()
    processor.save_processed_documents(documents)
    
    print(f"Processed {len(documents)} documents.")
    return True

def interactive_chat(model_name=None):
    """Start an interactive chat session with the chatbot."""
    print("Initializing chatbot...")
    
    # Use the specified model or the default from config
    if model_name is None:
        model_name = LLM_MODEL_NAME
    
    chatbot = DePaulChatbot(
        data_dir=str(Path(__file__).parent / 'data'),
        model_name=model_name,
        embedding_model_name=EMBEDDING_MODEL_NAME
    )
    
    print(f"Loading documents using {model_name}...")
    chatbot.load_documents()
    
    print("\nDePaul University Chatbot")
    print("Type 'exit' or 'quit' to end the conversation.")
    print("Type 'clear' to clear the conversation history.")
    print("Type 'save' to save the conversation history.")
    
    while True:
        user_input = input("\nYou: ")
        
        if user_input.lower() in ['exit', 'quit']:
            break
        elif user_input.lower() == 'clear':
            chatbot.clear_conversation_history()
            print("Conversation history cleared.")
            continue
        elif user_input.lower() == 'save':
            chatbot.save_conversation_history()
            continue
        
        response = chatbot.chat(user_input)
        print(f"\nChatbot: {response}")
    
    print("Goodbye!")

def main():
    parser = argparse.ArgumentParser(description='DePaul University Chatbot')
    parser.add_argument('--scrape', action='store_true', help='Run the web scraper')
    parser.add_argument('--process', action='store_true', help='Process the scraped data')
    parser.add_argument('--chat', action='store_true', help='Start an interactive chat session')
    parser.add_argument('--model', type=str, help='Specify a Hugging Face model to use')
    parser.add_argument('--all', action='store_true', help='Run the entire pipeline')
    
    args = parser.parse_args()
    
    # If no arguments are provided, show help
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    # Run the entire pipeline
    if args.all:
        if run_scraper():
            if process_data():
                interactive_chat(args.model)
        return
    
    # Run individual steps
    if args.scrape:
        run_scraper()
    
    if args.process:
        process_data()
    
    if args.chat:
        interactive_chat(args.model)

if __name__ == "__main__":
    main() 