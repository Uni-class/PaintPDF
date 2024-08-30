import { memo } from "react";
import Painter from "@components/Painter/Painter.tsx";
import { Editor } from "tldraw";
import { PDFPainterControllerHook, PDFPainterInstanceControllerHook } from "@components/PDFPainter/types";
import usePDFPainterInstanceController from "@components/PDFPainter/hooks/usePDFPainterInstanceController.ts";

const PainterInstance = ({
	instanceId,
	readOnly = false,
	enableKeyboardShortcuts = false,
	pdfPainterControllerHook,
	customPdfPainterInstanceControllerHook,
}: {
	instanceId: string;
	readOnly?: boolean;
	enableKeyboardShortcuts?: boolean;
	pdfPainterControllerHook: PDFPainterControllerHook;
	customPdfPainterInstanceControllerHook?: PDFPainterInstanceControllerHook;
}) => {
	const { pdfPainterController } = pdfPainterControllerHook;
	const defaultPdfPainterInstanceControllerHook = usePDFPainterInstanceController({
		editorId: instanceId,
		pdfPainterController: pdfPainterController,
	});
	const pdfPainterInstanceControllerHook = customPdfPainterInstanceControllerHook || defaultPdfPainterInstanceControllerHook;

	return (
		<Painter
			readOnly={readOnly}
			enableKeyboardShortcuts={enableKeyboardShortcuts}
			onEditorLoad={(editor: Editor) => {
				pdfPainterInstanceControllerHook.onEditorLoad(editor);
			}}
		/>
	);
};

export default memo(PainterInstance);
