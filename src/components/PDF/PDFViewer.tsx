import { memo } from "react";
import PDFRenderer from "./PDFRenderer";
import usePDFViewerController from "./hooks/usePDFViewerController.ts";
import type { PDFViewerControllerHook } from "./types";

const PDFViewer = ({ pdfDocumentURL, pdfViewerControllerHook }: { pdfDocumentURL: string; pdfViewerControllerHook?: PDFViewerControllerHook }) => {
	const defaultPdfViewerControllerHook = usePDFViewerController();
	const { pdfViewerController, onPdfDocumentChange, onPdfPageChange, onPdfItemClick, onPdfMouseMoveEvent, onPdfWheelEvent } =
		pdfViewerControllerHook || defaultPdfViewerControllerHook;

	return (
		<div
			style={{
				cursor: pdfViewerController.isDragModeEnabled() ? "move" : "default",
			}}
			onMouseMove={onPdfMouseMoveEvent}
			onWheel={onPdfWheelEvent}
		>
			<PDFRenderer
				pdfDocumentURL={pdfDocumentURL}
				pdfPageIndex={pdfViewerController.getPageIndex()}
				pdfRenderOptions={pdfViewerController.getRenderOptions()}
				pdfInteractionEnabled={!pdfViewerController.isDragModeEnabled()}
				pdfItemClickEnabled={pdfViewerController.isItemClickEnabled()}
				onPdfDocumentChange={onPdfDocumentChange}
				onPdfPageChange={onPdfPageChange}
				onPdfItemClick={onPdfItemClick}
			/>
		</div>
	);
};

export default memo(PDFViewer);
