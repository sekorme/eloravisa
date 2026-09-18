/**
 * Client-side checkout starter.
 *
 * The amount is never computed here: /api/paystack-initialize prices the plan
 * server-side, creates the Paystack transaction + payment intent, and returns
 * an access_code that the inline popup resumes. Fulfilment later refuses any
 * reference that wasn't initialized this way.
 */
export async function startPaystackPayment(
    planKey: string,
    promoCode: string | null,
    onSuccess: (reference: string) => void,
    onCancel?: () => void,
) {
    if (typeof window === "undefined") return;

    const user = (await import("firebase/auth")).getAuth().currentUser;
    if (!user) throw new Error("You must be signed in to pay");
    const idToken = await user.getIdToken();

    const res = await fetch("/api/paystack-initialize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ planId: planKey, promoCode }),
    });
    const data = await res.json();
    if (!res.ok || !data.accessCode) {
        throw new Error(data.error || "Failed to initialize payment");
    }

    const PaystackPop = (await import("@paystack/inline-js")).default;
    new PaystackPop().resumeTransaction(data.accessCode, {
        onSuccess: (transaction) => onSuccess(transaction.reference),
        onCancel: () => onCancel?.(),
        onError: (error) => {
            console.error("Paystack checkout error:", error?.message);
            onCancel?.();
        },
    });
}
