import React, { useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';


const CalendarSec = () => {
  const calendarRef = useRef(null);  // Ref for the calendar div
  let calendarInstance: Calendar | null = null;  // Declare a variable to store the calendar instance

  useEffect(() => {
    if (calendarRef.current) {
      calendarInstance = new Calendar(calendarRef.current, {
        plugins: [listPlugin, dayGridPlugin],
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
      <div ref={calendarRef}/>  
    </div>
  );
};

export default CalendarSec;