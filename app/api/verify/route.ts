import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      ".well-known",
      "apple-developer-merchantid-domain-association",
    );
    const fileContent = await readFile(filePath, "utf-8");

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/text",
      },
    });
  } catch (error) {
    return new NextResponse("Verification file not found", { status: 404 });
  }
}
