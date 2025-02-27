import json
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, Trainer, TrainingArguments, EarlyStoppingCallback
from datasets import load_dataset

# Load the TinyLlama model
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Load processed documents from JSON
dataset = load_dataset('json', data_files='data/processed_documents.json')

# Tokenize the dataset with labels
def tokenize_function(examples):
    tokenized_inputs = tokenizer(examples['text'], truncation=True, padding='max_length', max_length=512)
    tokenized_inputs['labels'] = tokenized_inputs['input_ids'].copy()  # Set labels to input_ids
    return tokenized_inputs

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Create a train-validation split
train_test_split = tokenized_datasets['train'].train_test_split(test_size=0.1)  # 10% for validation
train_dataset = train_test_split['train']
eval_dataset = train_test_split['test']

# Set up training arguments with advanced methods
training_args = TrainingArguments(
    output_dir='./results',
    evaluation_strategy='epoch',
    learning_rate=2e-5,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,  # Accumulate gradients over 4 steps
    num_train_epochs=3,
    weight_decay=0.01,
    fp16=True,  # Enable mixed precision training
    save_total_limit=2,  # Limit the total amount of checkpoints
    save_steps=500,  # Save checkpoint every 500 steps
    load_best_model_at_end=True,  # Load the best model at the end of training
    metric_for_best_model='eval_loss',  # Metric to use for the best model
    greater_is_better=False,  # Lower loss is better
)

# Initialize Trainer with EarlyStoppingCallback
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],  # Stop if no improvement for 2 evaluations
)

# Start training
trainer.train()

# Save the fine-tuned model
model.save_pretrained('./fine_tuned_model')
tokenizer.save_pretrained('./fine_tuned_model')