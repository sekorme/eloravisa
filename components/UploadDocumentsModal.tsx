"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, File, CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { auth, db, storage } from "@/firebase/client"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type TriggerVariant = "navy" | "white" | "tile"

const triggerBase = "group cursor-pointer border-none font-semibold transition-[background-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 focus-visible:ring-offset-lp-page"

const triggerVariants: Record<TriggerVariant, { button: string; chip: string }> = {
    navy: {
        button: "inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-lp-navy pl-1.5 pr-6 text-sm text-white hover:bg-lp-navy-2 hover:shadow-[0_16px_40px_-12px_rgba(8,32,26,0.55)]",
        chip: "h-9 w-9 rounded-full bg-white/10 text-[#8FCDAF]",
    },
    white: {
        button: "inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white pl-1.5 pr-6 text-sm text-lp-navy hover:bg-lp-sky-2 hover:shadow-[0_16px_40px_-12px_rgba(8,32,26,0.35)]",
        chip: "h-9 w-9 rounded-full bg-lp-sky text-lp-azure",
    },
    // Large card-style trigger for action grids (dashboard Quick Actions)
    tile: {
        button: "relative flex h-full min-h-[168px] w-full flex-col items-start justify-between rounded-[1.25rem] bg-lp-navy p-5 text-left font-display text-base tracking-[-0.02em] text-white hover:bg-lp-navy-2 md:p-6",
        chip: "h-12 w-12 rounded-xl bg-white/10 text-[#8FCDAF] transition-transform duration-300 group-hover:-rotate-6",
    },
}

