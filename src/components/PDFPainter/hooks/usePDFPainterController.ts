import { useState, useMemo, useEffect } from "react";
import usePDFViewerController from "../../PDF/hooks/usePDFViewerController.ts";
import type { PaintMode, PDFPainterController, PDFPainterControllerHook } from "../types";

const usePDFPainterController = (): PDFPainterControllerHook => {
	const { pdfRendererElement, pdfViewerController, onPdfDocumentChange, onPdfPageChange, onPdfItemClick } = usePDFViewerController();

	const [paintMode, setPaintMode] = useState<PaintMode>("default");

	useEffect(() => {
		pdfViewerController.setDragModeEnabled(paintMode === "move");
	}, [pdfViewerController, paintMode]);

	const pdfPainterController: PDFPainterController = useMemo(() => {
		return {
			...pdfViewerController,
			getPaintMode: () => {
				return paintMode;
			},
			setPaintMode: (paintMode: PaintMode) => {
				setPaintMode(paintMode);
			},
		};
	}, [pdfViewerController, paintMode]);

	return {
		pdfRendererElement: pdfRendererElement,
		pdfPainterController: pdfPainterController,
		onPdfDocumentChange: onPdfDocumentChange,
		onPdfPageChange: onPdfPageChange,
		onPdfItemClick: onPdfItemClick,
	};
};

export default usePDFPainterController;
