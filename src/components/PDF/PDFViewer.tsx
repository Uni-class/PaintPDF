import { useState, useEffect, useCallback, useRef, memo } from "react";
import type { PDFDocument, PDFPage } from "./BasePDFRenderer";
import PDFRenderer from "./PDFRenderer";
import type { PdfRenderOptions } from "./PDFRenderer";

const PDFViewer = ({
	pdfDocumentURL,
	onPdfDocumentChange = () => {},
	onPdfPageChange = () => {},
	onPdfPageIndexChange = () => {},
	onPdfRenderOptionsChange = () => {},
}: {
	pdfDocumentURL: string;
	onPdfDocumentChange?: (pdfDocument: PDFDocument | null) => void;
	onPdfPageChange?: (pdfPage: PDFPage | null) => void;
	onPdfPageIndexChange?: (index: number) => void;
	onPdfRenderOptionsChange?: (pdfRenderOptions: PdfRenderOptions) => void;
}) => {
	const pdfRendererElement = useRef<HTMLDivElement>(null);
	const [pdfDocument, setPdfDocument] = useState<PDFDocument | null>(null);
	const [pdfPage, setPdfPage] = useState<PDFPage | null>(null);
	const [pdfPageIndex, setPdfPageIndex] = useState(0);
	const [pdfRenderOptions, setPdfRenderOptions] = useState<PdfRenderOptions>({
		baseX: 0,
		baseY: 0,
		scale: 1,
	});
	const [dragModeEnabled, setDragModeEnabled] = useState(false);

	useEffect(() => {
		onPdfDocumentChange(pdfDocument);
	}, [onPdfDocumentChange, pdfDocument]);

	useEffect(() => {
		onPdfPageChange(pdfPage);
	}, [onPdfPageChange, pdfPage]);

	useEffect(() => {
		onPdfPageIndexChange(pdfPageIndex);
	}, [onPdfPageIndexChange, pdfPageIndex]);

	useEffect(() => {
		onPdfRenderOptionsChange(pdfRenderOptions);
	}, [onPdfRenderOptionsChange, pdfRenderOptions]);

	const moveToPreviousPage = useCallback(() => {
		if (!pdfDocument) {
			return;
		}
		setPdfPageIndex(Math.max(pdfPageIndex - 1, 0));
	}, [pdfDocument, pdfPageIndex]);

	const moveToNextPage = useCallback(() => {
		if (!pdfDocument) {
			return;
		}
		setPdfPageIndex(Math.min(pdfPageIndex + 1, pdfDocument.numPages - 1));
	}, [pdfDocument, pdfPageIndex]);

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

	const requestUpdatePdfRenderOptions = useCallback(
		({ baseX, baseY, scale }: PdfRenderOptions) => {
			if (!pdfPage) {
				return;
			}
			const newScale = Math.max(scale, 1);
			const newBaseX = Math.max(Math.min(pdfPage.originalWidth * (1 - 1 / newScale), baseX), 0);
			const newBaseY = Math.max(Math.min(pdfPage.originalHeight * (1 - 1 / newScale), baseY), 0);
			setPdfRenderOptions({
				baseX: newBaseX,
				baseY: newBaseY,
				scale: Number(newScale.toFixed(2)),
			});
		},
		[pdfPage],
	);

	const wheelEventHandler = useCallback(
		(event: WheelEvent) => {
			if (!pdfPage) {
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
			requestUpdatePdfRenderOptions({
				baseX: scaledBaseX,
				baseY: scaledBaseY,
				scale: newScale,
			});
		},
		[pdfRenderOptions, pdfPage, requestUpdatePdfRenderOptions],
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
			if (event.buttons !== 1) {
				return;
			}
			const { baseX, baseY, scale } = pdfRenderOptions;
			requestUpdatePdfRenderOptions({
				baseX: baseX - event.movementX / scale,
				baseY: baseY - event.movementY / scale,
				scale: scale,
			});
		},
		[dragModeEnabled, pdfRenderOptions, requestUpdatePdfRenderOptions],
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
