import { PDFDocument, PDFPage, PDFItemClickHandlerArguments, PDFRenderOptions } from './types';
export declare const PDFRenderer: import('react').MemoExoticComponent<({ pdfDocumentURL, pdfPageIndex, pdfRenderOptions, pdfInteractionEnabled, pdfItemClickEnabled, onPdfDocumentChange, onPdfPageChange, onPdfItemClick, }: {
    pdfDocumentURL: string;
    pdfPageIndex?: number;
    pdfRenderOptions?: PDFRenderOptions;
    pdfInteractionEnabled?: boolean;
    pdfItemClickEnabled?: boolean;
    onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
    onPdfPageChange?: (pdfPage: PDFPage | null) => void;
    onPdfItemClick?: ({ pageIndex, destination }: PDFItemClickHandlerArguments) => void;
}) => import("react/jsx-runtime").JSX.Element>;
