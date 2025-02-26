import requests
import icalendar
from datetime import datetime, date, timedelta
import json
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
from datasets import Dataset
import torch
import os
import re
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

campus_addresses = {
    "Loop": [
        "College of Law, 801",
        "Lewis Center, 1400",
        "DePaul Center (DPC)",
        "Lewis 805",
        "Lewis Center, 341",
        "College of Law, 341",
        "Lewis Center, 805",
        "DePaul Center, DePaul 8005",
        "DePaul Center (DPC), 11013",
        "DePaul Center (DPC), 5901",
        "DePaul Center (DPC), 11th Floor Gallery",
        "Lewis Building, 341",
        "243 South Wabash Avenue, Chicago, Illinois 60604, USA",
        "DePaul Center, 14 E Jackson, Suite 800, 1 E. Jackson Blvd.,Chicago, IL 60604",
        "Lewis 241, Lewis 241",
        "DPC Concourse",
        "1 East Jackson Boulevard, Chicago, Illinois 60604, USA",
        "1 East Jackson Boulevard, Chicago, Illinois 60604, United States",
        "25 East Jackson Boulevard, Chicago, Illinois 60604, United States",
        "Lewis Center, 905",
        "Lewis Center, 7th Floor Lounge",
        "DePaul Center (DPC), 8005",
        "Lewis Center, 903 and 904",
        "DePaul Center (DPC), Concourse Level",
        "DePaul Center (DPC), 9300",
        "Lewis Center, 803.",
        "Lewis Center, 7th Floor Student Lounge",
        "Theatre School",
        "DePaul University CDM Theater, LL105"
    ],
    "Lincoln Park": [
        "Student Center (Lincoln Park), 324",
        "Levan Center, 100",
        "Saint Vincent de Paul Catholic Church",
        "Student Center (Lincoln Park), 120AB",
        "2250 North Sheffield Avenue, Chicago, Illinois 60614, United States",
        "Greenhouse Theater Center, Up Main Theater",
        "Holtschneider Performance Center, Brennan Recital Hall",
        "Lincoln Park Campus (Room TBD)",
        "Schmitt Academic Center (SAC), 161",
        "Clifton Hall, 155",
        "John T. Richardson Library, Room 103",
        "Lincoln Park Student Center, 314",
        "Holtschneider Performance Center, Gannon Concert Hall",
        "Courtelyou Commons, Main Hall",
        "Student Center (Lincoln Park), 314AB",
        "McGowan South, 108",
        "Holtschneider Performance Center, Gannon Concert Hall",
        "Holtschneider Performance Center, Dempsey Corboy Jazz Hall",
        "Holtschneider Performance Center, Jarvis Opera Hall",
        "Library - Richardson Library Lincoln Park Campus, 103",
        "St. Vincent's Parish Church",
        "Arts and Letters Hall, 103",
        "Student Center (Lincoln Park), 315",
        "Student Center (Lincoln Park), 220",
        "Levan Center, 505",
        "Library - Richardson Library Lincoln Park Campus, 300",
        "Commons",
        "Student Center (Lincoln Park), 314",
        "Library - Richardson Library Lincoln Park Campus, JTR 103",
        "Library - Richardson Library Lincoln Park Campus, TBD",
        "Student Center (Lincoln Park), 350",
        "Student Center (Lincoln Park)",
        "Performance Center, Allen Recital Hall",
        "Student Center (Lincoln Park), 120 A/B",
        "In-Person at Arts and Letters Hall, Room TBD",
        "Holtschneider Performance Center, Brennan Recital Hall",
        "Holtschneider Performance Center, Allen Recital Hall",
        "Holtschneider Performance Center, Dempsey Corboy Jazz Hall",
        "Holtschneider Performance Center, Jarvis Opera Hall"
    ],
    "Outside Campus": [
        "200 East Cermak Road, Chicago, Illinois 60616, United States",
        "Theatre School, Watts Theatre",
        "Marriott Center, Suite 340",
        "Art Institute of Chicago",
        "Domestic Violence Courthouse",
        "TBD, TBD",
    ]
}

