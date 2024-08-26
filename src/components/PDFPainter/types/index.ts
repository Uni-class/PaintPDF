import { PDFDocument, PDFItemClickHandlerArguments, PDFPage, PDFViewerController } from "../../PDF/types";
import { MouseEventHandler, WheelEventHandler } from "react";

export type PaintMode = "default" | "move" | "draw";

export type PDFPainterController = {
	getPaintMode: () => PaintMode;
	setPaintMode: (paintMode: PaintMode) => void;
} & PDFViewerController;

export type PDFPainterControllerHook = {
	pdfPainterController: PDFPainterController;
	onPdfDocumentChange: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange: (pdfPage: PDFPage | null) => void;
	onPdfItemClick: ({ pageIndex, destination }: PDFItemClickHandlerArguments) => void;
	onPdfMouseMoveEvent: MouseEventHandler;
	onPdfWheelEvent: WheelEventHandler;
};
