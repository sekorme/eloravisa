"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

// Catches errors thrown while rendering the root layout itself, which no
// nested error boundary can, and reports them to Sentry.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                {/* NextError requires a statusCode; App Router doesn't expose one for errors. */}
                <NextError statusCode={0} />
            </body>
        </html>
    );
}
