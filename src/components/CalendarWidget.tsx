import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { CalendarEvent, createGoogleCalendarUrl, createOutlookCalendarUrl, createAppleCalendarUrl } from '../utils/calendarUtils';

interface CalendarWidgetProps {
  event: CalendarEvent;
  onClose: () => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ event, onClose }) => {
  const [title, setTitle] = useState(event.title);
  const [startDate, setStartDate] = useState(event.startDate.toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(event.endDate.toISOString().slice(0, 16));
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);

  const formatDateForDisplay = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getUpdatedEvent = (): CalendarEvent => {
    return {
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      location
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md w-full animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
          <h3 className="font-semibold text-lg dark:text-white">Add to Calendar</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event Title
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="event-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <input
            id="event-start"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="event-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time
          </label>
          <input
            id="event-end"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location (optional)
          </label>
          <input
            id="event-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <a 
          href={createGoogleCalendarUrl(getUpdatedEvent())} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          <Calendar size={16} />
          <span>Add to Google Calendar</span>
        </a>
        <a 
          href={createOutlookCalendarUrl(getUpdatedEvent())} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Calendar size={16} />
          <span>Add to Outlook Calendar</span>
        </a>
        <a 
          href={createAppleCalendarUrl(getUpdatedEvent())} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2 bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors"
        >
          <Calendar size={16} />
          <span>Add to Apple Calendar</span>
        </a>
      </div>
    </div>
  );
};

export default CalendarWidget;