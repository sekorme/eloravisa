import { LandingPage } from "@/components/landing/LandingPage";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import {isAuthenticated} from "@/action/user";
import {redirect} from "next/navigation";
import InstallPrompt from "@/components/InstallPrompt";

export default async function Page() {
    const user = await isAuthenticated()
    if(user) redirect('/dashboard')
    return (
        <>
            <LandingNavbar />
            <LandingPage />
            <InstallPrompt/>
        </>
    );
}
