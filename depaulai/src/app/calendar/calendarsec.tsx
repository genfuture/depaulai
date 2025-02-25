'use client'

import React, { useEffect, useRef,useState } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import iCalendarPlugin from '@fullcalendar/icalendar'




const CalendarSec = () => {

  const calendarRef = useRef(null);  // Ref for the calendar div
  let calendarInstance: Calendar | null;  // Declare a variable to store the calendar instance
  const ICAL = require('ical.js');
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the ICS file from the Flask server
    fetch('http://localhost:5328/static/ical.ics')
      .then((response) => response.text()) // Get the file as text
      .then((icsText) => {
        // Parse the ICS content using ical.js
        const jCalData = ICAL.parse(icsText);
        const comp = new ICAL.Component(jCalData);
        const events = comp.getAllSubcomponents('vevent');

        // Map the events to FullCalendar format
        const calendarEvents = events.map((event: any) => {
          const e = new ICAL.Event(event);
          return {
            title: e.summary,
            start: e.startDate.toString(),  // Convert to ISO string
            end: e.endDate.toString(),      // Convert to ISO string
            description: e.description,
          };
        });

        setEvents(calendarEvents); // Update state with parsed events
      })
      .catch((error) => {
        console.error('Error fetching the ICS file:', error);
      });
  }, []); // Run once when component mounts


  useEffect(() => {
    if (calendarRef.current) {
      calendarInstance = new Calendar(calendarRef.current, {
        plugins: [dayGridPlugin, iCalendarPlugin],
        events:events,
        contentHeight: 'auto',
        height: '100%',
        fixedWeekCount: false,
      });

      calendarInstance.render();
    }

    // Cleanup the calendar instance on component unmount
    return () => {
      if (calendarInstance) {
        calendarInstance.destroy();  // Destroy the calendar when the component unmounts
      }
    };
  }, []);

  return (
    <div>
      <div ref={calendarRef} style={{ height: '700px', width: '100%' }} />
      
    </div>
  );
};

export default CalendarSec;