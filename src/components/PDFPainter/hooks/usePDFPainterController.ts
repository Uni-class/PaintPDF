import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Editor } from "tldraw";
import usePDFViewerController from "../../PDF/hooks/usePDFViewerController.ts";

import { PaintMode, EditorSnapshot, PDFPainterController, PDFPainterControllerHook } from "../types";

import CleanPainterSnapshot from "@assets/data/snapshot.json";

const usePDFPainterController = ({ painterId }: { painterId: string }): PDFPainterControllerHook => {
	const { pdfViewerController, onPdfDocumentChange, onPdfPageChange, onPdfItemClick, onPdfMouseMoveEvent, onPdfWheelEvent } = usePDFViewerController();

	const [paintMode, setPaintMode] = useState<PaintMode>("default");

	const editors = useRef<{ [editorId: string]: Editor }>({});

	const currentPageId = useRef<number | null>(null);

	useEffect(() => {
		pdfViewerController.setDragModeEnabled(paintMode === "move");
	}, [pdfViewerController, paintMode]);

	const getEditor = useCallback((editorId: string): Editor | null => {
		if (editorId in editors.current) {
			return editors.current[editorId];
		}
		return null;
	}, []);

	const getSnapshotId = useCallback(
		(editorId: string, pdfPageIndex: number) => {
			return `${painterId}_${editorId}_${pdfPageIndex}`;
		},
		[painterId],
	);

	const getEditorSnapshot = useCallback(
		(editorId: string, pageIndex: number): EditorSnapshot | null => {
			const snapshotId = getSnapshotId(editorId, pageIndex);
			console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Get Editor Snapshot: ${snapshotId}`);
			const data = localStorage.getItem(snapshotId);
			if (data !== null) {
				try {
					return JSON.parse(data);
				} catch (e) {
					console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Invalid Snapshot: ${snapshotId}`);
					console.log(e);
				}
			}
			return null;
		},
		[getSnapshotId],
	);

	const setEditorSnapshot = useCallback(
		(editorId: string, pageIndex: number, snapshot: EditorSnapshot) => {
			const snapshotId = getSnapshotId(editorId, pageIndex);
			console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Set Editor Snapshot: ${snapshotId}`);
			localStorage.setItem(snapshotId, JSON.stringify(snapshot));
		},
		[getSnapshotId],
	);

	const clearEditorSnapshot = useCallback(
		(editorId: string, pageIndex: number) => {
			const snapshotId = getSnapshotId(editorId, pageIndex);
			console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Clear Editor Snapshot: ${snapshotId}`);
			localStorage.removeItem(snapshotId);
		},
		[getSnapshotId],
	);

	const loadEmptySnapshot = useCallback(
		(editorId: string) => {
			const editor = getEditor(editorId);
			if (editor === null) {
				return;
			}
			console.log(`[Editor: ${editorId}] Load empty snapshot.`);
			try {
				editor.loadSnapshot(CleanPainterSnapshot as unknown as EditorSnapshot);
			} catch {
				console.log(`[Editor: ${editorId}] Unable to load empty snapshot.`);
			}
		},
		[getEditor],
	);

	const loadEditorSnapshot = useCallback(
		(editorId: string, pageIndex: number) => {
			const editor = getEditor(editorId);
			if (editor === null) {
				return;
			}
			const snapshotId = getSnapshotId(editorId, pageIndex);
			console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Load snapshot: ${snapshotId}`);
			const snapShot = getEditorSnapshot(editorId, pageIndex);
			if (snapShot === null) {
				console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Snapshot not found: ${snapshotId}`);
				loadEmptySnapshot(editorId);
			} else {
				try {
					editor.loadSnapshot(snapShot);
				} catch {
					console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Unable to load snapshot: ${snapshotId}`);
					loadEmptySnapshot(editorId);
				}
			}
		},
		[getEditor, getSnapshotId, getEditorSnapshot, loadEmptySnapshot],
	);

	const loadPageSnapshots = useCallback(
		(pageIndex: number) => {
			for (const editorId of Object.keys(editors.current)) {
				loadEditorSnapshot(editorId, pageIndex);
			}
		},
		[loadEditorSnapshot],
	);

	const saveEditorSnapshot = useCallback(
		(editorId: string, pageIndex: number) => {
			const editor = getEditor(editorId);
			if (editor === null) {
				return;
			}
			const snapshotId = getSnapshotId(editorId, pageIndex);
			console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Save snapshot: ${snapshotId}`);
			try {
				editor.selectNone();
				setEditorSnapshot(editorId, pageIndex, editor.getSnapshot());
			} catch {
				console.log(`[Editor: ${editorId} - Page: ${pageIndex}] Unable to save snapshot: ${snapshotId}`);
			}
		},
		[getEditor, getSnapshotId, setEditorSnapshot],
	);

	const savePageSnapshots = useCallback(
		(pageIndex: number) => {
			for (const editorId of Object.keys(editors.current)) {
				saveEditorSnapshot(editorId, pageIndex);
			}
		},
		[saveEditorSnapshot],
	);

	const registerEditor = useCallback(
		(editorId: string, editor: Editor) => {
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
					loadEditorSnapshot(editorId, currentPageId.current);
				}
			}
		},
		[loadEditorSnapshot],
	);

	const unregisterEditor = useCallback((editorId: string) => {
		if (editorId in editors.current) {
			delete editors.current[editorId];
		}
	}, []);

	useEffect(() => {
		if (currentPageId.current !== pdfViewerController.getPageIndex()) {
			if (currentPageId.current !== null) {
				savePageSnapshots(currentPageId.current);
			}
			currentPageId.current = pdfViewerController.getPageIndex();
			loadPageSnapshots(currentPageId.current);
		}
	}, [pdfViewerController, loadPageSnapshots, savePageSnapshots]);

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
		unregisterEditor: unregisterEditor,
		getEditor: getEditor,
		getEditorSnapshot: getEditorSnapshot,
		setEditorSnapshot: setEditorSnapshot,
		clearEditorSnapshot: clearEditorSnapshot,
		loadEditorSnapshot: loadEditorSnapshot,
		saveEditorSnapshot: saveEditorSnapshot,
		loadPageSnapshots: loadPageSnapshots,
		savePageSnapshots: savePageSnapshots,
		onPdfDocumentChange: onPdfDocumentChange,
		onPdfPageChange: onPdfPageChange,
		onPdfItemClick: onPdfItemClick,
		onPdfMouseMoveEvent: onPdfMouseMoveEvent,
		onPdfWheelEvent: onPdfWheelEvent,
	};
};

export default usePDFPainterController;
