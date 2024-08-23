import { pdfjs } from "react-pdf";
import { MutableRefObject } from "react";

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

export type PDFItemClickHandlerArguments = {
	pageIndex: number;
	destination?: unknown[];
};

export type PDFRenderSize = {
	width: number;
	height: number;
};

export type PDFViewerController = {
	getDocument: () => PDFDocument | null;
	getPage: () => PDFPage | null;
	getPageIndex: () => number;
	setPageIndex: (pageIndex: number) => void;
	moveToPreviousPage: () => void;
	moveToNextPage: () => void;
	getPageCount: () => number;
	getRenderOptions: () => PDFRenderOptions;
	setRenderOptions: ({ width, height, baseX, baseY, scale }: PDFRenderOptions) => void;
	getRenderSize: () => PDFRenderSize;
	setRenderSize: ({ width, height }: { width: number; height: number }) => void;
	zoom: ({ offsetX, offsetY, scaleDelta }: { offsetX: number; offsetY: number; scaleDelta: number }) => void;
	isDragModeEnabled: () => boolean;
	setDragModeEnabled: (enabled: boolean) => void;
	drag: ({ deltaX, deltaY }: { deltaX: number; deltaY: number }) => void;
	isItemClickEnabled: () => boolean;
	setItemClickEnabled: (enabled: boolean) => void;
};

export type PDFViewerControllerHook = {
	pdfRendererElement: MutableRefObject<HTMLDivElement | null>;
	pdfViewerController: PDFViewerController;
	onPdfDocumentChange: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange: (pdfPage: PDFPage | null) => void;
	onPdfItemClick: ({ pageIndex, destination }: PDFItemClickHandlerArguments) => void;
};

export type PaintMode = "default" | "move" | "draw";
