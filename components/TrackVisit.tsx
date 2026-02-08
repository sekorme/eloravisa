"use client"

import {useEffect} from "react"
import {logVisit} from "@/lib/logVisit";


export  function TrackVisit(){
    useEffect(()=>{
        // Check if we've already logged this session to avoid duplicates on refresh
        const hasLogged = sessionStorage.getItem('visit_logged');
        if (hasLogged) return;

        const country = document.cookie
            .split('; ')
            .find( (row) => row.startsWith('user-country='))
            ?.split('=')[1];

        // Log the visit (with country if available, or "Unknown")
        logVisit(country ? decodeURIComponent(country) : "Unknown");
        
        // Mark as logged for this session
        sessionStorage.setItem('visit_logged', 'true');
    },[])

    return null
}