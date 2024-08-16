import { useState, useRef, useCallback, memo, MutableRefObject } from "react";
import Painter from "./Painter/Painter";
import { Editor } from "tldraw";
import type { PDFDocument, PDFPage } from "./PDF/BasePDFRenderer";
import type { PDFRenderOptions } from "./PDF/PDFRenderer";
import PDFViewer from "./PDF/PDFViewer";
import type { PDFViewerController } from "./PDF/PDFViewer";
import CleanPainterSnapshot from "../assets/snapshot.json";

const PDFPainter = ({
	pdfDocumentURL,
	onPdfViewerLoad = () => {},
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
	onPdfPageIndexChange = () => {},
	onPdfRenderOptionsChange = () => {},
	onPdfDragModeChange = () => {},
	onPainterLoad = () => {},
}: {
	pdfDocumentURL: string;
	onPdfViewerLoad?: (pdfViewerController: MutableRefObject<PDFViewerController>) => void;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
	onPdfPageIndexChange?: (pdfPageIndex: number) => void;
	onPdfRenderOptionsChange?: (pdfRenderOptions: PDFRenderOptions) => void;
	onPdfDragModeChange?: (pdfDragModeEnabled: boolean) => void;
	onPainterLoad?: (editor: MutableRefObject<Editor>) => void;
}) => {
	const [editorSize, setEditorSize] = useState<[number, number]>([0, 0]);
	const editor = useRef<Editor | null>(null);
	const currentPageId = useRef<string | null>(null);
	const [paintMode, setPaintMode] = useState(true);

	const getPageId = useCallback(
		(pdfPageIndex: number) => {
			return `${pdfDocumentURL}_${pdfPageIndex}`;
		},
		[pdfDocumentURL],
	);

	const loadPagePaint = useCallback(() => {
		if (editor.current === null || currentPageId.current === null) {
			return;
		}
		console.log(`Load Paint: ${currentPageId.current}`);
		try {
			editor.current.loadSnapshot(JSON.parse(localStorage.getItem(currentPageId.current) || ""));
		} catch {
			console.log(`Failed to load paint: ${currentPageId.current}`);
			console.log("Removing previous paint.");
			try {
				editor.current.loadSnapshot(CleanPainterSnapshot as any);
			} catch {
				console.log(`Failed to remove paint.`);
			}
		}
	}, []);

	const savePagePaint = useCallback(() => {
		if (editor.current === null || currentPageId.current === null) {
			return;
		}
		console.log(`Save Paint: ${currentPageId.current}`);
		try {
			localStorage.setItem(currentPageId.current, JSON.stringify(editor.current.getSnapshot()));
		} catch {
			console.log(`Failed to save paint: ${currentPageId.current}`);
		}
	}, []);

	const pdfViewerLoadHandler = useCallback(
		(pdfViewerController: MutableRefObject<PDFViewerController>) => {
			currentPageId.current = getPageId(pdfViewerController.current.getPdfPageIndex());
			loadPagePaint();
			onPdfViewerLoad(pdfViewerController);
		},
		[loadPagePaint, onPdfViewerLoad, getPageId],
	);

	const pdfDocumentChangeHandler = useCallback(
		(pdfDocument: PDFDocument | null) => {
			onPdfDocumentChange(pdfDocument);
		},
		[onPdfDocumentChange],
	);

	const pdfPageChangeHandler = useCallback(
		(pdfPage: PDFPage | null) => {
			setEditorSize([pdfPage?.originalWidth || 0, pdfPage?.originalHeight || 0]);
			onPdfPageChange(pdfPage);
		},
		[onPdfPageChange],
	);

	const pdfPageIndexChangeHandler = useCallback(
		(pdfPageIndex: number) => {
			savePagePaint();
			currentPageId.current = getPageId(pdfPageIndex);
			loadPagePaint();
			onPdfPageIndexChange(pdfPageIndex);
		},
		[loadPagePaint, savePagePaint, onPdfPageIndexChange, getPageId],
	);

	const pdfRenderOptionsChangeHandler = useCallback(
		(pdfRenderOptions: PDFRenderOptions) => {
			if (editor.current === null) {
				return;
			}
			const { baseX, baseY, scale } = pdfRenderOptions;
			editor.current.setCamera(
				{
					x: -baseX,
					y: -baseY,
					z: scale,
				},
				{
					force: true,
				},
			);
			onPdfRenderOptionsChange(pdfRenderOptions);
		},
		[onPdfRenderOptionsChange],
	);

	const pdfDragModeChangeHandler = useCallback(
		(pdfDragModeEnabled: boolean) => {
			onPdfDragModeChange(pdfDragModeEnabled);
		},
		[onPdfDragModeChange],
	);

	const editorLoadHandler = useCallback(
		(newEditor: Editor) => {
			if (editor.current === null) {
				editor.current = newEditor;
				loadPagePaint();
				onPainterLoad(editor as MutableRefObject<Editor>);
			} else {
				editor.current = newEditor;
			}
			editor.current.updateInstanceState({
				isDebugMode: false,
				isReadonly: !paintMode,
			});
			editor.current.setCameraOptions({
				isLocked: true,
			});
		},
		[paintMode, loadPagePaint, onPainterLoad],
	);

	return (
		<div>
			<div
				style={{
					position: "relative",
					width: "fit-content",
					height: "fit-content",
				}}
			>
				<PDFViewer
					onLoad={pdfViewerLoadHandler}
					pdfDocumentURL={pdfDocumentURL}
					onPdfDocumentChange={pdfDocumentChangeHandler}
					onPdfPageChange={pdfPageChangeHandler}
					onPdfPageIndexChange={pdfPageIndexChangeHandler}
					onPdfRenderOptionsChange={pdfRenderOptionsChangeHandler}
					onPdfDragModeChange={pdfDragModeChangeHandler}
				/>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "fit-content",
						height: "fit-content",
						pointerEvents: paintMode ? "unset" : "none",
					}}
				>
					<Painter width={editorSize[0]} height={editorSize[1]} readOnly={!paintMode} onEditorLoad={editorLoadHandler} />
				</div>
			</div>
			<button onClick={() => setPaintMode(!paintMode)}>{paintMode ? "그리기 모드 해제" : "그리기 모드"}</button>
		</div>
	);
};

export default memo(PDFPainter);
