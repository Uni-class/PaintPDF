import { ReactNode } from 'react';
import { PDFPainterControllerHook } from './types';
export declare const PDFPainter: import('react').MemoExoticComponent<({ painterId, pdfDocumentURL, customPdfPainterControllerHook, children, }: {
    painterId: string;
    pdfDocumentURL: string;
    customPdfPainterControllerHook?: PDFPainterControllerHook;
    children?: ReactNode;
}) => import("react/jsx-runtime").JSX.Element>;
