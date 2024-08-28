import { useMemo, useCallback } from "react";

import { EditorSnapshot, PDFPainterController, PDFPainterInstanceController, PDFPainterInstanceControllerHook } from "../types";
import { Editor } from "tldraw";

const usePDFPainterInstanceController = ({
	editorId,
	pdfPainterController,
}: {
	editorId: string;
	pdfPainterController: PDFPainterController;
}): PDFPainterInstanceControllerHook => {
	const onEditorLoad = useCallback(
		(editor: Editor) => {
			pdfPainterController.registerEditor(editorId, editor);
		},
		[editorId, pdfPainterController],
	);

	const pdfPainterInstanceController: PDFPainterInstanceController = useMemo(() => {
		return {
			getEditor: () => pdfPainterController.getEditor(editorId),
			getEditorSnapshot: (pageIndex: number) => pdfPainterController.getEditorSnapshot(editorId, pageIndex),
			setEditorSnapshot: (pageIndex: number, snapshot: EditorSnapshot) => pdfPainterController.setEditorSnapshot(editorId, pageIndex, snapshot),
			clearEditorSnapshot: (pageIndex: number) => pdfPainterController.clearEditorSnapshot(editorId, pageIndex),
		};
	}, [editorId, pdfPainterController]);

	return {
		pdfPainterInstanceController: pdfPainterInstanceController,
		onEditorLoad: onEditorLoad,
	};
};

export default usePDFPainterInstanceController;
