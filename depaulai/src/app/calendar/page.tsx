"use client";
import React from 'react';
import Calendarsec from './calendarsec';import dynamic from 'next/dynamic';
import RootLayout from '../components/root-layout';




export default function calendar() {
    const FullCalendarComponent = dynamic(() => import('./calendarsec'), { ssr: false });


    return (
        <RootLayout>
        <div className="items-center flex flex-col p-5">
            <Calendarsec />
        </div>
        </RootLayout>
    
    )
}