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
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

const documentSteps = [
    { key: "passport", title: "Passport", description: "A valid passport with at least 6 months validity." },
    { key: "financialStatement", title: "Financial Statement", description: "Bank statements, sponsor's statements, etc." },
    { key: "statementOfPurpose", title: "Statement of Purpose", description: "Explain purpose, duration, funding, and return plan." },
    { key: "travelItinerary", title: "Travel Itinerary", description: "Flight reservations, etc." },
    { key: "proofOfAccommodation", title: "Proof of Accommodation", description: "Hotel reservation, host invitation, etc." },
    { key: "purposeOfTravel", title: "Purpose of Travel", description: "Admission letter, job offer, invitation letter, etc." },
    { key: "homeTies", title: "Home Ties", description: "Employment letter, business registration, proof of family responsibility, etc." },
]

export function UploadDocumentsModal() {
    const [user, setUser] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [availableSteps, setAvailableSteps] = useState(documentSteps)
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
                        const uploadedKeys = Object.keys(userData.documents || {})
                        const remainingSteps = documentSteps.filter(step => !uploadedKeys.includes(step.key))
                        setAvailableSteps(remainingSteps)
                    } else {
                        setAvailableSteps(documentSteps)
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
                console.error("Upload error:", error)
                setError("Failed to upload file. Please try again.")
                toast.error("Failed to upload file")
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

                    // Save URL, type, and name
                    await updateDoc(userDocRef, {
                        [`documents.${currentDocument.key}`]: {
                            url: downloadURL,
                            type: file.type,
                            name: file.name
                        },
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

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, availableSteps.length - 1))
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const currentDocument = availableSteps[currentStep]

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors">
                    <Upload className="mr-2 w-5 h-5" />
                    Upload Document
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {availableSteps.length > 0 && currentDocument ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Upload Documents</DialogTitle>
                            <DialogDescription>
                                Step {currentStep + 1} of {availableSteps.length}: {currentDocument.title}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div
                                {...getRootProps()}
                                className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="w-8 h-8" />
                                    {isDragActive ? (
                                        <p>Drop the file here...</p>
                                    ) : (
                                        <p>Drag & drop a file here, or click to select</p>
                                    )}
                                    <p className="text-xs">PDF, JPG, PNG</p>
                                </div>
                            </div>

                            {file && !uploading && (
                                <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                                    <File className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                </div>
                            )}
                            {uploading && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} />
                                    <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}% uploaded</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center p-2 bg-red-100 dark:bg-red-900/30 rounded-md text-sm text-red-600">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                            <div className="flex justify-between w-full">
                                <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0 || uploading}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                                <Button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-600 hover:bg-blue-700">
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Upload & Continue"
                                    )}
                                </Button>
                                <Button variant="ghost" onClick={nextStep} disabled={currentStep === availableSteps.length - 1 || uploading}>
                                    Skip <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                All Documents Uploaded
                            </DialogTitle>
                            <DialogDescription>
                                You have successfully uploaded all required documents.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => setIsOpen(false)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
