from ics import Calendar
from rapidfuzz import process, fuzz
import os
from datetime import datetime, timedelta
import re

# Set the path to your .ics file
calendar_path = "backend/DePaulUniversityEvents.ics"

# Load and parse the calendar file
if not os.path.exists(calendar_path):
    print(f"❌ Oops! The calendar file '{calendar_path}' was not found. Double-check the file path and try again.")
    exit()

with open(calendar_path, "r", encoding="utf-8", errors="replace") as file:
    calendar_data = file.read()

try:
    calendar = Calendar(calendar_data)
    if not calendar.events:
        print("😕 Huh, I couldn't find any events in the calendar file. Maybe try another one?")
        exit()
except Exception as e:
    print(f"❌ Oops! Something went wrong while reading the calendar: {e}")
    exit()

# Function to clean and normalize event names
def clean_event_name(name):
    return re.sub(r'\s+', ' ', name.strip().lower()) if name else "unknown event"

# Store events
events_dict = {}
dates_dict = {}

for event in sorted(calendar.events, key=lambda e: e.begin):
    event_name = clean_event_name(event.name)
    event_date = event.begin.date().strftime("%Y-%m-%d")

    events_dict.setdefault(event_name, []).append(event_date)
    dates_dict.setdefault(event_date, []).append(event_name)

# Common keyword mappings
keyword_mappings = {
    "final": "final exam",
    "finals": "final exam",
    "break": "spring break",
    "holiday": "university closed",
    "vacation": "university closed",
    "graduation": "commencement",
    "exam": "exam",
}

last_search_results = None  # Store last search results for follow-up

def parse_date_query(query):
    today = datetime.today().date()
    
    if "tomorrow" in query:
        return today + timedelta(days=1)
    if "today" in query:
        return today
    if "next week" in query:
        return today + timedelta(days=7)
    if "next month" in query:
        return (today.replace(day=1) + timedelta(days=32)).replace(day=1)
    if "this week" in query:
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        return (start_of_week, end_of_week)
    
    return None

def find_event(query):
    global last_search_results  
    query = query.lower().strip()

    if query == "yes" and last_search_results:
        return last_search_results
    elif query == "yes":
        return "Hmm, I don't remember our last search. Could you ask me again? 😊"

    for keyword, mapped_value in keyword_mappings.items():
        if keyword in query:
            query = query.replace(keyword, mapped_value)

    event_date = parse_date_query(query)
    if isinstance(event_date, tuple):
        start_of_week, end_of_week = event_date
        events_in_week = {
            date: events for date, events in dates_dict.items()
            if start_of_week.strftime("%Y-%m-%d") <= date <= end_of_week.strftime("%Y-%m-%d")
        }
        if events_in_week:
            response = f"📅 Here's what's happening this week ({start_of_week} - {end_of_week}):\n"
            for date, events in sorted(events_in_week.items()):
                response += f"\n🔹 {date}:\n" + "\n".join(f"   🎉 {event.title()}" for event in events)
            last_search_results = response.strip()
            return response + "\nWould you like more details on any of these? 😊"
        else:
            return f"Hmm, looks like nothing's scheduled for this week ({start_of_week} - {end_of_week}). Maybe check a different date?"

    elif event_date:
        date_str = event_date.strftime("%Y-%m-%d")
        if date_str in dates_dict:
            response = f"📅 On {date_str}, we have: \n"
            response += "\n".join(f"   🎉 {event.title()}" for event in dates_dict[date_str])
            last_search_results = response.strip()
            return response + "\nWant to know more about any of these? 😃"
        else:
            return f"Hmm, looks like nothing's happening on {date_str}. Want to check another day?"
    
    matches = process.extract(query, events_dict.keys(), scorer=fuzz.WRatio, limit=5)
    high_confidence_matches = {match[0]: events_dict[match[0]] for match in matches if match[1] > 60}
    low_confidence_matches = [m[0].title() for m in matches if 40 < m[1] <= 60]
    
    if high_confidence_matches:
        response = "🔎 Here's what I found for you!\n"
        numbered_options = {}
        for i, (event_name, event_dates) in enumerate(high_confidence_matches.items(), start=1):
            response += f"   {i}. 📅 {event_name.title()} is happening on: {', '.join(event_dates)}\n"
            numbered_options[str(i)] = event_name  
        last_search_results = (response.strip(), numbered_options)
        return response + "\nLet me know if you'd like more details! 😊"
    
    if low_confidence_matches:
        numbered_options = {str(i): name for i, name in enumerate(low_confidence_matches, start=1)}
        response = f"🤔 Not exactly sure what you meant by '{query}', but maybe you meant one of these?\n"
        response += "\n".join(f"   {i}. {name}" for i, name in numbered_options.items())
        last_search_results = (response.strip(), numbered_options)
        return response + "\nLet me know if one of these looks right!"
    
    return f"😕 I couldn't find anything for '{query}'. Want to try another event name or date?"

print("\n📅 Welcome to the Academic Event Finder! I'm here to help you stay on top of important dates. 😊")
print("💡 Try asking me things like:")
print("   - 'When is Spring Break?'\n   - 'What events are happening tomorrow?'\n   - 'Is there an exam next week?'")
print("📌 Type 'exit' when you're done. Let's get started! 🎉\n")

while True:
    user_input = input("💬 Ask me about an academic event (or type 'exit' to quit): ").strip()
    if user_input.lower() == "exit":
        print("👋 It was great chatting with you! Have an awesome day! 😊")
        break
    print(find_event(user_input))
