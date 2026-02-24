import { auth, db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export async function getCurrentUserDetails() {
    const user = auth.currentUser;

    if (!user) {
        return null;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            // Also check if they are an influencer and don't let them in as a regular user
            const influencerDocRef = doc(db, "influencers", user.uid);
            const influencerDoc = await getDoc(influencerDocRef);
            if (influencerDoc.exists()) {
                 console.log("Influencer tried to sign in as user");
                 return null;
            }

            console.log("No such user document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
}

export function isAuthenticated(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Unsubscribe after the first state change
            resolve(user);
        });
    });
}
