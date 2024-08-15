import { useState, useEffect, memo } from "react";
import type { PDFDocument, PDFPage } from "./BasePDFRenderer";
import BasePDFRenderer from "./BasePDFRenderer";

export type PdfRenderOptions = {
	baseX: number;
	baseY: number;
	scale: number;
};

const PDFRenderer = ({
	pdfDocumentURL,
	pdfPageIndex = 0,
	pdfRenderOptions = {
		baseX: 0,
		baseY: 0,
		scale: 1,
	},
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
}: {
	pdfDocumentURL: string;
	pdfPageIndex?: number;
	pdfRenderOptions?: PdfRenderOptions;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
}) => {
	const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
	const [pdfPage, setPdfPage] = useState<PDFPage | null>(null);

	useEffect(() => {
		onPdfDocumentChange(pdfDocument);
	}, [onPdfDocumentChange, pdfDocument]);

	useEffect(() => {
		onPdfPageChange(pdfPage);
	}, [onPdfPageChange, pdfPage]);

	return (
		<div
			style={{
				width: pdfPage?.originalWidth,
				height: pdfPage?.originalHeight,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					transform: `translate(${-pdfRenderOptions.baseX * pdfRenderOptions.scale}px, ${-pdfRenderOptions.baseY * pdfRenderOptions.scale}px)`,
				}}
			>
				<BasePDFRenderer
					pdfDocumentURL={pdfDocumentURL}
					pdfPageIndex={pdfPageIndex}
					pdfScale={pdfRenderOptions.scale}
					onPdfDocumentChange={setPdfDocument}
					onPdfPageChange={setPdfPage}
				/>
			</div>
		</div>
	);
};

export default memo(PDFRenderer);
