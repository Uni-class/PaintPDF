import { useCallback, useMemo, memo, ReactNode } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import type { PDFDocument, PDFPage } from "./types";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BasePDFRenderer = ({
	pdfDocumentURL,
	pdfPageIndex,
	pdfRenderWidth,
	pdfRenderHeight,
	pdfRenderScale,
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
}: {
	pdfDocumentURL: string;
	pdfPageIndex: number;
	pdfRenderWidth: number;
	pdfRenderHeight: number;
	pdfRenderScale: number;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
}) => {
	const onPdfDocumentLoadSuccess = useCallback(
		(pdfDocument: PDFDocument) => {
			onPdfDocumentChange(pdfDocument);
		},
		[onPdfDocumentChange],
	);

	const onPdfPageLoadSuccess = useCallback(
		(pdfPage: PDFPage) => {
			onPdfPageChange(pdfPage);
		},
		[onPdfPageChange],
	);

	const onPdfDocumentLoadError = useCallback(
		(error: Error) => {
			console.log(`Unable to load PDF document: ${error}`);
			onPdfDocumentChange(null);
		},
		[onPdfDocumentChange],
	);

	const onPdfPageLoadError = useCallback(
		(error: Error) => {
			console.log(`Unable to load PDF page: ${error}`);
			onPdfPageChange(null);
		},
		[onPdfPageChange],
	);

	const createFallback = useCallback(
		(fallback: ReactNode) => {
			return (
				<div
					style={{
						display: "flex",
						width: pdfRenderWidth,
						height: pdfRenderHeight,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{fallback}
				</div>
			);
		},
		[pdfRenderWidth, pdfRenderHeight],
	);

	const loadingComponent = useMemo(() => {
		return createFallback(
			<div
				style={{
					fontSize: "1.2em",
				}}
			>
				불러오는 중...
			</div>,
		);
	}, [createFallback]);

	const errorComponent = useMemo(() => {
		return createFallback(
			<div
				style={{
					fontSize: "1.2em",
				}}
			>
				오류가 발생하였습니다.
			</div>,
		);
	}, [createFallback]);

	return (
		<Document file={pdfDocumentURL} onLoadSuccess={onPdfDocumentLoadSuccess} onLoadError={onPdfDocumentLoadError}>
			<Page
				loading={loadingComponent}
				error={errorComponent}
				noData={errorComponent}
				width={pdfRenderWidth}
				height={pdfRenderHeight}
				scale={pdfRenderScale}
				pageIndex={pdfPageIndex}
				onLoadSuccess={onPdfPageLoadSuccess}
				onLoadError={onPdfPageLoadError}
			/>
		</Document>
	);
};

export default memo(BasePDFRenderer);
