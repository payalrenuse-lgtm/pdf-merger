import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const originalSize = file.size;
    const compressedSize = pdfBytes.length;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
        "X-Original-Size": String(originalSize),
        "X-Compressed-Size": String(compressedSize),
      },
    });
  } catch (error) {
    console.error("PDF compress error:", error);
    return NextResponse.json(
      { error: "Failed to compress PDF. Please ensure the file is valid." },
      { status: 500 }
    );
  }
}
