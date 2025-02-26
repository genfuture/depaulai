from transformers import AutoTokenizer, AutoModelForCausalLM

# Load the fine-tuned model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("./tinyllama_calendar_chatbot")
model = AutoModelForCausalLM.from_pretrained("./tinyllama_calendar_chatbot")

def generate_event_response(question):
    inputs = tokenizer(question, return_tensors="pt", padding=True, truncation=True)
    outputs = model.generate(inputs["input_ids"], max_length=128, num_beams=5, no_repeat_ngram_size=2)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return answer

# Interactive loop for asking questions
while True:
    question = input("Ask a question (or type 'exit' to quit): ")
    if question.lower() == 'exit':
        print("Exiting...")
        break
    response = generate_event_response(question)
    print(f"Answer: {response}")
