# depaulai
PROpel Hackathon Team
## ANKITA MISHRA
Email: amishr15@depaul.edu

## Overview  
This project extracts event data from the DePaul Events iCalendar (.ics) URL, processes event details, and generates Q&A pairs for a chatbot. It also includes fine-tuning capabilities using TinyLlama to improve event-related queries.  

## Features  
- **Extracts event details** (date, time, location, description) from an iCalendar URL  
- **Formats event data** for structured output  
- **Finds events by keywords** (e.g., "music performance", "recital")  
- **Identifies free events**  
- **Categorizes events by campus location**  
- **Generates Q&A pairs** for chatbot training  
- **Supports fine-tuning** with TinyLlama  

## Installation  
1. Clone this repository:  
   ```bash
   git clone https://github.com/your-repo/event-calendar-parser.git
   cd event-calendar-parser
2. Install required dependencies
   ```bash
   pip install requests icalendar transformers datasets torch sumy
   
## Configuration
The config.json file stores the trained model configuration, including the model path and hyperparameters for fine-tuning.

## Usage
1. Run the script to generate event-based Q&A pairs:
```bash
python run.py
```
2. Fine tune the model (optional)
If you want to fine-tune the chatbot model using the generated Q&A data, update config.json with your desired settings and run:
```bash
python finetune.py
```

## Example output
Extracted Event:
```plaintext
- 2025-02-26 18:00: Music Performance at Holtschneider Performance Center (Categories: Recital)
```
Generated Q&A:
```json
[
    {
        "question": "Are there any music performances happening this week?",
        "answer": "- 2025-02-26 18:00: Music Performance at Holtschneider Performance Center"
    },
    {
        "question": "Where is the next recital happening?",
        "answer": "The next recital is at Holtschneider Performance Center on 2025-02-26 at 18:00."
    },
    {
        "question": "Are there any free events this week?",
        "answer": "Yes! There is a free music performance at Holtschneider Performance Center on 2025-02-26 at 18:00."
    }
]
```
