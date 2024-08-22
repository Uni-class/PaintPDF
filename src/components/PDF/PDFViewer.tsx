import { memo } from "react";
import PDFRenderer from "./PDFRenderer";
import usePDFViewerController from "./hooks/usePDFViewerController.ts";
import type { PDFViewerControllerHook } from "./types";

const PDFViewer = ({ pdfDocumentURL, pdfViewerControllerHook }: { pdfDocumentURL: string; pdfViewerControllerHook?: PDFViewerControllerHook }) => {
	const defaultPdfViewerControllerHook = usePDFViewerController();
	const { pdfRendererElement, pdfViewerController, onPdfDocumentChange, onPdfPageChange } = pdfViewerControllerHook || defaultPdfViewerControllerHook;

	return (
		<div
			ref={pdfRendererElement}
			style={{
				cursor: pdfViewerController.isDragModeEnabled() ? "move" : "default",
				userSelect: pdfViewerController.isDragModeEnabled() ? "none" : "unset",
			}}
		>
			<PDFRenderer
				pdfDocumentURL={pdfDocumentURL}
				pdfPageIndex={pdfViewerController.getPageIndex()}
				pdfRenderOptions={pdfViewerController.getRenderOptions()}
				onPdfDocumentChange={onPdfDocumentChange}
				onPdfPageChange={onPdfPageChange}
			/>
		</div>
	);
};

export default memo(PDFViewer);
