import { useEffect, useRef, useCallback, memo, isValidElement, Children, ReactNode } from "react";
import { Editor } from "tldraw";
import PDFViewer from "../PDF/PDFViewer.tsx";
import Painter from "../Painter/Painter.tsx";
import usePDFPainterController from "./hooks/usePDFPainterController.ts";
import PDFPainterControlBar from "./PDFPainterControlBar.tsx";

import { PDFRenderSize } from "../PDF/types";

const PDFPainter = ({ painterId, pdfDocumentURL, children }: { painterId: string; pdfDocumentURL: string; children?: ReactNode }) => {
	const painterElement = useRef<HTMLDivElement | null>(null);

	const pdfPainterControllerHook = usePDFPainterController({ painterId: painterId });
	const { pdfPainterController } = pdfPainterControllerHook;

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
							pdfViewerController: pdfPainterControllerHook.pdfPainterController,
							onPdfDocumentChange: pdfPainterControllerHook.onPdfDocumentChange,
							onPdfPageChange: pdfPainterControllerHook.onPdfPageChange,
							onPdfItemClick: pdfPainterControllerHook.onPdfItemClick,
							onPdfMouseMoveEvent: pdfPainterControllerHook.onPdfMouseMoveEvent,
							onPdfWheelEvent: pdfPainterControllerHook.onPdfWheelEvent,
						}}
					/>
					{Children.toArray(children).map((element: ReactNode) => {
						if (isValidElement(element)) {
							return (
								<div
									key={element.props.instanceId}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: pdfPainterController.getRenderSize().width,
										height: pdfPainterController.getRenderSize().height,
										pointerEvents: pdfPainterController.getPaintMode() === "draw" ? "unset" : "none",
									}}
								>
									<Painter
										readOnly={element.props.readOnly}
										onEditorLoad={(editor: Editor) => {
											pdfPainterControllerHook.registerEditor(element.props.instanceId, editor);
										}}
									/>
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