def extract_ical_events(url, target_date=None):
    try:
        response = requests.get(url)
        response.raise_for_status()
        cal = icalendar.Calendar.from_ical(response.text)
        events = []
        target_date = target_date or date.today()
        for component in cal.walk('VEVENT'):
            event = {}
            event['summary'] = str(component.get('summary')) if component.get('summary') else None
            event['start'] = component.get('dtstart').dt if component.get('dtstart') else None
            event['end'] = component.get('dtend').dt if component.get('dtend') else None
            event['location'] = str(component.get('location')) if component.get('location') else None
            event['description'] = str(component.get('description')) if component.get('description') else None

            categories = component.get('categories')
            if categories:
                if isinstance(categories, list):
                    event['category'] = [str(cat) for cat in categories]
                else:
                    event['category'] = [str(categories)]
            else:
                event['category'] = []

            if event['start'] and isinstance(event['start'], datetime) and event['start'].date() == target_date:
                events.append(event)
        return events

    except requests.exceptions.RequestException as e:
        print(f"Error fetching iCalendar data: {e}")
        return None
    except ValueError as e:
        print(f"Error parsing iCalendar data: {e}")
        return None
    except AttributeError as e:
        print(f"Attribute error processing iCalendar data: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def summarize_description(description):
    """Summarizes the event description."""
    if not description or description == "N/A":
        return "No description available."

    try:
        parser = PlaintextParser.from_string(description, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, 2)
        return " ".join([str(sentence) for sentence in summary])
    except Exception as e:
        return f"Could not summarize description: {e}"

def format_events(events):
    if not events:
        return "No matching events found."

    formatted_events = ""
    for event in events:
        start = event.get('start')
        start_str = start.strftime('%Y-%m-%d %H:%M') if isinstance(start, datetime) else start.strftime('%Y-%m-%d')
        description = event.get('description', 'N/A')
        location = event.get('location', 'N/A')
        categories = ', '.join(event.get('category', ['N/A']))
        formatted_events += f"- {start_str}: {description} at {location} (Categories: {categories})\n"

    return formatted_events

def find_events_by_keywords(events, keywords, start_date=None, end_date=None):
    """Finds events containing specified keywords within a date range."""
    matching_events = []
    start_date = start_date or date.today()
    end_date = end_date or (start_date + timedelta(days=7))

    for event in events:
        start = event.get('start')
        description = event.get('description', 'N/A').lower()
        location = event.get('location', 'N/A')

        if start and isinstance(start, datetime) and start_date <= start.date() <= end_date:
            event_text = f"{description}"
            if location is not None: 
                event_text += location.lower()
            else:
                event_text += "N/A"
            if any(keyword.lower() in event_text for keyword in keywords):
                matching_events.append(event)

    return matching_events

def find_free_events(events, start_date=None, end_date=None):
    """Finds free events within a date range."""
    matching_events = []
    start_date = start_date or date.today()
    end_date = end_date or (start_date + timedelta(days=7))

    for event in events:
        start = event.get('start')
        description = event.get('description', 'N/A').lower()
        if "free" in description.lower() or "no charge" in description.lower() or "admission is free" in description.lower():
            if start and isinstance(start, datetime) and start_date <= start.date() <= end_date:
                matching_events.append(event)
    return matching_events

def format_event_for_finetuning(event):
    """Formats an event for fine-tuning."""
    description = event.get('description', 'N/A')
    start = event.get('start', 'N/A')
    location = event.get('location', 'N/A')
    categories = ', '.join(event.get('category', ['N/A']))
    return f"Event Details: {description} Start: {start} Location: {location} Categories: {categories}"

def create_qa_pairs(events):
    qa_pairs = []
    for event in events:
        description = event.get('description', 'N/A')
        start = event.get('start')
        end = event.get('end')
        location = event.get('location', 'N/A')

        if start:
            start_str = start.strftime('%Y-%m-%d %H:%M') if isinstance(start, datetime) else start.strftime('%Y-%m-%d')
        else:
            start_str = "N/A"

        if end:
            end_str = end.strftime('%Y-%m-%d %H:%M') if isinstance(end, datetime) else end.strftime('%Y-%m-%d')
        else:
            end_str = "N/A"

        qa_pairs.append({"question": f"Tell me about this event.", "answer": description})
        qa_pairs.append({"question": f"When does this event start?", "answer": start_str})
        qa_pairs.append({"question": f"When does this event end?", "answer": end_str})
        qa_pairs.append({"question": f"Where is this event?", "answer": location})
        qa_pairs.append({"question": f"Where is the event located?", "answer": location})
        qa_pairs.append({"question": f"Event details?", "answer": f"Start: {start_str}, End: {end_str}, Location: {location}, Details: {description}"})
        qa_pairs.append({"question": f"Summarize event details?", "answer": summarize_description(description)})
    return qa_pairs

def get_campus_events(events, campus_name, today=None):
    """Retrieves events for a specific campus."""
    if campus_name not in campus_addresses:
        return "Campus not found."

    campus_addresses_list = campus_addresses[campus_name]
    today = today or date.today()
    campus_events = []

    for event in events:
        location = event.get('location', 'N/A')
        start = event.get('start')
        if start and isinstance(start, datetime) and start.date() == today and location in campus_addresses_list:
            campus_events.append(event)

    if not campus_events:
        return f"No events found at {campus_name} campus today."

    formatted_events = ""
    for event in campus_events:
        start_str = event['start'].strftime('%H:%M')
        formatted_events += f"- {start_str}: {event.get('description', 'N/A')}\n"

    return formatted_events

def create_campus_event_qa_pairs(events):
    """Creates Q&A pairs for campus-specific events."""
    qa_pairs = []
    for campus in campus_addresses:
        qa_pairs.append({
            "question": f"What events are happening at {campus} campus today?",
            "answer": get_campus_events(events, campus)
        })
        qa_pairs.append({
            "question": f"Events at {campus} today?",
            "answer": get_campus_events(events, campus)
        })

    return qa_pairs

def create_keyword_event_qa_pairs(events):
    """Creates Q&A pairs for keyword-based event searches."""
    qa_pairs = []
    keywords = ["music performance", "recital"]  # Add more keywords as needed

    qa_pairs.append({
        "question": "Are there any music performances happening this week?",
        "answer": format_events(find_events_by_keywords(events, keywords))
    })

    qa_pairs.append({
        "question": "Any recitals this week?",
        "answer": format_events(find_events_by_keywords(events, keywords))
    })

    return qa_pairs

def create_free_event_qa_pairs(events):
    """Creates Q&A pairs for free events."""
    qa_pairs = []

    qa_pairs.append({
        "question": "Are there any free events happening this week?",
        "answer": format_events(find_free_events(events))
    })

    qa_pairs.append({
        "question": "Any free events?",
        "answer": format_events(find_free_events(events))
    })

    return qa_pairs

# Example usage:
url = "http://events.depaul.edu/calendar/1.ics"
events = extract_ical_events(url)

qa_data = create_qa_pairs(events) + create_campus_event_qa_pairs(events) + create_keyword_event_qa_pairs(events) + create_free_event_qa_pairs(events)

with open("ical_qa_data.json", "w") as f:
    json.dump(qa_data, f, indent=4)

# Fine-tuning TinyLlama
tokenizer = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")
model = AutoModelForCausalLM.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0", ignore_mismatched_sizes=True)
tokenizer.pad_token = tokenizer.eos_token

dataset = Dataset.from_list(qa_data)

def tokenize_function(examples):
    inputs = [f"Question: {q} Answer: {a}" for q, a in zip(examples["question"], examples["answer"])]
    tokenized = tokenizer(inputs, padding="max_length", truncation=True, max_length=128, return_tensors="pt")
    tokenized["labels"] = tokenized["input_ids"]  # Labels are the same as input_ids for causal LM
    return tokenized

tokenized_datasets = dataset.map(tokenize_function, batched=True)

training_args = TrainingArguments(
    output_dir="./tinyllama_calendar_chatbot",
    overwrite_output_dir=True,
    num_train_epochs=3,
    per_device_train_batch_size=2,
    save_steps=10_000,
    save_total_limit=2,
    logging_dir='./logs',
    logging_steps=10,
    learning_rate=5e-5,
    weight_decay=0.01,
    warmup_steps=500,
    lr_scheduler_type="linear",
    push_to_hub=False,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets,
    tokenizer= tokenizer,
)

trainer.train()
model.save_pretrained("./tinyllama_calendar_chatbot")
tokenizer.save_pretrained("./tinyllama_calendar_chatbot")

print("Training Complete. Model saved to ./tinyllama_calendar_chatbot")