#!/usr/bin/env python3
"""
Test script to verify the installation and dependencies.
"""

import sys
import importlib
import os
from pathlib import Path

def check_import(module_name, package_name=None):
    """Check if a module can be imported."""
    if package_name is None:
        package_name = module_name
    
    try:
        importlib.import_module(module_name)
        print(f"✅ {package_name} is installed correctly")
        return True
    except ImportError as e:
        print(f"❌ {package_name} is not installed correctly: {e}")
        return False

def main():
    """Run the installation tests."""
    print("\n=== Testing DePaul Chatbot Installation ===\n")
    
    # Add the parent directory to sys.path
    current_dir = Path(__file__).resolve().parent
    sys.path.append(str(current_dir.parent))
    
    # Check core dependencies
    dependencies = [
        ("scrapy", "scrapy"),
        ("numpy", "numpy"),
        ("pandas", "pandas"),
        ("transformers", "transformers"),
        ("torch", "torch"),
        ("langchain", "langchain"),
        ("chromadb", "chromadb"),
        ("sentence_transformers", "sentence-transformers"),
        ("bitsandbytes", "bitsandbytes")
    ]
    
    all_passed = True
    for module_name, package_name in dependencies:
        if not check_import(module_name, package_name):
            all_passed = False
    
    
    # Check project modules
    print("\n=== Testing Project Modules ===\n")
    
    try:
        from depaul_chatbot.utils.text_processor import TextProcessor
        print("✅ TextProcessor module is accessible")
    except ImportError as e:
        print(f"❌ TextProcessor module is not accessible: {e}")
        all_passed = False
    
    try:
        from depaul_chatbot.models.chatbot import DePaulChatbot
        print("✅ DePaulChatbot module is accessible")
    except ImportError as e:
        print(f"❌ DePaulChatbot module is not accessible: {e}")
        all_passed = False
    
    # Check data directory
    data_dir = current_dir / 'data'
    if data_dir.exists():
        print(f"✅ Data directory exists at {data_dir}")
    else:
        print(f"❌ Data directory does not exist at {data_dir}")
        try:
            data_dir.mkdir(exist_ok=True)
            print(f"✅ Created data directory at {data_dir}")
        except Exception as e:
            print(f"❌ Failed to create data directory: {e}")
            all_passed = False
    
    # Final result
    print("\n=== Test Results ===\n")
    if all_passed:
        print("✅ All tests passed! The installation appears to be working correctly.")
        print("\nYou can now run the chatbot with:")
        print("python run_chatbot.py")
    else:
        print("❌ Some tests failed. Please fix the issues before running the chatbot.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main()) 