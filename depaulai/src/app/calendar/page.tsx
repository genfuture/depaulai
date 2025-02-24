"use client";
import React from 'react';
import Calendarsec from './calendarsec';import dynamic from 'next/dynamic';




export default function calendar() {
    const FullCalendarComponent = dynamic(() => import('./calendarsec'), { ssr: false });


    return (
        <>
        <div className="items-center flex flex-col p-5">
            <Calendarsec />
        </div>
            </>
    )
}