export function UploadDocumentsModal({ variant = "navy", className }: { variant?: TriggerVariant; className?: string } = {}) {
    const [user, setUser] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [availableSteps, setAvailableSteps] = useState<any[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                if (isOpen) {
                    const userDocRef = doc(db, "users", currentUser.uid)
                    const userDoc = await getDoc(userDocRef)
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        const visaType = userData.onboarding?.visaType
                        const requiredDocs = getRequiredDocuments(visaType)
                        
                        const uploadedKeys = Object.keys(userData.documents || {})
                        const remainingSteps = requiredDocs.filter(step => !uploadedKeys.includes(step.key))
                        setAvailableSteps(remainingSteps)
                    } else {
                        setAvailableSteps(getRequiredDocuments())
                    }
                }
            } else {
                setUser(null)
            }
        })
        return () => unsubscribe()
    }, [isOpen])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setFile(acceptedFiles[0])
            setError(null)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] },
        maxFiles: 1,
    })

    const handleUpload = async () => {
        if (!file || !user) {
            setError("Please select a file to upload.")
            return
        }

        setUploading(true)
        setError(null)
        setUploadProgress(0)

        const currentDocument = availableSteps[currentStep]
        const storageRef = ref(storage, `users/${user.uid}/documents/${currentDocument.key}_${file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setUploadProgress(progress)
            },
            (error) => {
                // Improved error logging: show code and message and full payload where possible
                try {
                    const errPayload = {
                        code: (error as any)?.code,
                        message: (error as any)?.message,
                        name: (error as any)?.name,
                        ...Object.getOwnPropertyNames(error as object).reduce((acc: any, key) => {
                            try { acc[key] = (error as any)[key] } catch { }
                            return acc
                        }, {})
                    }
                    console.error('Upload error payload:', errPayload)
                } catch (logErr) {
                    console.error('Failed serializing upload error', logErr)
                }

                setError("Failed to upload file. Please try again.")
                toast.error("Failed to upload file. Check console for details.")
                setUploading(false)
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                const userDocRef = doc(db, "users", user.uid)

                try {
                    const userDoc = await getDoc(userDocRef);
                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, { documents: {} }, { merge: true });
                    }

                    // Save URL, type, name, and timestamp
                    await updateDoc(userDocRef, {
                        [`documents.${currentDocument.key}`]: {
                            url: downloadURL,
                            type: file.type,
                            name: file.name,
                            uploadedAt: new Date().toISOString()
                        },
                        updatedAt: new Date().toISOString() // Keep updating the main doc timestamp too
                    })

                    setFile(null)
                    setUploading(false)
                    toast.success(`${currentDocument.title} uploaded successfully`)

                    // Refresh available steps
                    const updatedSteps = availableSteps.filter((_, index) => index !== currentStep)
                    setAvailableSteps(updatedSteps)

                    if (currentStep >= updatedSteps.length) {
                        setCurrentStep(0)
                    }

                } catch (dbError) {
                    console.error("Firestore error:", dbError)
                    setError("Failed to save document link. Please try again.")
                    toast.error("Failed to save document link")
                    setUploading(false)
                }
            }
        )
    }

    // A picked file belongs to the step it was picked on — drop it when moving
    // so it can't be uploaded under a different document.
    const nextStep = () => {
        setFile(null)
        setError(null)
        setCurrentStep((prev) => Math.min(prev + 1, availableSteps.length - 1))
    }

    const prevStep = () => {
        setFile(null)
        setError(null)
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const trigger = triggerVariants[variant]

    const currentDocument = availableSteps[currentStep]

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button type="button" className={cn(triggerBase, trigger.button, className)}>
                    <span className={cn("flex shrink-0 items-center justify-center", trigger.chip)} aria-hidden="true">
                        <Upload className={cn("transition-transform duration-300 group-hover:-translate-y-0.5", variant === "tile" ? "h-6 w-6" : "h-4 w-4")} />
                    </span>
                    Upload Document
                </button>
            </DialogTrigger>
            <DialogContent className="rounded-[1.5rem] border-lp-line bg-lp-card text-lp-fg sm:max-w-[460px]">
                {availableSteps.length > 0 && currentDocument ? (
                    <>
                        <DialogHeader>
                            <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">
                                Step {currentStep + 1} of {availableSteps.length}
                            </span>
                            <DialogTitle className="font-display text-xl font-semibold tracking-[-0.03em]">{currentDocument.title}</DialogTitle>
                            <DialogDescription className="sr-only">
                                Step {currentStep + 1} of {availableSteps.length}: {currentDocument.title}
                            </DialogDescription>
                            <div className="flex gap-1 pt-2" aria-hidden="true">
                                {availableSteps.map((step, i) => (
                                    <span key={step.key} className={cn("h-1 flex-1 rounded-full", i === currentStep ? "bg-lp-azure" : "bg-lp-sky")} />
                                ))}
                            </div>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure",
                                    isDragActive ? "border-lp-azure bg-lp-sky" : "border-lp-line bg-lp-card-2 hover:border-lp-azure/50 hover:bg-lp-sky/60"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-3 text-lp-muted">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lp-card text-lp-azure ring-1 ring-lp-line">
                                        <Upload className="h-5 w-5" />
                                    </span>
                                    {isDragActive ? (
                                        <p className="font-semibold text-lp-fg">Drop the file here...</p>
                                    ) : (
                                        <p><span className="font-semibold text-lp-fg">Drag & drop a file here</span>, or click to select</p>
                                    )}
                                    <p className="font-display text-[10px] font-medium uppercase tracking-[0.16em]">PDF, JPG, PNG</p>
                                </div>
                            </div>

                            {file && !uploading && (
                                <div className="flex items-center rounded-xl border border-lp-line bg-lp-card-2 p-3 text-sm">
                                    <File className="mr-2 h-4 w-4 flex-shrink-0 text-lp-azure" />
                                    <span className="truncate">{file.name}</span>
                                </div>
                            )}
                            {uploading && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} />
                                    <p className="text-center text-xs text-lp-muted">{Math.round(uploadProgress)}% uploaded</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.06] dark:text-red-300">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                            <div className="flex w-full items-center justify-between gap-2">
                                <Button variant="ghost" className="rounded-full text-lp-muted hover:bg-lp-card-2 hover:text-lp-fg" onClick={prevStep} disabled={currentStep === 0 || uploading}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleUpload} disabled={!file || uploading} className="h-11 rounded-full bg-lp-navy px-6 font-semibold text-white hover:bg-lp-navy-2">
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Upload & Continue"
                                    )}
                                </Button>
                                <Button variant="ghost" className="rounded-full text-lp-muted hover:bg-lp-card-2 hover:text-lp-fg" onClick={nextStep} disabled={currentStep === availableSteps.length - 1 || uploading}>
                                    Skip <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.03em]">
                                <CheckCircle className="h-6 w-6 text-lp-azure" />
                                All Documents Uploaded
                            </DialogTitle>
                            <DialogDescription className="text-lp-muted">
                                You have successfully uploaded all required documents.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button className="h-11 rounded-full bg-lp-navy px-6 font-semibold text-white hover:bg-lp-navy-2" onClick={() => setIsOpen(false)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
