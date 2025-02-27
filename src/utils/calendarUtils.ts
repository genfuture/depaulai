/**
 * Calendar utilities for creating calendar links
 */

// Date format regex to detect dates in text
// This regex matches common date formats like:
// - May 15, 2025
// - 05/15/2025
// - 2025-05-15
// - Tomorrow at 3pm
// - Next Monday at 2:30pm
export const dateRegex = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?,? \d{2,4}|\d{4}-\d{2}-\d{2}|(?:tomorrow|next (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?)\b/gi;

// Interface for calendar event data
export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
}

/**
 * Parse a date string to a Date object
 * This is a simple implementation - in production, you'd want to use a library like date-fns or moment
 */
export const parseDate = (dateString: string): Date | null => {
  // Try to parse the date string
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Handle special cases like "tomorrow"
  if (dateString.toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // If there's a time component (e.g., "tomorrow at 3pm")
    if (dateString.toLowerCase().includes('at')) {
      const timeMatch = dateString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const period = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
        
        // Convert to 24-hour format if needed
        if (period === 'pm' && hours < 12) {
          hours += 12;
        } else if (period === 'am' && hours === 12) {
          hours = 0;
        }
        
        tomorrow.setHours(hours, minutes, 0, 0);
      }
    } else {
      // Default to 9am if no time specified
      tomorrow.setHours(9, 0, 0, 0);
    }
    
    return tomorrow;
  }
  
  // Handle "next [day]" format
  if (dateString.toLowerCase().includes('next')) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (dateString.toLowerCase().includes(days[i])) {
        const today = new Date();
        const dayOfWeek = i;
        const daysUntilNext = (dayOfWeek + 7 - today.getDay()) % 7 || 7; // If today, then next week
        
        const nextDay = new Date();
        nextDay.setDate(today.getDate() + daysUntilNext);
        
        // If there's a time component
        if (dateString.toLowerCase().includes('at')) {
          const timeMatch = dateString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
            const period = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
            
            // Convert to 24-hour format if needed
            if (period === 'pm' && hours < 12) {
              hours += 12;
            } else if (period === 'am' && hours === 12) {
              hours = 0;
            }
            
            nextDay.setHours(hours, minutes, 0, 0);
          }
        } else {
          // Default to 9am if no time specified
          nextDay.setHours(9, 0, 0, 0);
        }
        
        return nextDay;
      }
    }
  }
  
  return null;
};

/**
 * Create a Google Calendar event URL
 */
export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const startDate = event.startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const endDate = event.endDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
};

/**
 * Create an Outlook Calendar event URL
 */
export const createOutlookCalendarUrl = (event: CalendarEvent): string => {
  const startDate = event.startDate.toISOString();
  const endDate = event.endDate.toISOString();
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${encodeURIComponent(startDate)}&enddt=${encodeURIComponent(endDate)}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
};

/**
 * Create an Apple Calendar event URL (iCal format)
 */
export const createAppleCalendarUrl = (event: CalendarEvent): string => {
  // Apple Calendar uses the ics format, but we can use a web service to generate it
  // This is a simplified version - in production, you might want to generate a proper .ics file
  const startDate = event.startDate.toISOString();
  const endDate = event.endDate.toISOString();
  
  return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Extract potential dates from a message
 */
export const extractDatesFromText = (text: string): string[] => {
  const matches = text.match(dateRegex);
  return matches || [];
};

/**
 * Create a default event from a date string and context
 */
export const createDefaultEvent = (dateString: string, context: string): CalendarEvent | null => {
  const date = parseDate(dateString);
  
  if (!date) {
    return null;
  }
  
  // Create end date (1 hour after start date by default)
  const endDate = new Date(date);
  endDate.setHours(endDate.getHours() + 1);
  
  // Try to extract a title from the context
  let title = 'New Event';
  const contextBeforeDate = context.substring(0, context.indexOf(dateString));
  const contextAfterDate = context.substring(context.indexOf(dateString) + dateString.length);
  
  // Look for potential event titles in the context
  const titleRegex = /(?:meeting|call|appointment|event|session|conference|interview|presentation|webinar|workshop)(?:\s+(?:with|about|on|for)\s+([^,.]+))?/i;
  const titleMatch = contextBeforeDate.match(titleRegex) || contextAfterDate.match(titleRegex);
  
  if (titleMatch) {
    title = titleMatch[0].trim();
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return {
    title,
    startDate: date,
    endDate,
    description: context,
    location: ''
  };
};