"use client"

import {useEffect} from "react"
import {logVisit} from "@/lib/logVisit";


export  function TrackVisit(){
    useEffect(()=>{
        const country = document.cookie
            .split('; ')
            .find( (row) => row.startsWith('user-country='))
            ?.split('=')[1];

            if(country){
                logVisit(decodeURIComponent(country))
            }
    },[])

    return null
}