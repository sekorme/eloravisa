"use client"

import React, { useEffect, useState } from "react"
import { deleteField, doc, updateDoc } from "firebase/firestore"
import { CalendarClock, CalendarPlus, Loader2, MapPin, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardDataProvider } from "@/context/DashboardDataContext"
import { ReadinessPanel } from "@/components/dashboard/ReadinessPanel"
import { useReadiness, type Appointment } from "@/hooks/useReadiness"
import { appointmentChecklist } from "@/lib/visaReadiness"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { buildSessionIcs } from "@/lib/ics"

export default function AppointmentPage() {
  return (
    <DashboardDataProvider>
      <AppointmentContent />
    </DashboardDataProvider>
  )
}

/** datetime-local value for an ISO string, in the browser's time zone. */
function toLocalInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function Countdown({ atMs }: { atMs: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  const diff = atMs - now
  if (diff <= 0) return <p className="font-display text-2xl font-semibold">Your appointment time has passed. Good luck!</p>
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  return (
    <div className="flex gap-3">
      {([["days", days], ["hours", hours], ["minutes", minutes]] as const).map(([label, value]) => (
        <div key={label} className="min-w-20 rounded-2xl bg-lp-sky px-4 py-3 text-center">
          <p className="font-display text-3xl font-semibold tracking-[-0.04em] text-lp-azure">{value}</p>
          <p className="text-xs text-lp-muted">{label}</p>
        </div>
      ))}
    </div>
  )
}

function AppointmentContent() {
  const { appointment, userData, loading } = useReadiness()
  const [editing, setEditing] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-lp-azure" />
      </div>
    )
  }

  const requiredDocuments = getRequiredDocuments(userData?.onboarding?.visaType)

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <CalendarClock className="h-3.5 w-3.5 text-lp-azure" /> Embassy appointment
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">Your visa interview</h1>
        <p className="max-w-2xl text-lp-muted">
          Add your appointment and we&apos;ll remind you a week, a day and a few hours before, check your documents are still valid on the day, and give you a checklist of what to bring.
        </p>
      </div>

      {!appointment || editing ? (
        <AppointmentForm existing={appointment} onDone={() => setEditing(false)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <AppointmentSummary appointment={appointment} onEdit={() => setEditing(true)} />
            <DayChecklist appointment={appointment} items={appointmentChecklist(requiredDocuments)} />
          </div>
          <div className="lg:col-span-2">
            <ReadinessPanel maxSteps={5} showAppointment={false} />
          </div>
        </div>
      )}
    </div>
  )
}

