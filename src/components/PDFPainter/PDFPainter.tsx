import { useEffect, useRef, useCallback, memo, isValidElement, cloneElement, Children, ReactNode, ReactElement } from "react";
import { Editor } from "tldraw";
import PDFViewer from "../PDF/PDFViewer.tsx";
import CleanPainterSnapshot from "../../assets/snapshot.json";
import { PDFRenderSize } from "../PDF/types";
import usePDFPainterController from "./hooks/usePDFPainterController.ts";
import PDFPainterControlBar from "./PDFPainterControlBar.tsx";

const PDFPainter = ({ pdfDocumentURL, children }: { pdfDocumentURL: string; children?: ReactNode }) => {
	const painterElement = useRef<HTMLDivElement | null>(null);

	const pdfPainterControllerHook = usePDFPainterController();
	const { pdfPainterController } = pdfPainterControllerHook;

	const currentPageId = useRef<number | null>(null);
	const editors = useRef<{ [editorId: number]: Editor }>({});

	const updateDisplaySize = useCallback(() => {
		const currentPdfPage = pdfPainterController.getPage();
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
			const currentDisplaySize = pdfPainterController.getRenderSize();
			if (newDisplaySize.width !== currentDisplaySize.width || newDisplaySize.height !== currentDisplaySize.height) {
				pdfPainterController.setRenderSize(newDisplaySize);
			}
		}
	}, [pdfPainterController]);

	const getPaintId = useCallback(
		(editorId: number, pdfPageIndex: number) => {
			return `${pdfDocumentURL}_${editorId}_${pdfPageIndex}`;
		},
		[pdfDocumentURL],
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

	useEffect(() => {
		if (currentPageId.current !== pdfPainterController.getPageIndex()) {
			if (currentPageId.current !== null) {
				savePagePaint(currentPageId.current);
			}
			currentPageId.current = pdfPainterController.getPageIndex();
			loadPagePaint(currentPageId.current);
		}
	}, [pdfPainterController, loadPagePaint, savePagePaint]);

	useEffect(() => {
		console.log("Update Camera");
		const { width, height, baseX, baseY, scale } = pdfPainterController.getRenderOptions();
		const pdfRenderScaleX = width / (pdfPainterController.getPage()?.originalWidth || 0) || 1;
		const pdfRenderScaleY = height / (pdfPainterController.getPage()?.originalHeight || 0) || 1;
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
	}, [pdfPainterController]);

	const editorLoadHandler = useCallback(
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
					<PDFViewer
						pdfDocumentURL={pdfDocumentURL}
						pdfViewerControllerHook={{
							pdfRendererElement: pdfPainterControllerHook.pdfRendererElement,
							pdfViewerController: pdfPainterControllerHook.pdfPainterController,
							onPdfDocumentChange: pdfPainterControllerHook.onPdfDocumentChange,
							onPdfPageChange: pdfPainterControllerHook.onPdfPageChange,
							onPdfItemClick: pdfPainterControllerHook.onPdfItemClick,
						}}
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
										width: pdfPainterController.getRenderSize().width,
										height: pdfPainterController.getRenderSize().height,
										pointerEvents: pdfPainterController.getPaintMode() === "draw" ? "unset" : "none",
									}}
								>
									{cloneElement(
										element as ReactElement<{
											readOnly?: boolean;
											onEditorLoad?: (editor: Editor) => void;
										}>,
										{
											readOnly: element.props.readOnly || pdfPainterController.getPaintMode() !== "draw",
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
			<PDFPainterControlBar pdfPainterController={pdfPainterController} />
		</div>
	);
};

export default memo(PDFPainter);
