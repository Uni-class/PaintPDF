import { useState, useRef, useCallback, memo, isValidElement, cloneElement, Children, MutableRefObject, ReactNode, ReactElement } from "react";
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
	onPaintModeChange = () => {},
	children,
}: {
	pdfDocumentURL: string;
	onPdfViewerLoad?: (pdfViewerController: MutableRefObject<PDFViewerController>) => void;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
	onPdfPageIndexChange?: (pdfPageIndex: number) => void;
	onPdfRenderOptionsChange?: (pdfRenderOptions: PDFRenderOptions) => void;
	onPdfDragModeChange?: (pdfDragModeEnabled: boolean) => void;
	onPaintModeChange?: (paintModeEnabled: boolean) => void;
	children?: ReactNode;
}) => {
	const [editorSize, setEditorSize] = useState<[number, number]>([0, 0]);
	const editors = useRef<{ [editorId: number]: Editor }>({});
	const currentPageIndex = useRef<number | null>(null);
	const [paintMode, setPaintModeState] = useState(true);

	const getPaintId = useCallback(
		(editorId: number, pdfPageIndex: number) => {
			return `${pdfDocumentURL}_${editorId}_${pdfPageIndex}`;
		},
		[pdfDocumentURL],
	);

	const loadPagePaint = useCallback(() => {
		if (currentPageIndex.current === null) {
			return;
		}
		for (const [editorId, editor] of Object.entries(editors.current)) {
			const paintId = getPaintId(Number(editorId), currentPageIndex.current);
			console.log(`Load Paint: ${paintId}`);
			try {
				editor.store.loadStoreSnapshot(JSON.parse(localStorage.getItem(paintId) || ""));
			} catch {
				console.log(`Failed to load paint: ${paintId}`);
				console.log("Removing previous paint.");
				try {
					editor.store.loadStoreSnapshot(CleanPainterSnapshot as any);
				} catch {
					console.log(`Failed to remove paint.`);
				}
			}
		}
	}, [getPaintId]);

	const savePagePaint = useCallback(() => {
		if (currentPageIndex.current === null) {
			return;
		}
		for (const [editorId, editor] of Object.entries(editors.current)) {
			const paintId = getPaintId(Number(editorId), currentPageIndex.current);
			console.log(`Save Paint: ${paintId}`);
			try {
				console.log(editor.store.getStoreSnapshot());
				localStorage.setItem(paintId, JSON.stringify(editor.store.getStoreSnapshot()));
			} catch {
				console.log(`Failed to save paint: ${paintId}`);
			}
		}
	}, [getPaintId]);

	const pdfViewerLoadHandler = useCallback(
		(pdfViewerController: MutableRefObject<PDFViewerController>) => {
			currentPageIndex.current = pdfViewerController.current.getPdfPageIndex();
			loadPagePaint();
			onPdfViewerLoad(pdfViewerController);
		},
		[loadPagePaint, onPdfViewerLoad],
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
			currentPageIndex.current = pdfPageIndex;
			loadPagePaint();
			onPdfPageIndexChange(pdfPageIndex);
		},
		[loadPagePaint, savePagePaint, onPdfPageIndexChange],
	);

	const pdfRenderOptionsChangeHandler = useCallback(
		(pdfRenderOptions: PDFRenderOptions) => {
			const { baseX, baseY, scale } = pdfRenderOptions;
			for (const editor of Object.values(editors.current)) {
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
			}
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

	const setPaintMode = useCallback(
		(paintModeEnabled: boolean) => {
			setPaintModeState(paintModeEnabled);
			onPaintModeChange(paintModeEnabled);
		},
		[onPaintModeChange],
	);

	const editorLoadHandler = useCallback(
		(editorId: number, editor: Editor) => {
			editor.updateInstanceState({
				isDebugMode: false,
				isReadonly: !paintMode,
			});
			editor.setCameraOptions({
				isLocked: true,
			});
			if (editorId in editors.current) {
				editors.current[editorId] = editor;
			} else {
				editors.current[editorId] = editor;
				loadPagePaint();
			}
		},
		[paintMode, loadPagePaint],
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
				{Children.toArray(children).map((element: ReactNode, index: number) => {
					if (isValidElement(element)) {
						return (
							<div
								key={index}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: editorSize[0],
									height: editorSize[1],
									pointerEvents: paintMode ? "unset" : "none",
								}}
							>
								{cloneElement(
									element as ReactElement<{
										paintEnabled?: boolean;
										onEditorLoad?: (editor: Editor) => void;
									}>,
									{
										paintEnabled: paintMode,
										onEditorLoad: (editor: Editor) => {
											editorLoadHandler(index, editor);
											element.props.onEditorLoad(editor);
										},
									},
								)}
							</div>
						);
					}
					return element;
				})}
			</div>
			<button onClick={() => setPaintMode(!paintMode)}>{paintMode ? "그리기 모드 해제" : "그리기 모드"}</button>
		</div>
	);
};

export default memo(PDFPainter);
