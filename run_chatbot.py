#!/usr/bin/env python3
"""
Interactive script to run the DePaul University chatbot.
This script provides a simple command-line interface to interact with the chatbot.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to sys.path to allow imports
current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir.parent))

from depaul_chatbot.models.chatbot import DePaulChatbot
from depaul_chatbot.config import LLM_MODEL_NAME, EMBEDDING_MODEL_NAME

def print_header():
    """Print the chatbot header."""
    print("\n" + "=" * 50)
    print("DePaul University Chatbot".center(50))
    print("=" * 50)
    print("\nThis chatbot can answer questions about DePaul University.")
    print("Type 'exit' or 'quit' to end the conversation.")
    print("Type 'clear' to clear the conversation history.")
    print("Type 'save' to save the conversation history.")
    print("=" * 50 + "\n")

def main():
    """Run the interactive chatbot."""
    print_header()
    
    # Ask if user wants to use a different model
    print(f"Default model: {LLM_MODEL_NAME}")
    use_different = input("Would you like to use a different model? (y/n): ").lower()
    
    if use_different == 'y':
        print("\nSuggested models:")
        print("1. mistralai/Mistral-7B-Instruct-v0.2 (Default)")
        print("2. TinyLlama/TinyLlama-1.1B-Chat-v1.0 (Smaller)")
        print("3. google/gemma-2b-it (Medium)")
        
        model_choice = input("\nEnter model name or number (1-3): ")
        
        if model_choice == '1':
            model_name = "mistralai/Mistral-7B-Instruct-v0.2"
        elif model_choice == '2':
            model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        elif model_choice == '3':
            model_name = "google/gemma-2b-it"
        else:
            model_name = model_choice
    else:
        model_name = LLM_MODEL_NAME
    
    print(f"\nInitializing chatbot with model: {model_name}")
    print("Loading model and documents... (this may take a few minutes)")
    
    # Initialize the chatbot
    chatbot = DePaulChatbot(
        data_dir=str(current_dir / 'data'),
        model_name=model_name,
        embedding_model_name=EMBEDDING_MODEL_NAME
    )
    
    # Load documents
    try:
        chatbot.load_documents()
        print("Model and documents loaded successfully!")
    except Exception as e:
        print(f"Error loading documents: {e}")
        return
    
    # Start the conversation loop
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
        
        try:
            response = chatbot.chat(user_input)
            print(f"\nChatbot: {response}")
        except Exception as e:
            print(f"Error: {e}")
    
    print("\nThank you for using the DePaul University Chatbot!")

if __name__ == "__main__":
    main() 