import { useEffect, useState, useCallback, memo } from "react";
import { pdfjs, Document, Page } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type PDFDocument = pdfjs.PDFDocumentProxy;

export type PDFPage = pdfjs.PDFPageProxy & {
	width: number;
	height: number;
	originalWidth: number;
	originalHeight: number;
};

const BasePDFRenderer = ({
	pdfDocumentURL,
	pdfPageIndex = 0,
	pdfScale = 1,
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
}: {
	pdfDocumentURL: string;
	pdfPageIndex?: number;
	pdfScale?: number;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
}) => {
	const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
	const [pdfPage, setPdfPage] = useState<PDFPage | null>(null);

	useEffect(() => {
		if (onPdfDocumentChange) {
			onPdfDocumentChange(pdfDocument);
		}
	}, [pdfDocument, onPdfDocumentChange]);

	useEffect(() => {
		if (onPdfPageChange) {
			onPdfPageChange(pdfPage);
		}
	}, [pdfPage, onPdfPageChange]);

	const onPdfDocumentLoadSuccess = useCallback((pdfDocument: PDFDocument) => {
		setPdfDocument(pdfDocument);
	}, []);

	const onPdfPageLoadSuccess = useCallback((pdfPage: PDFPage) => {
		setPdfPage(pdfPage);
	}, []);

	const onPdfDocumentLoadError = useCallback((error: Error) => {
		console.log(`Unable to load PDF document: ${error}`);
		setPdfDocument(null);
	}, []);

	const onPdfPageLoadError = useCallback((error: Error) => {
		console.log(`Unable to load PDF page: ${error}`);
		setPdfPage(null);
	}, []);

	return (
		<Document file={pdfDocumentURL} onLoadSuccess={onPdfDocumentLoadSuccess} onLoadError={onPdfDocumentLoadError}>
			<Page scale={pdfScale} pageIndex={pdfPageIndex} onLoadSuccess={onPdfPageLoadSuccess} onLoadError={onPdfPageLoadError} />
		</Document>
	);
};

export default memo(BasePDFRenderer);
