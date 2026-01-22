"use client"

import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-muted-foreground">Loading Application...</p>
            </div>
        </div>
    )
}
