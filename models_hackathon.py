from icalendar import Calendar
import requests
import pandas as pd
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from rapidfuzz import process, fuzz

url = "http://events.depaul.edu/calendar.ics"
response = requests.get(url)


cal = Calendar.from_ical(response.text)

# Define the campus address mappings
campus_addresses = {
    "Loop": [
        "1 E. Jackson Blvd., Chicago, IL 60604", 
        "14 E. Jackson Blvd., Chicago, IL 60604",
        "2250 N. Sheffield Ave., Chicago, IL 60614",
        "2400 N. Lincoln Ave., Chicago, IL 60614",
        "55 E. Jackson Blvd., Chicago, IL 60604",
        "233 S. Wabash Ave., Chicago, IL 60604"
    ],
    "Lincoln Park": [
        "2350 N. Lincoln Park West, Chicago, IL 60614", 
        "1100 W. Fullerton Ave., Chicago, IL 60614",
        "2345 N. Sheffield Ave., Chicago, IL 60614",
        "2400 N. Lincoln Ave., Chicago, IL 60614"
    ]
}

# Extract event data
events = []
for component in cal.walk():
    if component.name == "VEVENT":
        event = {
            "Title": component.get("summary", "N/A"),
            "Start Time": component.get("dtstart").dt if component.get("dtstart") else "N/A",
            "End Time": component.get("dtend").dt if component.get("dtend") else "N/A",
            "Location": component.get("location", "N/A"),
            "Description": component.get("description", "N/A")
        }
        events.append(event)

# tinyLLaMA tokenizer and model
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Function to match event locations to campus addresses
def get_campus_for_location(location):
    location = location.lower()
    if any(keyword in location for keyword in ["loop", "jackson", "wabash", "sheffield"]):
        return "Loop"
    elif any(keyword in location for keyword in ["lincoln park", "fullerton", "sheffield"]):
        return "Lincoln Park"
    return "Unknown"

# Fuzzy matching function 
def fuzzy_match(query, event_titles, threshold=60):
    matches = process.extract(query, event_titles, limit=5, scorer=fuzz.partial_ratio)
    return [match for match in matches if match[1] >= threshold]

# Chatbot Logic
def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
    inputs = inputs.to(device)
    
    # Generate a response
    response_ids = model.generate(
        inputs["input_ids"],
        max_length=200, 
        num_beams=5,     
        early_stopping=True
    )
    
    response = tokenizer.decode(response_ids[0], skip_special_tokens=True)
    return response

def chatbot(input_text):
    try:
        #event titles with description for fuzzy matching
        event_titles = [event['Title'] + " " + event['Description'] for event in events]
        best_matches = fuzzy_match(input_text, event_titles)

        #response with the matched events
        response = "I found some related events:\n"
        for match in best_matches:
            event_index = event_titles.index(match[0]) 
            event = events[event_index]

            # event's location
            campus = get_campus_for_location(event['Location'])
            response += f"- {event['Title']} on {event['Start Time']} at {event['Location']} ({campus} campus)\n"
        
        return response

    except Exception as e:
        print(f"Error: {e}")
        return "Sorry, I can't answer that right now."

