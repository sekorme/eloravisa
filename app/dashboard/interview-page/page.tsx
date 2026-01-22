import React from 'react'

import {getGeminiKey} from "@/action/ai";
import InterviewDash from "@/components/interview/InterviewDash";

const InterviewPage  = async() => {
    const apiKey = await getGeminiKey();
    return (
        <>
            <InterviewDash apiKeys={apiKey } />
        </>
    )
}
export default InterviewPage
