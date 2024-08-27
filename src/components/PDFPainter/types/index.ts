import { Editor, TLEditorSnapshot } from "tldraw";

import { PDFDocument, PDFItemClickHandlerArguments, PDFPage, PDFViewerController } from "../../PDF/types";

export type PaintMode = "default" | "move" | "draw";

export type EditorSnapshot = TLEditorSnapshot;

export type PDFPainterController = {
	getPaintMode: () => PaintMode;
	setPaintMode: (paintMode: PaintMode) => void;
} & PDFViewerController;

export type PDFPainterControllerHook = {
	pdfPainterController: PDFPainterController;
	registerEditor: (editorId: string, editor: Editor) => void;
	unregisterEditor: (editorId: string) => void;
	getEditor: (editorId: string) => Editor | null;
	getEditorSnapshot: (editorId: string, pageIndex: number) => EditorSnapshot | null;
	setEditorSnapshot: (editorId: string, pageIndex: number, snapshot: EditorSnapshot) => void;
	clearEditorSnapshot: (editorId: string, pageIndex: number) => void;
	loadEditorSnapshot: (editorId: string, pageIndex: number) => void;
	saveEditorSnapshot: (editorId: string, pageIndex: number) => void;
	loadPageSnapshots: (pageIndex: number) => void;
	savePageSnapshots: (pageIndex: number) => void;
	onPdfDocumentChange: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange: (pdfPage: PDFPage | null) => void;
	onPdfItemClick: ({ pageIndex, destination }: PDFItemClickHandlerArguments) => void;
	onPdfMouseMoveEvent: (event: MouseEvent) => void;
	onPdfWheelEvent: (event: WheelEvent) => void;
};
