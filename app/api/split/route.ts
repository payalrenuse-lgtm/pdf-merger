import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

function parsePageRange(range: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = range.split(",").map((p) => p.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((s) => parseInt(s.trim(), 10));
      const from = Math.max(1, Math.min(start || 1, totalPages));
      const to = Math.max(1, Math.min(end || totalPages, totalPages));
      for (let i = from; i <= to; i++) {
        pages.push(i - 1); // 0-indexed
      }
    } else {
      const num = parseInt(part, 10);
      if (num >= 1 && num <= totalPages) {
        pages.push(num - 1);
      }
    }
  }

  return [...new Set(pages)].sort((a, b) => a - b);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const range = formData.get("range") as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();

    if (totalPages === 0) {
      return NextResponse.json(
        { error: "PDF has no pages" },
        { status: 400 }
      );
    }

    const pageIndices =
      range && range.toLowerCase() !== "all" && range.trim() !== ""
        ? parsePageRange(range, totalPages)
        : Array.from({ length: totalPages }, (_, i) => i);

    if (pageIndices.length === 0) {
      return NextResponse.json(
        { error: "No valid pages selected. Use format: 1,3,5 or 1-5" },
        { status: 400 }
      );
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);

    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    const pdfBytes = await newPdf.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="split.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF split error:", error);
    return NextResponse.json(
      { error: "Failed to split PDF. Please ensure the file is valid." },
      { status: 500 }
    );
  }
}
