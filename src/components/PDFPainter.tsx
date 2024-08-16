import { useState, useRef, useCallback, memo, MutableRefObject, useEffect } from "react";
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
	onDragModeChange = () => {},
}: {
	pdfDocumentURL: string;
	onPdfViewerLoad?: (pdfViewerController: MutableRefObject<PDFViewerController>) => void;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
	onPdfPageIndexChange?: (pdfPageIndex: number) => void;
	onPdfRenderOptionsChange?: (pdfRenderOptions: PDFRenderOptions) => void;
	onDragModeChange?: (dragModeEnabled: boolean) => void;
}) => {
	const [editorSize, setEditorSize] = useState<[number, number]>([0, 0]);
	const [editor, setEditor] = useState<Editor | null>(null);
	const currentPageId = useRef<string | null>(null);
	const [paintMode, setPaintMode] = useState(true);

	const getPageId = useCallback(
		(pdfPageIndex: number) => {
			return `${pdfDocumentURL}_${pdfPageIndex}`;
		},
		[pdfDocumentURL],
	);

	const loadPagePaint = useCallback(() => {
		if (editor === null || currentPageId.current === null) {
			return;
		}
		console.log(`Load Paint: ${currentPageId.current}`);
		try {
			editor.loadSnapshot(JSON.parse(localStorage.getItem(currentPageId.current) || ""));
		} catch {
			console.log(`Failed to load paint: ${currentPageId.current}`);
			console.log("Removing previous paint.");
			try {
				editor.loadSnapshot(CleanPainterSnapshot as any);
			} catch {
				console.log(`Failed to remove paint.`);
			}
		}
	}, [editor]);

	const savePagePaint = useCallback(() => {
		if (editor === null || currentPageId.current === null) {
			return;
		}
		console.log(`Save Paint: ${currentPageId.current}`);
		try {
			localStorage.setItem(currentPageId.current, JSON.stringify(editor.getSnapshot()));
		} catch {
			console.log(`Failed to save paint: ${currentPageId.current}`);
		}
	}, [editor]);

	useEffect(() => {
		loadPagePaint();
	}, [loadPagePaint]);

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
			if (editor === null) {
				return;
			}
			const { baseX, baseY, scale } = pdfRenderOptions;
			editor.setCamera(
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
		[editor, onPdfRenderOptionsChange],
	);

	const pdfDragModeChangeHandler = useCallback(
		(dragModeEnabled: boolean) => {
			onDragModeChange(dragModeEnabled);
		},
		[onDragModeChange],
	);

	const editorLoadHandler = useCallback(
		(editor: Editor) => {
			setEditor(editor);
			editor.updateInstanceState({
				isDebugMode: false,
				isReadonly: !paintMode,
			});
			editor.setCameraOptions({
				isLocked: true,
			});
			console.log(editor);
		},
		[paintMode],
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
					onDragModeChange={pdfDragModeChangeHandler}
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
