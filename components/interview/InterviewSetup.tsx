"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Lock, Globe, ArrowRight, GraduationCap, ListOrdered, Loader2 } from "lucide-react"
import { getCurrentUserDetails } from "@/action/user"
import { generateInterviewQuestions } from "@/action/interview"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import countries from "world-countries"
import {useRouter} from "next/navigation";

// Sorted list of countries for the dropdowns
const countryList = countries
    .map(c => ({
        name: c.name.common,
        code: c.cca2
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

interface InterviewSetupProps {
  onStart: (questions: string[], isVoiceMode: boolean, contextData: any) => void
}

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [destination, setDestination] = useState("")
  const [visaType, setVisaType] = useState("")
  const [questionCount, setQuestionCount] = useState("5")
  const [voiceMode, setVoiceMode] = useState(false)
const router = useRouter()
  useEffect(() => {
    const fetchUser = async () => {
      const data = await getCurrentUserDetails()
      if (data) {
        setUserData(data)
        setDestination(data.onboarding?.destination || "")
        setVisaType(data.onboarding?.visaType || "")
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleStart = async () => {
    setGenerating(true)
    try {
      // Use current state for generation, falling back to user data if needed
      const profileForAI = {
        ...userData,
        onboarding: {
            ...userData?.onboarding,
            destination: destination,
            visaType: visaType
        }
      }

      const response = await generateInterviewQuestions(profileForAI, parseInt(questionCount))
      
      if (response.success) {
        const contextData = {
            name: userData?.fullName || "Applicant",
            country: userData?.country || "Unknown",
            destination: destination,
            visaType: visaType,
            questionCount: parseInt(questionCount)
        }
        onStart(response.data, voiceMode, contextData)
      } else {
        toast.error("Failed to generate questions. Please try again.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
      return <div className="h-96 bg-white dark:bg-card rounded-2xl animate-pulse" />
  }

  return (
    <Card className="border-none shadow-xl bg-white dark:bg-card overflow-hidden relative group transition-all duration-300 hover:shadow-2xl">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
      
      <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <Mic size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Preparation</p>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Configure Your Session</CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Set your destination and visa category to match your actual embassy appointment.
        </p>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Destination Country</label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-blue-500" />
                  <SelectValue placeholder="Country" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 max-h-[300px]">
                {countryList.map(c => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Visa Category</label>
            <Select value={visaType} onValueChange={setVisaType}>
              <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} className="text-blue-500" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800">
                <SelectItem value="Study">Study Visa</SelectItem>
                <SelectItem value="Visit">Visit Visa</SelectItem>
                <SelectItem value="Work">Work Visa</SelectItem>
                <SelectItem value="Family">Family Visa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Practice Depth</label>
          <Select value={questionCount} onValueChange={setQuestionCount}>
            <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500/20 transition-all">
              <div className="flex items-center gap-3">
                <ListOrdered size={18} className="text-blue-500" />
                <SelectValue placeholder="Questions" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800">
              <SelectItem value="3">3 Questions (Quick Rehearsal)</SelectItem>
              <SelectItem value="5">5 Questions (Standard Practice)</SelectItem>
              <SelectItem value="10">10 Questions (Intensive Session)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between group/mode hover:border-blue-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover/mode:scale-110 transition-transform shadow-inner">
              <Mic size={20} />
            </div>
            <div>
              <Label htmlFor="voice-mode" className="font-black text-sm text-slate-900 dark:text-white cursor-pointer">Smart Voice Mode</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Respond naturally using your microphone</p>
            </div>
          </div>
          <Switch id="voice-mode" checked={voiceMode} onCheckedChange={setVoiceMode} />
        </div>

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <Lock size={18} className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-300 font-semibold italic">
            Your interview will be locked once started to simulate a real embassy environment. Focus and provide clear, consistent answers as you would in person.
          </p>
        </div>

        <Button 
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-xl shadow-blue-500/30 transition-all active:scale-95 border-none rounded-2xl gap-3 group/btn" 
          onClick={() => router.push("/dashboard/consular")}
          disabled={generating}
        >
          {generating ? (
              <>
                <Loader2 className="animate-spin" /> Generating Session...
              </>
          ) : (
              <>
                <span>Begin Mock Interview</span>
                <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
