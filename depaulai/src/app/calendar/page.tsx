"use client";
import React from 'react';
import Calendarsec from './calendarsec';


export default function calendar() {

    return (
        <>
        <div className="justify-center items-center flex flex-col">
            <div className="w-[100%] h-[1000px] overflow-y-auto p-4">
            <Calendarsec />
            </div>
        </div>
            </>
    )
}