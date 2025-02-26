import json
import re
import torch
from sentence_transformers import SentenceTransformer, util
from transformers import AutoModelForCausalLM, AutoTokenizer
from langchain.prompts import PromptTemplate

# Load JSON Data
with open("calendar_events.json", "r", encoding="utf-8") as json_file:
    events = json.load(json_file)

# Initialize Models
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
generator_model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(generator_model_name)
model = AutoModelForCausalLM.from_pretrained(generator_model_name)

# Example User Input
user_input = "faculty events this week"

# Extract Keywords and Important Concepts from User Input
def extract_keywords(text):
    return re.findall(r'\w+', text.lower())

user_keywords = extract_keywords(user_input)

# Create a corpus of event texts for semantic matching
corpus = []
event_texts = []

for event in events:
    event_text = ' '.join([event['name'], event['description'], event['location']])
    event_texts.append(event_text)
    corpus.append(event_text)

# Encode the corpus and user input for semantic matching
corpus_embeddings = embedding_model.encode(corpus, convert_to_tensor=True)
user_input_embedding = embedding_model.encode(user_input, convert_to_tensor=True)

# Compute cosine similarity between user input and event texts
cosine_scores = util.pytorch_cos_sim(user_input_embedding, corpus_embeddings)[0]

# Find the most similar event(s) based on cosine similarity
threshold = 0.5  # Adjust the threshold as needed
matched_events = [events[i] for i in range(len(events)) if cosine_scores[i] > threshold]

# Generate Context for the Prompt
context = '\n'.join([json.dumps(event, ensure_ascii=False, indent=4) for event in matched_events])

# Custom Prompt Template
qa_template = """You are a helpful assistant for DePaul University. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Chat History: {chat_history}

Question: {question}

Answer: """

qa_prompt = PromptTemplate(
    template=qa_template,
    input_variables=["context", "chat_history", "question"]
)

# Example Chat History and Question
chat_history = ""  # This can be populated with previous interactions
question = user_input

# Generate the final prompt
final_prompt = qa_prompt.format(context=context, chat_history=chat_history, question=question)

print("Final Prompt: \n", final_prompt)

# Ensure the input is within the model's token limit
max_input_tokens = 512  # Adjust based on your model's token limit
inputs = tokenizer(final_prompt, return_tensors="pt", truncation=True, max_length=max_input_tokens)

# Generate the answer using the TinyLlama model
outputs = model.generate(**inputs, max_new_tokens=150)
answer = tokenizer.decode(outputs[0], skip_special_tokens=True)

print("Generated Answer: \n", answer)
