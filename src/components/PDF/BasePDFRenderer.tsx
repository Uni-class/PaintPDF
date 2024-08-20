import { useCallback, useMemo, memo, ReactNode } from "react";
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
	pdfPageIndex,
	pdfMaxWidth,
	pdfMaxHeight,
	pdfScale,
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
}: {
	pdfDocumentURL: string;
	pdfPageIndex: number;
	pdfMaxWidth: number;
	pdfMaxHeight: number;
	pdfScale: number;
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
						width: pdfMaxWidth,
						height: pdfMaxHeight,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					{fallback}
				</div>
			);
		},
		[pdfMaxWidth, pdfMaxHeight],
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
				width={pdfMaxWidth}
				height={pdfMaxHeight}
				scale={pdfScale}
				pageIndex={pdfPageIndex}
				onLoadSuccess={onPdfPageLoadSuccess}
				onLoadError={onPdfPageLoadError}
			/>
		</Document>
	);
};

export default memo(BasePDFRenderer);
