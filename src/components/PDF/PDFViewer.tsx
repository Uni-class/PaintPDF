import { useState, useEffect, useCallback, useRef, memo, MutableRefObject } from "react";
import type { PDFDocument, PDFPage } from "./BasePDFRenderer";
import PDFRenderer from "./PDFRenderer";
import type { PDFRenderOptions } from "./PDFRenderer";

export type PDFViewerController = {
	getPdfDocument: () => PDFDocument | null;
	getPdfPage: () => PDFPage | null;
	getPdfPageIndex: () => number;
	setPdfPageIndex: (pdfPageIndex: number) => void;
	moveToPreviousPage: () => void;
	moveToNextPage: () => void;
	getPdfPageCount: () => number;
	getPdfRenderOptions: () => PDFRenderOptions;
	isDragModeEnabled: () => boolean;
	setDragModeEnabled: (enabled: boolean) => void;
};

const PDFViewer = ({
	pdfDocumentURL,
	onLoad = () => {},
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
	onPdfPageIndexChange = () => {},
	onPdfRenderOptionsChange = () => {},
	onDragModeChange = () => {},
}: {
	pdfDocumentURL: string;
	onLoad?: (pdfViewerController: MutableRefObject<PDFViewerController>) => void;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
	onPdfPageIndexChange?: (pdfPageIndex: number) => void;
	onPdfRenderOptionsChange?: (pdfRenderOptions: PDFRenderOptions) => void;
	onDragModeChange?: (dragModeEnabled: boolean) => void;
}) => {
	const pdfRendererElement = useRef<HTMLDivElement>(null);
	const [pdfDocument, setPdfDocumentState] = useState<PDFDocument | null>(null);
	const [pdfPage, setPdfPageState] = useState<PDFPage | null>(null);
	const [pdfPageIndex, setPdfPageIndexState] = useState<number>(0);
	const [pdfRenderOptions, setPdfRenderOptionsState] = useState<PDFRenderOptions>({
		width: 0,
		height: 0,
		baseX: 0,
		baseY: 0,
		scale: 1,
	});
	const [dragModeEnabled, setDragModeEnabledState] = useState(false);
	const dragBasePosition = useRef<[number, number] | null>(null);
	const pdfViewerController = useRef<PDFViewerController | null>(null);

	const setPdfDocument = useCallback(
		(pdfDocument: PDFDocument | null) => {
			setPdfDocumentState(pdfDocument);
			onPdfDocumentChange(pdfDocument);
		},
		[onPdfDocumentChange],
	);

	const setPdfPage = useCallback(
		(pdfPage: PDFPage | null) => {
			setPdfPageState(pdfPage);
			setPdfRenderOptionsState({
				...pdfRenderOptions,
				width: pdfPage?.originalWidth || 0,
				height: pdfPage?.originalHeight || 0,
			});
			onPdfPageChange(pdfPage);
		},
		[pdfRenderOptions, onPdfPageChange],
	);

	const setPdfPageIndex = useCallback(
		(pdfPageIndex: number) => {
			setPdfPageIndexState(pdfPageIndex);
			onPdfPageIndexChange(pdfPageIndex);
		},
		[onPdfPageIndexChange],
	);

	const setPdfRenderOptions = useCallback(
		({ baseX, baseY, scale }: { baseX: number; baseY: number; scale: number }) => {
			if (pdfPage === null) {
				return;
			}
			const newScale = Math.max(scale, 1);
			const newBaseX = Math.max(Math.min(pdfPage.originalWidth * (1 - 1 / newScale), baseX), 0);
			const newBaseY = Math.max(Math.min(pdfPage.originalHeight * (1 - 1 / newScale), baseY), 0);
			const pdfRenderOptions = {
				width: pdfPage.originalWidth,
				height: pdfPage.originalHeight,
				baseX: newBaseX,
				baseY: newBaseY,
				scale: Number(newScale.toFixed(2)),
			};
			setPdfRenderOptionsState(pdfRenderOptions);
			onPdfRenderOptionsChange(pdfRenderOptions);
		},
		[pdfPage, onPdfRenderOptionsChange],
	);

	const setDragModeEnabled = useCallback(
		(dragModeEnabled: boolean) => {
			setDragModeEnabledState(dragModeEnabled);
			onDragModeChange(dragModeEnabled);
		},
		[onDragModeChange],
	);

	const moveToPreviousPage = useCallback(() => {
		if (pdfDocument === null) {
			return;
		}
		setPdfPageIndex(Math.max(pdfPageIndex - 1, 0));
	}, [pdfDocument, pdfPageIndex, setPdfPageIndex]);

	const moveToNextPage = useCallback(() => {
		if (pdfDocument === null) {
			return;
		}
		setPdfPageIndex(Math.min(pdfPageIndex + 1, pdfDocument.numPages - 1));
	}, [pdfDocument, pdfPageIndex, setPdfPageIndex]);

	useEffect(() => {
		pdfViewerController.current = {
			getPdfDocument: () => {
				return pdfDocument;
			},
			getPdfPage: () => {
				return pdfPage;
			},
			getPdfPageIndex: () => {
				return pdfPageIndex;
			},
			setPdfPageIndex: (pdfPageIndex: number) => {
				setPdfPageIndex(pdfPageIndex);
			},
			moveToPreviousPage: () => {
				moveToPreviousPage();
			},
			moveToNextPage: () => {
				moveToNextPage();
			},
			getPdfPageCount: () => {
				return pdfDocument?.numPages || 0;
			},
			getPdfRenderOptions: () => {
				return pdfRenderOptions;
			},
			isDragModeEnabled: () => {
				return dragModeEnabled;
			},
			setDragModeEnabled: (enabled: boolean) => {
				setDragModeEnabled(enabled);
			},
		};
	}, [pdfDocument, pdfPage, pdfPageIndex, pdfRenderOptions, dragModeEnabled, setPdfPageIndex, moveToPreviousPage, moveToNextPage]);

	useEffect(() => {
		onLoad(pdfViewerController as MutableRefObject<PDFViewerController>);
	}, []);

	const keydownEventHandler = useCallback(
		(event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowLeft":
					moveToPreviousPage();
					break;
				case "ArrowRight":
					moveToNextPage();
					break;
				default:
					break;
			}
		},
		[moveToPreviousPage, moveToNextPage],
	);

	useEffect(() => {
		document.addEventListener("keydown", keydownEventHandler);
		return () => document.removeEventListener("keydown", keydownEventHandler);
	}, [keydownEventHandler]);

	const wheelEventHandler = useCallback(
		(event: WheelEvent) => {
			if (pdfPage === null) {
				return;
			}
			const { baseX, baseY, scale } = pdfRenderOptions;
			const targetRect = (event.target as HTMLDivElement).getBoundingClientRect();
			const currentTargetRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
			const offsetX = Math.round(event.offsetX + targetRect.left - currentTargetRect.left);
			const offsetY = Math.round(event.offsetY + targetRect.top - currentTargetRect.top);
			const wheelDelta = event.deltaX + event.deltaY + event.deltaZ > 0 ? -1 : 1;
			const scaleRatio = 0.2;
			const newScale = Math.max(Number((scale * (1 + scaleRatio * wheelDelta)).toFixed(2)), 1);
			const pdfDocumentOffsetX = Math.max(Math.min(Math.round(baseX + offsetX / scale), Math.floor(pdfPage.originalWidth)), 0);
			const pdfDocumentOffsetY = Math.max(Math.min(Math.round(baseY + offsetY / scale), Math.floor(pdfPage.originalHeight)), 0);
			const scaledBaseX = pdfDocumentOffsetX - offsetX / newScale;
			const scaledBaseY = pdfDocumentOffsetY - offsetY / newScale;
			setPdfRenderOptions({
				baseX: scaledBaseX,
				baseY: scaledBaseY,
				scale: newScale,
			});
		},
		[pdfRenderOptions, pdfPage, setPdfRenderOptions],
	);

	useEffect(() => {
		if (pdfRendererElement.current) {
			const element = pdfRendererElement.current;
			element.addEventListener("wheel", wheelEventHandler);
			return () => element.removeEventListener("wheel", wheelEventHandler);
		}
	}, [wheelEventHandler]);

	const mouseEventHandler = useCallback(
		(event: MouseEvent) => {
			if (!dragModeEnabled) {
				return;
			}
			if (event.buttons === 1) {
				if (dragBasePosition.current !== null) {
					const { baseX, baseY, scale } = pdfRenderOptions;
					setPdfRenderOptions({
						baseX: baseX + (dragBasePosition.current[0] - event.pageX) / scale,
						baseY: baseY + (dragBasePosition.current[1] - event.pageY) / scale,
						scale: scale,
					});
				}
				dragBasePosition.current = [event.pageX, event.pageY];
			} else {
				dragBasePosition.current = null;
			}
		},
		[dragModeEnabled, pdfRenderOptions, setPdfRenderOptions],
	);

	useEffect(() => {
		if (pdfRendererElement.current) {
			const element = pdfRendererElement.current;
			element.addEventListener("mousemove", mouseEventHandler);
			return () => element.removeEventListener("mousemove", mouseEventHandler);
		}
	}, [mouseEventHandler]);

	return (
		<div
			style={{
				width: "fit-content",
				height: "fit-content",
			}}
		>
			<div
				ref={pdfRendererElement}
				style={{
					width: "fit-content",
					height: "fit-content",
					cursor: dragModeEnabled ? "move" : "default",
					userSelect: dragModeEnabled ? "none" : "unset",
				}}
			>
				<PDFRenderer
					pdfDocumentURL={pdfDocumentURL}
					pdfPageIndex={pdfPageIndex}
					pdfRenderOptions={pdfRenderOptions}
					onPdfDocumentChange={setPdfDocument}
					onPdfPageChange={setPdfPage}
				/>
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
				<button onClick={() => setDragModeEnabled(!dragModeEnabled)}>{dragModeEnabled ? "드래그 취소" : "드래그"}</button>
				<button onClick={moveToPreviousPage}>{"<"}</button>
				<div>
					{pdfPageIndex + 1}/{pdfDocument?.numPages}
				</div>
				<div>{(pdfRenderOptions.scale * 100).toFixed()}%</div>
				<button onClick={moveToNextPage}>{">"}</button>
			</div>
		</div>
	);
};

export default memo(PDFViewer);
