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
      return <div className="h-96 animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2" />
  }

  return (
    <Card className="relative gap-0 overflow-hidden border border-lp-line bg-lp-card py-0 text-lp-fg lp-shadow">

      <CardHeader className="border-b border-lp-line p-6 md:p-8">
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lp-navy text-[#8FCDAF]">
                <Mic size={20} />
            </div>
            <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">Preparation</p>
        </div>
        <CardTitle className="font-display text-2xl font-semibold tracking-[-0.04em] md:text-3xl">Configure Your Session</CardTitle>
        <p className="text-sm text-lp-muted">
          Set your destination and visa category to match your actual embassy appointment.
        </p>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <label className="ml-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Destination Country</label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="!h-14 w-full rounded-2xl border-lp-line bg-lp-card-2 px-4 transition-all focus:ring-2 focus:ring-lp-azure/20">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-lp-azure" />
                  <SelectValue placeholder="Country" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-lp-line max-h-[300px]">
                {countryList.map(c => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="ml-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Visa Category</label>
            <Select value={visaType} onValueChange={setVisaType}>
              <SelectTrigger className="!h-14 w-full rounded-2xl border-lp-line bg-lp-card-2 px-4 transition-all focus:ring-2 focus:ring-lp-azure/20">
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} className="text-lp-azure" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-lp-line">
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
          className="group/btn h-16 w-full gap-3 rounded-full border-none bg-lp-navy font-display text-lg font-semibold tracking-[-0.02em] text-white transition-[background-color,box-shadow,transform] hover:bg-lp-navy-2 hover:shadow-[0_16px_40px_-12px_rgba(8,32,26,0.55)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0" 
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
                <ArrowRight className="text-[#8FCDAF] transition-transform group-hover/btn:translate-x-1" />
              </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
