import { memo } from "react";
import type { PDFDocument, PDFPage } from "./BasePDFRenderer";
import BasePDFRenderer from "./BasePDFRenderer";

export type PDFRenderOptions = {
	width: number;
	height: number;
	baseX: number;
	baseY: number;
	scale: number;
};

const PDFRenderer = ({
	pdfDocumentURL,
	pdfPageIndex = 0,
	pdfRenderOptions = {
		width: 0,
		height: 0,
		baseX: 0,
		baseY: 0,
		scale: 1,
	},
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
}: {
	pdfDocumentURL: string;
	pdfPageIndex?: number;
	pdfRenderOptions?: PDFRenderOptions;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
}) => {
	return (
		<div
			style={{
				width: pdfRenderOptions.width,
				height: pdfRenderOptions.height,
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
					pdfRenderWidth={pdfRenderOptions.width}
					pdfRenderHeight={pdfRenderOptions.height}
					pdfRenderScale={pdfRenderOptions.scale}
					onPdfDocumentChange={onPdfDocumentChange}
					onPdfPageChange={onPdfPageChange}
				/>
			</div>
		</div>
	);
};

export default memo(PDFRenderer);
