import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Editor } from "tldraw";
import usePDFViewerController from "../../PDF/hooks/usePDFViewerController.ts";

import type { PaintMode, PDFPainterController, PDFPainterControllerHook } from "../types";

import CleanPainterSnapshot from "@assets/data/snapshot.json";

const usePDFPainterController = ({ painterId }: { painterId: string }): PDFPainterControllerHook => {
	const { pdfViewerController, onPdfDocumentChange, onPdfPageChange, onPdfItemClick, onPdfMouseMoveEvent, onPdfWheelEvent } = usePDFViewerController();

	const [paintMode, setPaintMode] = useState<PaintMode>("default");

	const editors = useRef<{ [editorId: number]: Editor }>({});

	const currentPageId = useRef<number | null>(null);

	useEffect(() => {
		pdfViewerController.setDragModeEnabled(paintMode === "move");
	}, [pdfViewerController, paintMode]);

	const getPaintId = useCallback(
		(editorId: number, pdfPageIndex: number) => {
			return `${painterId}_${editorId}_${pdfPageIndex}`;
		},
		[painterId],
	);

	const clearEditorPaint = useCallback((editor: Editor) => {
		console.log("Reset Painter");
		try {
			editor.loadSnapshot(CleanPainterSnapshot as any);
		} catch {
			console.log(`Failed to reset painter.`);
		}
	}, []);

	const loadEditorPagePaint = useCallback(
		(pageIndex: number, editorId: string, editor: Editor) => {
			const paintId = getPaintId(Number(editorId), pageIndex);
			console.log(`Load Paint: ${paintId}`);
			const snapShot = localStorage.getItem(paintId);
			if (snapShot === null) {
				console.log("Snapshot not found.");
				clearEditorPaint(editor);
			} else {
				try {
					editor.loadSnapshot(JSON.parse(snapShot));
				} catch {
					console.log(`Failed to load paint: ${paintId}`);
					clearEditorPaint(editor);
				}
			}
		},
		[clearEditorPaint, getPaintId],
	);

	const loadPagePaint = useCallback(
		(pageIndex: number) => {
			for (const [editorId, editor] of Object.entries(editors.current)) {
				loadEditorPagePaint(pageIndex, editorId, editor);
			}
		},
		[loadEditorPagePaint],
	);

	const saveEditorPagePaint = useCallback(
		(pageIndex: number, editorId: string, editor: Editor) => {
			const paintId = getPaintId(Number(editorId), pageIndex);
			console.log(`Save Paint: ${paintId}`);
			try {
				editor.selectNone();
				localStorage.setItem(paintId, JSON.stringify(editor.getSnapshot()));
			} catch {
				console.log(`Failed to save paint: ${paintId}`);
			}
		},
		[getPaintId],
	);

	const savePagePaint = useCallback(
		(pageIndex: number) => {
			for (const [editorId, editor] of Object.entries(editors.current)) {
				saveEditorPagePaint(pageIndex, editorId, editor);
			}
		},
		[saveEditorPagePaint],
	);

	const registerEditor = useCallback(
		(editorId: number, editor: Editor) => {
			editor.updateInstanceState({
				isDebugMode: false,
			});
			editor.setCameraOptions({
				isLocked: true,
			});
			if (editorId in editors.current) {
				editors.current[editorId] = editor;
			} else {
				editors.current[editorId] = editor;
				if (currentPageId.current !== null) {
					loadEditorPagePaint(currentPageId.current, String(editorId), editor);
				}
			}
		},
		[loadEditorPagePaint],
	);

	useEffect(() => {
		if (currentPageId.current !== pdfViewerController.getPageIndex()) {
			if (currentPageId.current !== null) {
				savePagePaint(currentPageId.current);
			}
			currentPageId.current = pdfViewerController.getPageIndex();
			loadPagePaint(currentPageId.current);
		}
	}, [pdfViewerController, loadPagePaint, savePagePaint]);

	useEffect(() => {
		console.log("Update Camera");
		const { width, height, baseX, baseY, scale } = pdfViewerController.getRenderOptions();
		const pdfRenderScaleX = width / (pdfViewerController.getPage()?.originalWidth || 0) || 1;
		const pdfRenderScaleY = height / (pdfViewerController.getPage()?.originalHeight || 0) || 1;
		const pdfRenderScale = (pdfRenderScaleX + pdfRenderScaleY) / 2;
		for (const editor of Object.values(editors.current)) {
			editor.setCamera(
				{
					x: -baseX / pdfRenderScale,
					y: -baseY / pdfRenderScale,
					z: scale * pdfRenderScale,
				},
				{
					force: true,
				},
			);
		}
	}, [pdfViewerController]);

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
		registerEditor: registerEditor,
		onPdfDocumentChange: onPdfDocumentChange,
		onPdfPageChange: onPdfPageChange,
		onPdfItemClick: onPdfItemClick,
		onPdfMouseMoveEvent: onPdfMouseMoveEvent,
		onPdfWheelEvent: onPdfWheelEvent,
	};
};

export default usePDFPainterController;
