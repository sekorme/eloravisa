export async function startPaystackPayment(email: string, amount: number, currency: string, planId: string, onSuccess: (ref: string) => void) {
    if (typeof window === "undefined") return;

    const uid = (await import("firebase/auth")).getAuth().currentUser?.uid;

    await loadScript("https://js.paystack.co/v1/inline.js");

    const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount: Math.round(amount * 100),
        currency,
        metadata: { uid, planId },
        callback: (response: any) => {
            onSuccess(response.reference);
        },
        onClose: function () {
            console.log("Payment window closed");
        },
    });

    handler.openIframe();
}

function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load script"));
        document.body.appendChild(script);
    });
}
