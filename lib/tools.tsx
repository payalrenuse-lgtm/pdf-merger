"use client";

const MergeIcon = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const SplitIcon = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CompressIcon = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const PdfToJpgIcon = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const JpgToPdfIcon = () => (
  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export const tools = [
  {
    href: "/merge",
    icon: <MergeIcon />,
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document",
  },
  {
    href: "/split",
    icon: <SplitIcon />,
    title: "Split PDF",
    description: "Extract selected pages from your PDF",
  },
  {
    href: "/compress",
    icon: <CompressIcon />,
    title: "Compress PDF",
    description: "Reduce PDF file size while preserving quality",
  },
  {
    href: "/pdf-to-jpg",
    icon: <PdfToJpgIcon />,
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality images",
  },
  {
    href: "/jpg-to-pdf",
    icon: <JpgToPdfIcon />,
    title: "JPG to PDF",
    description: "Convert images into a single PDF document",
  },
];
