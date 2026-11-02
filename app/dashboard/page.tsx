"use client"

import React from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

// Push registration now runs on every dashboard page (FCMInitializer in the
// dashboard layout), not just here.
const Dashboard = () => <DashboardContent />

export default Dashboard
