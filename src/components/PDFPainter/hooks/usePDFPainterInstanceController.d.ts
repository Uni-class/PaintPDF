import { PDFPainterController, PDFPainterInstanceControllerHook, PDFPainterInstanceStoreUpdateHandler } from '../types';
export declare const usePDFPainterInstanceController: ({ editorId, pdfPainterController, onStoreUpdate, }: {
    editorId: string;
    pdfPainterController: PDFPainterController;
    onStoreUpdate?: PDFPainterInstanceStoreUpdateHandler;
}) => PDFPainterInstanceControllerHook;
