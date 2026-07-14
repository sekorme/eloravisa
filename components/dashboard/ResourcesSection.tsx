"use client"

import { Mic, Book,Info, Headset } from "lucide-react"
import {UploadDocumentsModal} from "@/components/UploadDocumentsModal";
import {useRouter} from "next/navigation";

export function ResourcesSection() {
    const router = useRouter()
  return (
    <div id="quick-actions" className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">Quick Actions</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Common tasks at your fingertips</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center p-6 md:p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all bg-transparent cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1">
         <UploadDocumentsModal/>
        </div>

        <button onClick={() => router.push("/dashboard/ai-mock-interview")} className="flex flex-col items-center justify-center p-6 md:p-8 border border-neutral-100 dark:border-neutral-800 rounded-3xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all bg-white dark:bg-neutral-800/50 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
            <Mic className="text-purple-600 dark:text-purple-400 w-7 h-7" />
          </div>
          <span className="font-bold text-neutral-800 dark:text-neutral-100 text-center">AI Interview</span>
        </button>
        <button onClick={() => router.push("/dashboard/information")} className="flex flex-col items-center justify-center p-6 md:p-8 border border-neutral-100 dark:border-neutral-800 rounded-3xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all bg-white dark:bg-neutral-800/50 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
            <Info className="text-green-600 dark:text-green-400 w-7 h-7" />
          </div>
          <span className="font-bold text-neutral-800 dark:text-neutral-100 text-center">View Guides</span>
        </button>
        <button className="flex flex-col items-center justify-center p-6 md:p-8 border border-neutral-100 dark:border-neutral-800 rounded-3xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all bg-white dark:bg-neutral-800/50 cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
            <Headset className="text-orange-600 dark:text-orange-400 w-7 h-7" />
          </div>
          <span className="font-bold text-neutral-800 dark:text-neutral-100 text-center">Get Support</span>
        </button>
      </div>
    </div>
  )
}
