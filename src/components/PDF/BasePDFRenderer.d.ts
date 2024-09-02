import { PDFDocument, PDFPage, PDFItemClickHandlerArguments } from './types';
export declare const BasePDFRenderer: import('react').MemoExoticComponent<({ pdfDocumentURL, pdfPageIndex, pdfRenderWidth, pdfRenderHeight, pdfRenderScale, onPdfDocumentChange, onPdfPageChange, onPdfItemClick, }: {
    pdfDocumentURL: string;
    pdfPageIndex: number;
    pdfRenderWidth: number;
    pdfRenderHeight: number;
    pdfRenderScale: number;
    onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
    onPdfPageChange?: (pdfPage: PDFPage | null) => void;
    onPdfItemClick?: ({ pageIndex, destination }: PDFItemClickHandlerArguments) => void;
}) => import("react/jsx-runtime").JSX.Element>;
