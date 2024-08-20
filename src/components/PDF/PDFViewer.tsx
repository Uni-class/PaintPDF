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
	isPdfDragModeEnabled: () => boolean;
	setPdfDragModeEnabled: (pdfDragModeEnabled: boolean) => void;
};

const PDFViewer = ({
	pdfDocumentURL,
	width = 0,
	height = 0,
	onLoad = () => {},
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
	onPdfPageIndexChange = () => {},
	onPdfRenderOptionsChange = () => {},
	onPdfDragModeChange = () => {},
}: {
	pdfDocumentURL: string;
	width?: number;
	height?: number;
	onLoad?: (pdfViewerController: MutableRefObject<PDFViewerController>) => void;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
	onPdfPageIndexChange?: (pdfPageIndex: number) => void;
	onPdfRenderOptionsChange?: (pdfRenderOptions: PDFRenderOptions) => void;
	onPdfDragModeChange?: (pdfDragModeEnabled: boolean) => void;
}) => {
	const pdfRendererElement = useRef<HTMLDivElement | null>(null);
	const [pdfDocument, setPdfDocumentState] = useState<PDFDocument | null>(null);
	const [pdfPage, setPdfPageState] = useState<PDFPage | null>(null);
	const [pdfPageIndex, setPdfPageIndexState] = useState<number>(0);
	const [pdfRenderOptions, setPdfRenderOptionsState] = useState<PDFRenderOptions>({
		width: width,
		height: height,
		baseX: 0,
		baseY: 0,
		scale: 1,
	});
	const [pdfDragModeEnabled, setPdfDragModeEnabledState] = useState(false);
	const pdfDragBasePosition = useRef<[number, number] | null>(null);
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
			onPdfPageChange(pdfPage);
		},
		[onPdfPageChange],
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
			const newPdfRenderOptions = {
				width: width,
				height: height,
				baseX: newBaseX,
				baseY: newBaseY,
				scale: Number(newScale.toFixed(2)),
			};
			setPdfRenderOptionsState(newPdfRenderOptions);
			onPdfRenderOptionsChange(newPdfRenderOptions);
		},
		[pdfPage, width, height, onPdfRenderOptionsChange],
	);

	useEffect(() => {
		setPdfRenderOptionsState((pdfRenderOptions) => {
			const newPdfRenderOptions = {
				...pdfRenderOptions,
				width: width,
				height: height,
			};
			onPdfRenderOptionsChange(newPdfRenderOptions);
			return newPdfRenderOptions;
		});
	}, [width, height, setPdfRenderOptionsState, onPdfRenderOptionsChange]);

	const setPdfDragModeEnabled = useCallback(
		(pdfDragModeEnabled: boolean) => {
			setPdfDragModeEnabledState(pdfDragModeEnabled);
			onPdfDragModeChange(pdfDragModeEnabled);
		},
		[onPdfDragModeChange],
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
			isPdfDragModeEnabled: () => {
				return pdfDragModeEnabled;
			},
			setPdfDragModeEnabled: (enabled: boolean) => {
				setPdfDragModeEnabled(enabled);
			},
		};
	}, [pdfDocument, pdfPage, pdfPageIndex, pdfRenderOptions, pdfDragModeEnabled, setPdfPageIndex, moveToPreviousPage, moveToNextPage, setPdfDragModeEnabled]);

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
			event.preventDefault();
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
			if (!pdfDragModeEnabled) {
				return;
			}
			if (event.buttons === 1) {
				if (pdfDragBasePosition.current !== null) {
					const { baseX, baseY, scale } = pdfRenderOptions;
					setPdfRenderOptions({
						baseX: baseX + (pdfDragBasePosition.current[0] - event.pageX) / scale,
						baseY: baseY + (pdfDragBasePosition.current[1] - event.pageY) / scale,
						scale: scale,
					});
				}
				pdfDragBasePosition.current = [event.pageX, event.pageY];
			} else {
				pdfDragBasePosition.current = null;
			}
		},
		[pdfDragModeEnabled, pdfRenderOptions, setPdfRenderOptions],
	);

	useEffect(() => {
		if (pdfRendererElement.current) {
			const element = pdfRendererElement.current;
			element.addEventListener("mousemove", mouseEventHandler);
			return () => element.removeEventListener("mousemove", mouseEventHandler);
		}
	}, [mouseEventHandler]);

	return (
		<div>
			<div
				ref={pdfRendererElement}
				style={{
					cursor: pdfDragModeEnabled ? "move" : "default",
					userSelect: pdfDragModeEnabled ? "none" : "unset",
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
				<button onClick={() => setPdfDragModeEnabled(!pdfDragModeEnabled)}>{pdfDragModeEnabled ? "드래그 취소" : "드래그"}</button>
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
