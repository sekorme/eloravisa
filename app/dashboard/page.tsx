"use client"

import React, { useEffect, useState } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { auth } from "@/firebase/client"
import FCMInitializer from "@/components/FCMInitializer";
import { onAuthStateChanged, User } from "firebase/auth";

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <>
            {user && <FCMInitializer userid={user.uid} />}
            <DashboardContent />
        </>
    )
}
export default Dashboard
