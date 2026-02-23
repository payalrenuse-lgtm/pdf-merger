import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No image files provided" },
        { status: 400 }
      );
    }

    const pdf = await PDFDocument.create();

    for (const file of files) {
      if (file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const isJpeg = file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);

      try {
        const image = isJpeg
          ? await pdf.embedJpg(bytes)
          : await pdf.embedPng(bytes);
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      } catch (embedError) {
        try {
          const image = isJpeg ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
          const page = pdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        } catch {
          console.error("Failed to embed image:", file.name, embedError);
        }
      }
    }

    const pdfBytes = await pdf.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
      },
    });
  } catch (error) {
    console.error("JPG to PDF error:", error);
    return NextResponse.json(
      { error: "Failed to create PDF. Please ensure all files are valid images." },
      { status: 500 }
    );
  }
}
