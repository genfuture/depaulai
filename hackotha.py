from ics import Calendar
from rapidfuzz import process, fuzz
import os
from datetime import datetime, timedelta
import re
import dateparser  # For handling flexible date inputs

# Set the path to your .ics file
calendar_path = "/Users/navikamaglani/Downloads/DePaulUniversityEvents.ics"

if not os.path.exists(calendar_path):
    print(f"\n❌ Oops! The calendar file '{calendar_path}' was not found. Please check the file path and try again.")
    exit()

with open(calendar_path, "r", encoding="utf-8", errors="replace") as file:
    calendar_data = file.read()

try:
    calendar = Calendar(calendar_data)
    if not calendar.events:
        print("\n❌ No events found in the calendar file. Try another file!")
        exit()
except Exception as e:
    print(f"\n❌ Error processing the calendar file: {e}")
    exit()

# Function to normalize event names
def clean_event_name(name):
    return re.sub(r'\s+', ' ', name.strip().lower()) if name else "unknown event"

# Store events
events_dict = {}
dates_dict = {}

for event in calendar.events:
    event_name = clean_event_name(event.name)
    event_date = event.begin.date().strftime("%Y-%m-%d")
    events_dict.setdefault(event_name, []).append(event_date)
    dates_dict.setdefault(event_date, []).append(event_name)

# Keyword mappings for user-friendly queries
keyword_mappings = {
    "final": "final exam",
    "finals": "final exam",
    "break": "spring break",
    "holiday": "university closed",
    "vacation": "university closed",
    "graduation": "commencement",
    "exam": "exam",
}

# Store last search results
last_search_results = None  

# Function to parse flexible date queries
def parse_date_query(query):
    today = datetime.today().date()
    parsed_date = dateparser.parse(query, settings={'PREFER_DATES_FROM': 'future'})
    return parsed_date.date() if parsed_date else None

# Function to find events
def find_event(query):
    global last_search_results  
    query = query.lower().strip()

    if query in ["yes", "yeah", "sure", "show me"]:
        return last_search_results if last_search_results else "❌ No previous search results found. Try again!"

    for keyword, mapped_value in keyword_mappings.items():
        if keyword in query:
            query = query.replace(keyword, mapped_value)

    event_date = parse_date_query(query)
    if event_date:
        date_str = event_date.strftime("%Y-%m-%d")
        if date_str in dates_dict:
            response = f"\n📅 **Events on {date_str}:**\n"
            response += "\n".join(f"   🎉 **{event.title()}**" for event in dates_dict[date_str])
            last_search_results = response.strip()
            return last_search_results
        return f"❌ No events found on {date_str}. Try another date?"

    matches = process.extract(query, events_dict.keys(), scorer=fuzz.ratio, limit=10)
    high_confidence_matches = {match[0]: events_dict[match[0]] for match in matches if match[1] > 60}
    low_confidence_matches = [m[0].title() for m in matches if 40 < m[1] <= 60]

    if high_confidence_matches:
        response = "\n🔎 **Here’s what I found:**\n"
        for event_name, event_dates in high_confidence_matches.items():
            response += f"   📅 **{event_name.title()}** is scheduled on: {', '.join(event_dates)}\n"
        last_search_results = response.strip()
        return last_search_results

    # Suggest close matches if no strong matches were found
    if low_confidence_matches:
        last_search_results = f"🤔 No exact match found for **'{query}'**. Did you mean: {', '.join(low_confidence_matches)}?"
        return last_search_results


    return f"❌ I couldn't find anything for '{query}'. Try another event name or date!"

# Welcome message
print("\n📅 **Welcome to the Academic Event Finder!**")
print("🔎 You can ask about university events by name or date.")
print("💡 Try something like:")
print("   - 'When is Spring Break?'")
print("   - 'What events are happening tomorrow?'")
print("   - 'Is there an exam next week?'")
print("📌 Type **'exit'** to quit.\n")

# Main chatbot loop
while True:
    user_input = input("\n💬 Ask me about an academic event (or type 'exit' to quit): ")
    if user_input.lower() == "exit":
        print("👋 Thanks for using the Academic Event Finder! Have a great day!")
        break
    print(find_event(user_input))
