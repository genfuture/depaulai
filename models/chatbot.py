import os
from typing import List, Dict
from pathlib import Path
import json

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFacePipeline
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

class DePaulChatbot:
    def __init__(self, data_dir: str = '../data', 
                 model_name: str = "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                 embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.data_dir = Path(data_dir)
        self.model_name = model_name
        self.embedding_model_name = embedding_model_name
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name)
        
        # Initialize LLM
        self._init_llm()
        
        # Initialize memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize vector store and chain
        self.vector_store = None
        self.chain = None
        
        # Custom prompt template
        self.qa_template = """You are a helpful assistant for DePaul University. Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        Context: {context}
        
        Chat History: {chat_history}
        
        Question: {question}
        
        Answer: """
        
        self.qa_prompt = PromptTemplate(
            template=self.qa_template,
            input_variables=["context", "chat_history", "question"]
        )

    def _init_llm(self):
        """Initialize the Hugging Face model with quantization for efficiency."""
        try:
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                device_map="auto",
                torch_dtype=torch.float16
            )
            
            # Create text generation pipeline
            text_generation_pipeline = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                max_new_tokens=512,
                temperature=0.5,
                top_p=0.95,
                repetition_penalty=1.15,
                do_sample=True
            )
            
            # Create LangChain pipeline
            self.chat_model = HuggingFacePipeline(pipeline=text_generation_pipeline)
        except Exception as e:
            print(f"Error initializing LLM: {e}")
            print("Trying with smaller model...")
            try:
                # Fallback to a smaller model
                fallback_model = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
                tokenizer = AutoTokenizer.from_pretrained(fallback_model)
                model = AutoModelForCausalLM.from_pretrained(
                    fallback_model,
                    device_map="auto",
                    torch_dtype=torch.float16
                )
                
                text_generation_pipeline = pipeline(
                    "text-generation",
                    model=model,
                    tokenizer=tokenizer,
                    max_new_tokens=256,
                    temperature=0.7,
                    do_sample=True
                )
                
                self.chat_model = HuggingFacePipeline(pipeline=text_generation_pipeline)
            except Exception as e2:
                raise RuntimeError(f"Failed to initialize LLM: {e2}")

    def load_documents(self, file_path: str = 'processed_documents.json'):
        """Load processed documents and create vector store."""
        documents_path = self.data_dir / file_path
        
        with open(documents_path, 'r', encoding='utf-8') as f:
            documents = json.load(f)
        
        texts = [doc['text'] for doc in documents]
        metadatas = [doc['metadata'] for doc in documents]
        
        # Create vector store
        self.vector_store = Chroma.from_texts(
            texts=texts,
            metadatas=metadatas,
            embedding=self.embeddings,
            persist_directory=str(self.data_dir / "chroma_db")
        )
        
        # Create conversation chain
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.chat_model,
            retriever=self.vector_store.as_retriever(),
            memory=self.memory,
            combine_docs_chain_kwargs={"prompt": self.qa_prompt}
        )

    def chat(self, question: str) -> str:
        """Process a question and return the response."""
        if not self.chain:
            raise ValueError("Please load documents first using load_documents()")
        
        print(f"Received question: {question}")  # Debugging statement
        response = self.chain.invoke({"question": question})
        print(f"Generated response: {response}")  # Debugging statement
        print(f"Full response object: {response}")  # Debugging statement
        print(f"Response object before accessing answer: {response}")  # Debugging statement
        print(f"Response structure: {response}")  # Debugging statement
        return response['answer']

    def save_conversation_history(self, file_path: str = 'conversation_history.json'):
        """Save the conversation history to a file."""
        history_path = self.data_dir / file_path
        
        with open(history_path, 'w', encoding='utf-8') as f:
            json.dump(self.memory.chat_memory.messages, f, ensure_ascii=False, indent=2)
        
        print(f"Conversation history saved to {history_path}")

    def clear_conversation_history(self):
        """Clear the conversation history."""
        self.memory.clear()
