import { pdfjs } from "react-pdf";

export type PDFDocument = pdfjs.PDFDocumentProxy;

export type PDFPage = pdfjs.PDFPageProxy & {
	width: number;
	height: number;
	originalWidth: number;
	originalHeight: number;
};

export type PDFRenderOptions = {
	width: number;
	height: number;
	baseX: number;
	baseY: number;
	scale: number;
};

export type PDFViewerController = {
	getPdfDocument: () => PDFDocument | null;
	getPdfPage: () => PDFPage | null;
	getPdfPageIndex: () => number;
	setPdfPageIndex: (pdfPageIndex: number) => void;
	moveToPreviousPage: () => void;
	moveToNextPage: () => void;
	getPdfPageCount: () => number;
	getPdfRenderOptions: () => PDFRenderOptions;
	isPdfDragModeEnabled: () => boolean;
	setPdfDragModeEnabled: (pdfDragModeEnabled: boolean) => void;
};
