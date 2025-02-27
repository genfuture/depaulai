from transformers import AutoModelForCausalLM, AutoTokenizer
from huggingface_hub import upload_folder

# Define model path and Hugging Face repo
model_path = "./fine_tuned_model"
repo_name = "prem234/detrained"  # Replace with your Hugging Face repo name

# Load the tokenizer and model (ensure they exist at model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)

# Save tokenizer and model before uploading
tokenizer.save_pretrained(model_path)
model.save_pretrained(model_path)

# Upload the fine-tuned model to Hugging Face
upload_folder(folder_path=model_path, repo_id=repo_name, commit_message="Uploading fine-tuned model")

print(f"Model successfully uploaded to: https://huggingface.co/{repo_name}")
