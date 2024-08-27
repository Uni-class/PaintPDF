import { Editor } from "tldraw";

import { PDFDocument, PDFItemClickHandlerArguments, PDFPage, PDFViewerController } from "../../PDF/types";

export type PaintMode = "default" | "move" | "draw";

export type PDFPainterController = {
	getPaintMode: () => PaintMode;
	setPaintMode: (paintMode: PaintMode) => void;
} & PDFViewerController;

export type PDFPainterControllerHook = {
	pdfPainterController: PDFPainterController;
	registerEditor: (editorId: number, editor: Editor) => void;
	onPdfDocumentChange: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange: (pdfPage: PDFPage | null) => void;
	onPdfItemClick: ({ pageIndex, destination }: PDFItemClickHandlerArguments) => void;
	onPdfMouseMoveEvent: (event: MouseEvent) => void;
	onPdfWheelEvent: (event: WheelEvent) => void;
};
