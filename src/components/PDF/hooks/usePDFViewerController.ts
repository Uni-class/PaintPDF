import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PDFDocument, PDFPage, PDFRenderOptions, PDFRenderSize, PDFViewerControllerHook } from "../types";

const usePDFViewerController = (): PDFViewerControllerHook => {
	const pdfRendererElement = useRef<HTMLDivElement | null>(null);
	const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
	const [pdfPage, setPdfPage] = useState<PDFPage | null>(null);
	const [pageIndex, setPageIndex] = useState<number>(0);
	const [renderOptions, setRawRenderOptions] = useState<PDFRenderOptions>({
		width: 0,
		height: 0,
		baseX: 0,
		baseY: 0,
		scale: 1,
	});
	const [dragModeEnabled, setDragModeEnabled] = useState(false);

	const setRenderOptions = useCallback(
		({ width, height, baseX, baseY, scale }: PDFRenderOptions) => {
			if (pdfPage === null) {
				return;
			}
			const newScale = Math.max(scale, 1);
			const newBaseX = Math.max(Math.min(pdfPage.originalWidth * (1 - 1 / newScale), baseX), 0);
			const newBaseY = Math.max(Math.min(pdfPage.originalHeight * (1 - 1 / newScale), baseY), 0);
			const newRenderOptions = {
				width: width,
				height: height,
				baseX: newBaseX,
				baseY: newBaseY,
				scale: newScale,
			};
			setRawRenderOptions((renderOptions) => {
				if (
					renderOptions.width !== newRenderOptions.width ||
					renderOptions.height !== newRenderOptions.height ||
					renderOptions.baseX !== newRenderOptions.baseX ||
					renderOptions.baseY !== newRenderOptions.baseY ||
					renderOptions.scale !== newRenderOptions.scale
				) {
					return newRenderOptions;
				} else {
					console.log("ignore render update");
					return renderOptions;
				}
			});
		},
		[pdfPage],
	);

	const pdfViewerController = useMemo(() => {
		return {
			getDocument: () => {
				return pdfDocument;
			},
			getPage: () => {
				return pdfPage;
			},
			getPageIndex: () => {
				return pageIndex;
			},
			setPageIndex: (pageIndex: number) => {
				setPageIndex(pageIndex);
			},
			moveToPreviousPage: () => {
				if (pdfDocument === null) {
					return;
				}
				setPageIndex(Math.max(pageIndex - 1, 0));
			},
			moveToNextPage: () => {
				if (pdfDocument === null) {
					return;
				}
				setPageIndex(Math.min(pageIndex + 1, pdfDocument.numPages - 1));
			},
			getPageCount: () => {
				return pdfDocument?.numPages || 0;
			},
			getRenderOptions: () => {
				return renderOptions;
			},
			setRenderOptions: ({ width, height, baseX, baseY, scale }: PDFRenderOptions) => {
				setRenderOptions({ width, height, baseX, baseY, scale });
			},
			getRenderSize: () => {
				return {
					width: renderOptions.width,
					height: renderOptions.height,
				};
			},
			setRenderSize: ({ width, height }: PDFRenderSize) => {
				setRenderOptions({
					width: width,
					height: height,
					baseX: renderOptions.baseX,
					baseY: renderOptions.baseY,
					scale: renderOptions.scale,
				});
			},
			zoom: ({ offsetX, offsetY, scaleDelta }: { offsetX: number; offsetY: number; scaleDelta: number }) => {
				if (pdfPage === null) {
					return;
				}
				const { baseX, baseY, scale } = renderOptions;
				const newScale = Math.max(Number((scale * (1 + scaleDelta)).toFixed(2)), 1);
				const pdfDocumentOffsetX = Math.max(Math.min(Math.round(baseX + offsetX / scale), Math.floor(pdfPage.originalWidth)), 0);
				const pdfDocumentOffsetY = Math.max(Math.min(Math.round(baseY + offsetY / scale), Math.floor(pdfPage.originalHeight)), 0);
				const scaledBaseX = pdfDocumentOffsetX - offsetX / newScale;
				const scaledBaseY = pdfDocumentOffsetY - offsetY / newScale;
				setRenderOptions({
					width: renderOptions.width,
					height: renderOptions.height,
					baseX: scaledBaseX,
					baseY: scaledBaseY,
					scale: newScale,
				});
			},
			isDragModeEnabled: () => {
				return dragModeEnabled;
			},
			setDragModeEnabled: (enabled: boolean) => {
				setDragModeEnabled(enabled);
			},
			drag: ({ deltaX, deltaY }: { deltaX: number; deltaY: number }) => {
				setRenderOptions({
					width: renderOptions.width,
					height: renderOptions.height,
					baseX: renderOptions.baseX + deltaX / renderOptions.scale,
					baseY: renderOptions.baseY + deltaY / renderOptions.scale,
					scale: renderOptions.scale,
				});
			},
		};
	}, [setRenderOptions, pdfDocument, pdfPage, pageIndex, renderOptions, dragModeEnabled]);

	const keydownEventHandler = useCallback(
		(event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowLeft":
					pdfViewerController.moveToPreviousPage();
					break;
				case "ArrowRight":
					pdfViewerController.moveToNextPage();
					break;
				default:
					break;
			}
		},
		[pdfViewerController],
	);

	useEffect(() => {
		document.addEventListener("keydown", keydownEventHandler);
		return () => document.removeEventListener("keydown", keydownEventHandler);
	}, [keydownEventHandler]);

	const wheelEventHandler = useCallback(
		(event: WheelEvent) => {
			event.preventDefault();
			const targetRect = (event.target as HTMLDivElement).getBoundingClientRect();
			const currentTargetRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
			const offsetX = Math.round(event.offsetX + targetRect.left - currentTargetRect.left);
			const offsetY = Math.round(event.offsetY + targetRect.top - currentTargetRect.top);
			const wheelDelta = event.deltaX + event.deltaY + event.deltaZ > 0 ? -1 : 1;
			const scaleRatio = 0.2;
			pdfViewerController.zoom({
				offsetX: offsetX,
				offsetY: offsetY,
				scaleDelta: wheelDelta * scaleRatio,
			});
		},
		[pdfViewerController],
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
			event.preventDefault();
			if (event.buttons === 1) {
				console.log(event.movementX, event.movementY);
				pdfViewerController.drag({
					deltaX: -event.movementX,
					deltaY: -event.movementY,
				});
			}
		},
		[dragModeEnabled, pdfViewerController],
	);

	useEffect(() => {
		if (pdfRendererElement.current) {
			const element = pdfRendererElement.current;
			element.addEventListener("mousemove", mouseEventHandler);
			return () => element.removeEventListener("mousemove", mouseEventHandler);
		}
	}, [mouseEventHandler]);

	return {
		pdfRendererElement: pdfRendererElement,
		pdfViewerController: pdfViewerController,
		onPdfDocumentChange: setPdfDocument,
		onPdfPageChange: setPdfPage,
	};
};

export default usePDFViewerController;
