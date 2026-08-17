import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import countries from "world-countries";

export function proxy(req: NextRequest) {
    const { country } = geolocation(req);
    const response = NextResponse.next();

    if (country) {
        const match = countries.find((c) => c.cca2 === country);
        const countryName = match?.name.common || country;
        const currencyCode = match ? Object.keys(match.currencies || {})[0] : undefined;

        response.cookies.set("user-country", countryName, { path: "/" });
        if (currencyCode) {
            response.cookies.set("user-currency", currencyCode, { path: "/" });
        }
    }

    return response;
}

export const config = {
    matcher: ["/", "/courses", "/learn", "/dashboard"],
};
