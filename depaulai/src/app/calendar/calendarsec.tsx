'use client'

import React, { useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import iCalendarPlugin from '@fullcalendar/icalendar'




const CalendarSec = () => {
  const calendarRef = useRef(null);  // Ref for the calendar div
  let calendarInstance: Calendar | null;  // Declare a variable to store the calendar instance
  

  useEffect(() => {
    if (calendarRef.current) {
      calendarInstance = new Calendar(calendarRef.current, {
        plugins: [dayGridPlugin, iCalendarPlugin],
        events: {
          url: 'https://drive.google.com/uc?export=download&id=1CE-FC16bSKjFObQGexs7gacKhDg3BmmP',
          format: 'ics'
        },
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