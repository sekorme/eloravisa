import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    // Get the user's IP address
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "8.8.8.8"; // Fallback for dev

    // Call IP geolocation API
    try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/country_name/`);
        const country = (await geoRes.text()) || "Other";

        const response = NextResponse.next();
        response.cookies.set("user-country", country, { path: "/" });
        return response;
    } catch (error) {
        console.error("Geo lookup failed:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: ["/", "/courses", "/learn", "/dashboard"],
};
