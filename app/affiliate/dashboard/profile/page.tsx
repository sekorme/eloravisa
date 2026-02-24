"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { getInfluencerData } from '@/lib/influencerAuth'
import { auth, db, storage } from '@/firebase/client'
import { doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { sendPasswordResetEmail, signOut } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Loader2, Save, Upload, Trash2, User2, Mail, Phone } from 'lucide-react'

export default function AffiliateProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data: any = await getInfluencerData(user.uid)
        if (data) {
          setFullName(data.fullName || '')
          setPhone(data.phone || '')
          setCountry(data.country || '')
          setAvatarUrl(data.avatarUrl)
        }
      } catch (e) {
        console.error(e)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'influencers', user.uid), {
        fullName,
        phone,
        country,
        avatarUrl: avatarUrl || null,
        updatedAt: Date.now(),
      })
      toast.success('Profile updated')
    } catch (e) {
      console.error(e)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user || !file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `influencer_avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, 'influencers', user.uid), { avatarUrl: url, updatedAt: Date.now() })
      setAvatarUrl(url)
      toast.success('Avatar updated')
    } catch (e) {
      console.error(e)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const requestPasswordChange = async () => {
    try {
      const email = auth.currentUser?.email
      if (!email) return toast.error('No email found on account')
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent')
    } catch (e) {
      console.error(e)
      toast.error('Failed to send reset email')
    }
  }

  const deleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/affiliate/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to delete account')
      }
      toast.success('Account deleted successfully')
      await signOut(auth)
      router.replace('/')
    } catch (e) {
      console.error(e)
      toast.error((e as Error).message || 'Failed to delete account')
    } finally {
      setDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information, password and account.</p>
        </div>

        <Card className="shadow-lg border-none ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <User2 className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Update your name, phone, and country.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{(fullName || user?.email || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-3">
                <Input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
                />
                <Button variant="secondary" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Uploading...</>) : (<><Upload className="h-4 w-4 mr-2"/>Upload</>)}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 rounded-xl border-2 py-6" placeholder="Your name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 rounded-xl border-2 py-6" placeholder="Phone number" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl border-2 py-6" placeholder="Country" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg" className="px-8 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</>) : (<><Save className="mr-2 h-4 w-4"/>Save Changes</>)}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Password & Security</CardTitle>
            </div>
            <CardDescription>Request a password reset link to your email.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">We will send a reset email to: <span className="font-semibold text-foreground">{user?.email}</span></div>
              <Button onClick={requestPasswordChange} variant="outline">Send Reset Email</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Permanently delete your affiliate account and data.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">This action cannot be undone.</div>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" disabled={deleting}>
                  {deleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Deleting...</>) : (<><Trash2 className="mr-2 h-4 w-4"/>Delete Account</>)}
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => {
                        e.preventDefault()
                        deleteAccount()
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
