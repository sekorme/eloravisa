"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Lock, Globe, ArrowRight, GraduationCap, Loader2 } from "lucide-react"
import { getCurrentUserDetails } from "@/action/user"
import { auth } from "@/firebase/client"
import { generateInterviewQuestions } from "@/action/interview"
import { toast } from "sonner"
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
  onStart: (questions: string[], contextData: any) => void
}

// Question count for the shelved text Q&A flow (handleStart); the UI selector
// for it was removed since the main button launches the consular simulation.
const TEXT_QUESTION_COUNT = 5

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [destination, setDestination] = useState("")
  const [visaType, setVisaType] = useState("")
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

  // "Begin Mock Interview" launches the live consular simulation, which
  // charges for itself when its session token is minted. This text-question
  // flow (generate → InterviewSession → feedback) is kept wired for reuse
  // but is not what the main button triggers.
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

      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) {
        toast.error("Please sign in again to continue")
        setGenerating(false)
        return
      }
      const response = await generateInterviewQuestions(idToken, profileForAI, TEXT_QUESTION_COUNT)

      if (response.success) {
        const contextData = {
            name: userData?.fullName || "Applicant",
            country: userData?.country || "Unknown",
            destination: destination,
            visaType: visaType,
            questionCount: TEXT_QUESTION_COUNT
        }
        onStart(response.data, contextData)
      } else {
        toast.error(response.error || "Failed to generate questions. Please try again.")
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
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <Mic size={22} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Preparation</p>
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
              <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl px-4 focus:ring-2 focus:ring-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-primary" />
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
              <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl px-4 focus:ring-2 focus:ring-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} className="text-primary" />
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

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <Lock size={18} className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-300 font-semibold italic">
            Your interview will be locked once started to simulate a real embassy environment. Focus and provide clear, consistent answers as you would in person.
          </p>
        </div>

        <Button 
          className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-xl shadow-primary/30 transition-all active:scale-95 border-none rounded-2xl gap-3 group/btn" 
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
