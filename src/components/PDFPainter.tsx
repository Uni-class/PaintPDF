import { useState, useEffect, useRef, useCallback, memo, isValidElement, cloneElement, Children, MutableRefObject, ReactNode, ReactElement } from "react";
import { Editor } from "tldraw";
import PDFViewer from "./PDF/PDFViewer";
import CleanPainterSnapshot from "../assets/snapshot.json";
import type { PDFDocument, PDFPage, PDFRenderOptions, PDFViewerController } from "./PDF/types";

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
	const painterElement = useRef<HTMLDivElement | null>(null);
	const [displaySize, setDisplaySize] = useState<[number, number]>([0, 0]);
	const currentPdfPage = useRef<PDFPage | null>(null);
	const editors = useRef<{ [editorId: number]: Editor }>({});
	const currentPageIndex = useRef<number | null>(null);
	const [paintMode, setPaintModeState] = useState(true);

	const updateDisplaySize = useCallback(() => {
		if (painterElement.current && currentPdfPage.current) {
			const elementWidth = painterElement.current.offsetWidth;
			const elementHeight = painterElement.current.offsetHeight;
			const pdfPageWidth = currentPdfPage.current.originalWidth;
			const pdfPageHeight = currentPdfPage.current.originalHeight;
			const elementRatio = elementWidth / elementHeight;
			const pdfPageRatio = pdfPageWidth / pdfPageHeight;
			let newDisplaySize: [number, number];
			if (pdfPageRatio > elementRatio) {
				newDisplaySize = [elementWidth, elementWidth / pdfPageRatio];
			} else {
				newDisplaySize = [elementHeight * pdfPageRatio, elementHeight];
			}
			if (newDisplaySize[0] !== displaySize[0] || newDisplaySize[1] !== displaySize[1]) {
				setDisplaySize(newDisplaySize);
			}
		}
	}, [displaySize]);

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
			currentPdfPage.current = pdfPage;
			updateDisplaySize();
			onPdfPageChange(pdfPage);
		},
		[onPdfPageChange, updateDisplaySize],
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

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			updateDisplaySize();
		});

		if (painterElement.current) {
			resizeObserver.observe(painterElement.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [updateDisplaySize]);

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			<div
				ref={painterElement}
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					justifyContent: "center",
					alignItems: "center",
					//overflow: "hidden",
				}}
			>
				<div
					style={{
						position: "relative",
						width: "fit-content",
						height: "fit-content",
					}}
				>
					<PDFViewer
						width={displaySize[0]}
						height={displaySize[1]}
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
										width: displaySize[0],
										height: displaySize[1],
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
			</div>
			<button
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
				}}
				onClick={() => setPaintMode(!paintMode)}
			>
				{paintMode ? "그리기 모드 해제" : "그리기 모드"}
			</button>
		</div>
	);
};

export default memo(PDFPainter);
