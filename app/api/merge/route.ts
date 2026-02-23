import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No PDF files provided" },
        { status: 400 }
      );
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (file.size === 0) {
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      const copiedPages = await mergedPdf.copyPages(pdf, Array.from({ length: pageCount }, (_, i) => i));

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    const mergedPdfBytes = await mergedPdf.save();

    return new NextResponse(mergedPdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "X-Merged-File-Size": String(mergedPdfBytes.length),
      },
    });
  } catch (error) {
    console.error("PDF merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge PDFs. Please ensure all files are valid PDFs." },
      { status: 500 }
    );
  }
}
