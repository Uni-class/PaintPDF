import { useState, useEffect, useRef, useCallback, memo, isValidElement, cloneElement, Children, ReactNode, ReactElement } from "react";
import { Editor } from "tldraw";
import PDFViewer from "./PDF/PDFViewer";
import CleanPainterSnapshot from "../assets/snapshot.json";
import type { PDFRenderSize, PaintMode } from "./PDF/types";
import usePDFViewerController from "./PDF/hooks/usePDFViewerController.ts";

const PDFPainter = ({ pdfDocumentURL, children }: { pdfDocumentURL: string; children?: ReactNode }) => {
	const painterElement = useRef<HTMLDivElement | null>(null);

	const pdfViewerControllerHook = usePDFViewerController();
	const { pdfViewerController } = pdfViewerControllerHook;

	const currentPageId = useRef<number | null>(null);
	const editors = useRef<{ [editorId: number]: Editor }>({});
	const [paintMode, setPaintMode] = useState<PaintMode>("default");

	const updateDisplaySize = useCallback(() => {
		const currentPdfPage = pdfViewerController.getPage();
		if (painterElement.current && currentPdfPage) {
			const elementWidth = painterElement.current.offsetWidth;
			const elementHeight = painterElement.current.offsetHeight;
			const pdfPageWidth = currentPdfPage.originalWidth;
			const pdfPageHeight = currentPdfPage.originalHeight;
			const elementRatio = elementWidth / elementHeight;
			const pdfPageRatio = pdfPageWidth / pdfPageHeight;
			let newDisplaySize: PDFRenderSize;
			if (pdfPageRatio > elementRatio) {
				newDisplaySize = {
					width: elementWidth,
					height: elementWidth / pdfPageRatio,
				};
			} else {
				newDisplaySize = {
					width: elementHeight * pdfPageRatio,
					height: elementHeight,
				};
			}
			const currentDisplaySize = pdfViewerController.getRenderSize();
			if (newDisplaySize.width !== currentDisplaySize.width || newDisplaySize.height !== currentDisplaySize.height) {
				pdfViewerController.setRenderSize(newDisplaySize);
			}
		}
	}, [pdfViewerController]);

	const getPaintId = useCallback(
		(editorId: number, pdfPageIndex: number) => {
			return `${pdfDocumentURL}_${editorId}_${pdfPageIndex}`;
		},
		[pdfDocumentURL],
	);

	const loadEditorPagePaint = useCallback(
		(pageIndex: number, editorId: string, editor: Editor) => {
			const paintId = getPaintId(Number(editorId), pageIndex);
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
		},
		[getPaintId],
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
				localStorage.setItem(paintId, JSON.stringify(editor.store.getStoreSnapshot()));
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
		const { baseX, baseY, scale } = pdfViewerController.getRenderOptions();
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
	}, [pdfViewerController]);

	const editorLoadHandler = useCallback(
		(editorId: number, editor: Editor) => {
			editor.updateInstanceState({
				isDebugMode: false,
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

	useEffect(() => {
		pdfViewerController.setDragModeEnabled(paintMode === "move");
	}, [pdfViewerController, paintMode]);

	return (
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				flexDirection: "column",
			}}
		>
			<div
				ref={painterElement}
				style={{
					flex: 1,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						position: "relative",
						width: "fit-content",
						height: "fit-content",
					}}
				>
					<PDFViewer pdfDocumentURL={pdfDocumentURL} pdfViewerControllerHook={pdfViewerControllerHook} />
					{Children.toArray(children).map((element: ReactNode, index: number) => {
						if (isValidElement(element)) {
							return (
								<div
									key={index}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: pdfViewerController.getRenderSize().width,
										height: pdfViewerController.getRenderSize().height,
										pointerEvents: paintMode === "draw" ? "unset" : "none",
									}}
								>
									{cloneElement(
										element as ReactElement<{
											paintEnabled?: boolean;
											onEditorLoad?: (editor: Editor) => void;
										}>,
										{
											paintEnabled: paintMode === "draw",
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
			<div
				style={{
					display: "flex",
					padding: "1em",
					color: "#ffffff",
					backgroundColor: "#aaaaaa",
					justifyContent: "center",
					alignItems: "center",
					gap: "1em",
				}}
			>
				<button disabled={paintMode === "default"} onClick={() => setPaintMode("default")}>
					<img src={"https://cdn.tldraw.com/2.4.4/icons/icon/tool-pointer.svg"} alt={"기본"} />
				</button>
				<button disabled={paintMode === "move"} onClick={() => setPaintMode("move")}>
					<img src={"https://cdn.tldraw.com/2.4.4/icons/icon/tool-hand.svg"} alt={"이동"} />
				</button>
				<button disabled={paintMode === "draw"} onClick={() => setPaintMode("draw")}>
					<img src={"https://cdn.tldraw.com/2.4.4/icons/icon/tool-pencil.svg"} alt={"그리기"} />
				</button>
				<button onClick={pdfViewerController.moveToPreviousPage}>{"<"}</button>
				<div>
					{pdfViewerController.getPageIndex() + 1}/{pdfViewerController.getPageCount()}
				</div>
				<div>{(pdfViewerController.getRenderOptions().scale * 100).toFixed()}%</div>
				<button onClick={pdfViewerController.moveToNextPage}>{">"}</button>
			</div>
		</div>
	);
};

export default memo(PDFPainter);
