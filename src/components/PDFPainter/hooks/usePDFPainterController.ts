import { useState, useMemo, useEffect } from "react";
import usePDFViewerController from "../../PDF/hooks/usePDFViewerController.ts";
import type { PaintMode, PDFPainterController, PDFPainterControllerHook } from "../types";

const usePDFPainterController = (): PDFPainterControllerHook => {
	const { pdfViewerController, onPdfDocumentChange, onPdfPageChange, onPdfItemClick, onPdfMouseMoveEvent, onPdfWheelEvent } = usePDFViewerController();

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
		pdfPainterController: pdfPainterController,
		onPdfDocumentChange: onPdfDocumentChange,
		onPdfPageChange: onPdfPageChange,
		onPdfItemClick: onPdfItemClick,
		onPdfMouseMoveEvent: onPdfMouseMoveEvent,
		onPdfWheelEvent: onPdfWheelEvent,
	};
};

export default usePDFPainterController;
