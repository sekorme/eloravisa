"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight, Mic, Clock, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { InterviewFeedback, Feedback } from "./InterviewFeedback"
import { auth, db } from '@/firebase/client'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from "firebase/auth"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface InterviewRecord {
  id: string
  date: string
  destination?: string
  visaType?: string
  status?: string
  feedback?: {
    clarityScore?: number
    consistencyScore?: number
    confidenceScore?: number
    overallScore?: number
    summary?: string
    strengths?: string[]
    weaknesses?: string[]
    recommendations?: string[]
  }
}

export function InterviewHistory() {
  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null)
  const [history, setHistory] = useState<InterviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, 'users', user.uid, 'interview_sessions'), orderBy('date', 'desc'))
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const data: InterviewRecord[] = snapshot.docs.map(d => ({ 
            id: d.id, 
            ...d.data() 
          } as InterviewRecord))
          setHistory(data)
          setLoading(false)
        })
        return () => unsubscribeSnapshot()
      } else {
        setHistory([])
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  const handleDelete = async () => {
    if (!deleteId || !auth.currentUser) return

    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'interview_sessions', deleteId))
      toast.success("Interview session deleted")
      setDeleteId(null)
      // If the deleted interview was open in dialog, close it
      if (selectedInterview?.id === deleteId) {
        setSelectedInterview(null)
      }
    } catch (error) {
      console.error("Error deleting interview:", error)
      toast.error("Failed to delete interview")
    }
  }

  // Helper to map Firestore data to Feedback component props
  const mapToFeedbackProps = (record: InterviewRecord): Feedback => {
    const fb = record.feedback || {}
    return {
      scores: {
        clarity: fb.clarityScore || fb.overallScore || 0,
        consistency: fb.consistencyScore || fb.overallScore || 0,
        confidence: fb.confidenceScore || fb.overallScore || 0,
        overall: fb.overallScore || 0
      },
      summary: fb.summary,
      strengths: fb.strengths || [],
      weaknesses: fb.weaknesses || [],
      recommendations: fb.recommendations || []
    }
  }

  return (
    <div className="space-y-4 mt-12">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black tracking-tight text-lp-fg">Past Sessions</h2>
        <Badge variant="secondary" className="font-bold">History</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-6 text-center text-muted-foreground">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="col-span-full p-6 text-center text-muted-foreground">No past sessions found.</div>
        ) : history.map((item) => (
          <Card
            key={item.id} 
            className="group relative cursor-pointer hover:border-primary/50 transition-all border-lp-line bg-lp-card shadow-sm hover:shadow-md overflow-hidden"
            onClick={() => setSelectedInterview(item)}
          >
            <div className="absolute top-2 right-2 z-10">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500/20 dark:hover:bg-red-900/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(item.id);
                    }}
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            <CardContent className="p-4 flex flex-col gap-4 h-full justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-lp-card-2 text-lp-muted group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mic size={18} />
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-black text-lg">
                        {item.feedback?.overallScore ? `${item.feedback.overallScore}%` : '—'}
                    </div>
                    {item.status && (
                        <div className="text-[10px] font-bold uppercase tracking-wider text-lp-muted">
                            {item.status}
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-lp-fg line-clamp-1">
                    {item.destination || 'Unknown'} – {item.visaType || 'N/A'}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] text-lp-muted font-bold uppercase tracking-wider">
                        <Calendar size={12} className="shrink-0" />
                        {item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'Unknown Date'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-lp-muted font-bold uppercase tracking-wider">
                        <Clock size={12} className="shrink-0" />
                        {item.date ? format(new Date(item.date), 'h:mm a') : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-lp-line">
                <span className="text-[10px] font-black uppercase tracking-widest text-lp-muted">View Details</span>
                <ChevronRight size={14} className="text-lp-muted/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedInterview} onOpenChange={(open) => !open && setSelectedInterview(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto border-none p-0 bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>Interview Feedback</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
             <div className="p-4 md:p-6 bg-lp-card rounded-2xl shadow-2xl border border-lp-line space-y-6">
                <div className="flex items-center justify-between border-b border-lp-line pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-lp-fg">Session Details</h3>
                            {selectedInterview.status === 'completed' && (
                                <Badge variant="outline" className="bg-lp-sky text-lp-azure border-lp-azure/30 text-[10px] uppercase">
                                    Completed
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-lp-muted">
                            {selectedInterview.destination} – {selectedInterview.visaType}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-xs font-medium text-lp-muted">
                            <Calendar size={14} />
                            {selectedInterview.date ? format(new Date(selectedInterview.date), 'MMM d, yyyy') : ''}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-lp-muted mt-1">
                            <Clock size={14} />
                            {selectedInterview.date ? format(new Date(selectedInterview.date), 'h:mm a') : ''}
                        </div>
                    </div>
                </div>

                <InterviewFeedback 
                    interview={{
                        ...selectedInterview,
                        feedback: mapToFeedbackProps(selectedInterview)
                    }} 
                    onRestart={() => setSelectedInterview(null)} 
                />
             </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this interview session and its feedback from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
