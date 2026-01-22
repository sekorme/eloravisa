"use client"

import { Mic, Book,Info, Headset } from "lucide-react"
import {UploadDocumentsModal} from "@/components/UploadDocumentsModal";
import {useRouter} from "next/navigation";

export function ResourcesSection() {
    const router = useRouter()
  return (
    <div id="quick-actions" className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center justify-center p-4 md:p-6 border-2 border-gray-200 dark:border-border rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all bg-transparent cursor-pointer group">
         <UploadDocumentsModal/>
        </div>

        <button onClick={() => router.push("/dashboard/ai-mock-interview")} className="flex flex-col items-center justify-center p-4 md:p-6 border-2 border-gray-200 dark:border-border rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all bg-transparent cursor-pointer group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Mic className="text-purple-600 dark:text-purple-400 text-lg md:text-xl w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-medium text-sm md:text-base text-gray-800 dark:text-foreground text-center">AI Mock Interview</span>
        </button>
        <button onClick={() => router.push("/dashboard/information")} className="flex flex-col items-center justify-center p-4 md:p-6 border-2 border-gray-200 dark:border-border rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all bg-transparent cursor-pointer group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Info className="text-green-600 dark:text-green-400 text-lg md:text-xl w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-medium text-sm md:text-base text-gray-800 dark:text-foreground text-center">View Guides</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 md:p-6 border-2 border-gray-200 dark:border-border rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all bg-transparent cursor-pointer group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Headset className="text-orange-600 dark:text-orange-400 text-lg md:text-xl w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-medium text-sm md:text-base text-gray-800 dark:text-foreground text-center">Get Support</span>
        </button>
      </div>
    </div>
  )
}