function AppointmentForm({ existing, onDone }: { existing: Appointment | null; onDone: () => void }) {
  const [form, setForm] = useState({
    at: existing ? toLocalInput(existing.at) : "",
    embassy: existing?.embassy ?? "",
    city: existing?.city ?? "",
    address: existing?.address ?? "",
    notes: existing?.notes ?? "",
  })
  const [saving, setSaving] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return
    const at = new Date(form.at)
    if (Number.isNaN(at.getTime())) return toast.error("Choose the date and time of your appointment")
    if (at.getTime() < Date.now()) return toast.error("That date is in the past")
    if (!form.embassy.trim() || !form.city.trim()) return toast.error("Add the embassy or visa centre and its city")
    setSaving(true)
    try {
      const dateChanged = existing?.atMs !== at.getTime()
      const appointment: Appointment = {
        at: at.toISOString(),
        atMs: at.getTime(),
        embassy: form.embassy.trim().slice(0, 120),
        city: form.city.trim().slice(0, 80),
        address: form.address.trim().slice(0, 200),
        notes: form.notes.trim().slice(0, 1000),
        checklist: existing?.checklist ?? {},
        // A new date gets a fresh set of reminders.
        remindersSent: dateChanged ? {} : existing?.remindersSent ?? {},
      }
      await updateDoc(doc(db, "users", user.uid), { appointment })
      toast.success(existing ? "Appointment updated" : "Appointment saved. We'll remind you before it.")
      onDone()
    } catch (err) {
      console.error(err)
      toast.error("Couldn't save your appointment")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="appt-at">Date and time</Label>
          <Input id="appt-at" type="datetime-local" value={form.at} onChange={(e) => setForm({ ...form, at: e.target.value })} required />
          <p className="text-xs text-lp-muted">In your local time.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="appt-embassy">Embassy or visa centre</Label>
          <Input id="appt-embassy" placeholder="e.g. US Embassy, VFS Global" value={form.embassy} onChange={(e) => setForm({ ...form, embassy: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="appt-city">City</Label>
          <Input id="appt-city" placeholder="e.g. Accra" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="appt-address">Address (optional)</Label>
          <Input id="appt-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="appt-notes">Notes (optional)</Label>
          <Textarea id="appt-notes" placeholder="Confirmation number, what to ask, who's coming with you…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="rounded-full" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : existing ? "Save changes" : "Save appointment"}
        </Button>
        {existing && <Button type="button" variant="ghost" className="rounded-full" onClick={onDone}>Cancel</Button>}
      </div>
    </form>
  )
}

function AppointmentSummary({ appointment, onEdit }: { appointment: Appointment; onEdit: () => void }) {
  const [removing, setRemoving] = useState(false)
  const when = new Date(appointment.at).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })
  const place = [appointment.embassy, appointment.address, appointment.city].filter(Boolean).join(", ")

  const addToCalendar = () => {
    const ics = buildSessionIcs({
      id: `appointment-${appointment.atMs}`,
      title: `Visa appointment: ${appointment.embassy}`,
      description: appointment.notes || "Bring your documents checklist from Elora Visa.",
      scheduledAt: appointment.at,
      location: place,
      alarmMinutes: 120,
    })
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "visa-appointment.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  const remove = async () => {
    const user = auth.currentUser
    if (!user || !confirm("Remove this appointment? Reminders for it will stop.")) return
    setRemoving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), { appointment: deleteField() })
      toast.success("Appointment removed")
    } catch {
      toast.error("Couldn't remove the appointment")
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-5 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold tracking-[-0.03em]">{when}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-lp-muted"><MapPin className="h-4 w-4" /> {place}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="rounded-full" onClick={addToCalendar}><CalendarPlus className="mr-1 h-4 w-4" /> Calendar</Button>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onEdit} aria-label="Edit appointment"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="rounded-full text-red-600" onClick={remove} disabled={removing} aria-label="Remove appointment"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <Countdown atMs={appointment.atMs} />
      {appointment.notes && <p className="whitespace-pre-wrap rounded-xl bg-lp-card-2 p-3 text-sm">{appointment.notes}</p>}
    </div>
  )
}

function DayChecklist({ appointment, items }: { appointment: Appointment; items: { key: string; label: string }[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(appointment.checklist ?? {})
  const done = items.filter((i) => checked[i.key]).length

  const toggle = async (key: string, value: boolean) => {
    const user = auth.currentUser
    if (!user) return
    setChecked((c) => ({ ...c, [key]: value }))
    try {
      await updateDoc(doc(db, "users", user.uid), { [`appointment.checklist.${key}`]: value })
    } catch {
      setChecked((c) => ({ ...c, [key]: !value }))
      toast.error("Couldn't save that")
    }
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">What to bring</h2>
        <span className="text-sm text-lp-muted">{done} of {items.length} ready</span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-lp-sky">
              <Checkbox checked={!!checked[item.key]} onCheckedChange={(v) => toggle(item.key, v === true)} className="mt-0.5" />
              <span className={`text-sm ${checked[item.key] ? "text-lp-muted line-through" : ""}`}>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-lp-muted">Requirements differ by embassy. Check your appointment letter for anything extra.</p>
    </div>
  )
}
