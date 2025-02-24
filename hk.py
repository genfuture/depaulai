from ics import Calendar
from rapidfuzz import process, fuzz
import os
from datetime import datetime, timedelta
import re

# Set the path to your .ics file
calendar_path = "/Users/navikamaglani/Downloads/DePaulUniversityEvents.ics"

# Load and parse the calendar file
if not os.path.exists(calendar_path):
    print(f"❌ Oops! The calendar file '{calendar_path}' was not found. Please check the file path and try again.")
    exit()

with open(calendar_path, "r", encoding="utf-8", errors="replace") as file:
    calendar_data = file.read()

try:
    calendar = Calendar(calendar_data)  # Fixed parsing
    if not calendar.events:
        print("❌ No events found in the calendar file. Try another file!")
        exit()
except Exception as e:
    print(f"❌ Error processing the calendar file: {e}")
    exit()

# Function to clean and normalize event names
def clean_event_name(name):
    return re.sub(r'\s+', ' ', name.strip().lower()) if name else "unknown event"

# Store events
events_dict = {}
dates_dict = {}

for event in sorted(calendar.events, key=lambda e: e.begin):  # Ensure chronological order
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

# Store last search results for follow-up
last_search_results = None  

def parse_date_query(query):
    """Identify and handle date-related queries like 'tomorrow', 'next week', etc."""
    today = datetime.today().date()
    
    if "tomorrow" in query or "tmrw" in query:
        return today + timedelta(days=1)
    if "today" in query:
        return today
    if "next week" in query:
        return today + timedelta(days=7)
    if "next month" in query:
        return (today.replace(day=1) + timedelta(days=32)).replace(day=1)
    if "this week" in query:
        start_of_week = today - timedelta(days=today.weekday())  # Monday
        end_of_week = start_of_week + timedelta(days=6)  # Sunday
        return (start_of_week, end_of_week)

    return None  # No date-related query found

def find_event(query):
    """Find events by name or based on date-based queries."""
    global last_search_results  
    query = query.lower().strip()

    # Handle follow-up confirmations like "yes"
    if query == "yes" and last_search_results:
        return last_search_results
    elif query == "yes":
        return "❌ No previous search results found. Try again!"

    # Normalize query using keyword mappings
    for keyword, mapped_value in keyword_mappings.items():
        if keyword in query:
            query = query.replace(keyword, mapped_value)

    # Handle date-based queries
    event_date = parse_date_query(query)
    if isinstance(event_date, tuple):  # If the query is for a week range
        start_of_week, end_of_week = event_date
        events_in_week = {
            date: events for date, events in dates_dict.items()
            if start_of_week.strftime("%Y-%m-%d") <= date <= end_of_week.strftime("%Y-%m-%d")
        }

        if events_in_week:
            response = f"\n📅 **Events This Week ({start_of_week} - {end_of_week}):**\n"
            for date, events in sorted(events_in_week.items()):
                response += f"\n🔹 {date}:\n" + "\n".join(f"   🎉 **{event.title()}**" for event in events)
            last_search_results = response.strip()
            return last_search_results
        else:
            return f"❌ No events found for this week ({start_of_week} - {end_of_week})."

    elif event_date:
        date_str = event_date.strftime("%Y-%m-%d")
        if date_str in dates_dict:
            response = f"\n📅 **Events on {date_str}:**\n"
            response += "\n".join(f"   🎉 **{event.title()}**" for event in dates_dict[date_str])
            last_search_results = response.strip()
            return last_search_results
        else:
            return f"❌ No events found on {date_str}. Maybe try a different date?"

    # Find events by name using fuzzy matching (improved accuracy with WRatio)
    matches = process.extract(query, events_dict.keys(), scorer=fuzz.WRatio, limit=5)

    high_confidence_matches = {match[0]: events_dict[match[0]] for match in matches if match[1] > 60}
    low_confidence_matches = [m[0].title() for m in matches if 40 < m[1] <= 60]

    if high_confidence_matches:
        response = "\n🔎 **Here’s what I found:**\n"
        numbered_options = {}
        for i, (event_name, event_dates) in enumerate(high_confidence_matches.items(), start=1):
            response += f"   {i}. 📅 **{event_name.title()}** is scheduled on: {', '.join(event_dates)}\n"
            numbered_options[str(i)] = event_name  # Store for follow-up
        last_search_results = (response.strip(), numbered_options)
        return response.strip()

    # Suggest close matches if no strong matches were found
    if low_confidence_matches:
        numbered_options = {str(i): name for i, name in enumerate(low_confidence_matches, start=1)}
        response = f"\n🤔 No exact match found for **'{query}'**. Did you mean:\n"
        response += "\n".join(f"   {i}. {name}" for i, name in numbered_options.items())
        last_search_results = (response.strip(), numbered_options)
        return response.strip()

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
    user_input = input("\n💬 Ask me about an academic event (or type 'exit' to quit): ").strip()
    if user_input.lower() == "exit":
        print("👋 Thanks for using the Academic Event Finder! Have a great day!")
        break

    result = find_event(user_input)
    
    # If the result contains a numbered list of options, allow the user to choose
    if isinstance(last_search_results, tuple) and isinstance(last_search_results[1], dict):
        print(result)
        choice = input("\n🔹 Enter the number of the event you want details for (or type 'no' to search again): ").strip()
        
        if choice in last_search_results[1]:
            event_name = last_search_results[1][choice]
            closest_match, score, _ = process.extractOne(event_name.lower(), events_dict.keys(), scorer=fuzz.WRatio)

            if closest_match and score > 60:
                event_dates = ", ".join(events_dict[closest_match])
                print(f"\n✅ **{closest_match.title()}** is scheduled on: {event_dates}\n")
            else:
                print("❌ Event details not found. Try searching again.")

        elif choice.lower() == "no":
            continue
        else:
            print("❌ Invalid choice. Try again.")
            continue

    print(result)
