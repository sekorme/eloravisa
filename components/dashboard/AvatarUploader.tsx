"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Camera } from "lucide-react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db, storage } from "@/firebase/client"
import { toast } from "sonner"

interface AvatarUploaderProps {
    currentAvatarUrl?: string
    fullName: string
    onAvatarUpdate: (url: string) => void
}

export function AvatarUploader({ currentAvatarUrl, fullName, onAvatarUpdate }: AvatarUploaderProps) {
    const [uploading, setUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file || !auth.currentUser) return

        setUploading(true)
        try {
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/avatar`)
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on(
                "state_changed",
                () => {}, // Progress (optional)
                (error) => {
                    // richer logging
                    try {
                        const payload = { code: (error as any)?.code, message: (error as any)?.message, ...Object.getOwnPropertyNames(error as object).reduce((acc: any, k) => { try { acc[k] = (error as any)[k] } catch {} return acc }, {}) }
                        console.error('Avatar upload error payload:', payload)
                    } catch (e) {
                        console.error('Failed to serialize avatar upload error', e)
                    }

                    toast.error("Failed to upload avatar. Check console for details.")
                    setUploading(false)
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                    
                    // Update Firestore
                    if (auth.currentUser) {
                        await updateDoc(doc(db, "users", auth.currentUser.uid), {
                            avatarUrl: downloadURL
                        })
                    }
                    
                    onAvatarUpdate(downloadURL)
                    toast.success("Avatar updated successfully")
                    setUploading(false)
                }
            )
        } catch (error) {
            console.error("Error uploading avatar:", error)
            toast.error("An error occurred")
            setUploading(false)
        }
    }, [onAvatarUpdate])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
        maxFiles: 1,
        disabled: uploading
    })

    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)

    return (
        <div className="flex flex-col items-center gap-4">
            <div {...getRootProps()} className="relative group cursor-pointer">
                <input {...getInputProps()} />
                <Avatar className="h-32 w-32 border-4 border-lp-card ring-1 ring-lp-line lp-shadow">
                    <AvatarImage src={currentAvatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-lp-sky font-display text-2xl font-semibold text-lp-azure">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                
                <div className="absolute inset-0 flex items-center justify-center bg-lp-navy/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white" />
                    )}
                </div>
            </div>
            <div className="text-center">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full border-lp-fg/20 bg-transparent px-4 font-semibold text-lp-fg hover:border-lp-fg/50 hover:bg-lp-card-2"
                    onClick={(e) => { 
                        e.preventDefault(); 
                        (document.querySelector('input[type="file"]') as HTMLInputElement)?.click() 
                    }} 
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Change Photo"}
                </Button>
                <p className="mt-2 text-xs text-lp-muted">
                    JPG, GIF or PNG. Max 1MB.
                </p>
            </div>
        </div>
    )
}
