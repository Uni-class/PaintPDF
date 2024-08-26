import { memo, useEffect } from "react";
import type { PDFPainterController } from "./types";

const PDFPainterControlBar = ({ pdfPainterController }: { pdfPainterController: PDFPainterController }) => {
	useEffect(() => {
		pdfPainterController.setDragModeEnabled(pdfPainterController.getPaintMode() === "move");
	}, [pdfPainterController]);

	return (
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
			<button disabled={pdfPainterController.getPaintMode() === "default"} onClick={() => pdfPainterController.setPaintMode("default")}>
				<img src={"https://cdn.tldraw.com/2.4.4/icons/icon/tool-pointer.svg"} alt={"기본"} />
			</button>
			<button disabled={pdfPainterController.getPaintMode() === "move"} onClick={() => pdfPainterController.setPaintMode("move")}>
				<img src={"https://cdn.tldraw.com/2.4.4/icons/icon/tool-hand.svg"} alt={"이동"} />
			</button>
			<button disabled={pdfPainterController.getPaintMode() === "draw"} onClick={() => pdfPainterController.setPaintMode("draw")}>
				<img src={"https://cdn.tldraw.com/2.4.4/icons/icon/tool-pencil.svg"} alt={"그리기"} />
			</button>
			<button onClick={pdfPainterController.moveToPreviousPage}>{"<"}</button>
			<div>
				{pdfPainterController.getPageIndex() + 1}/{pdfPainterController.getPageCount()}
			</div>
			<div>{Math.round(pdfPainterController.getRenderOptions().scale * 100)}%</div>
			<button onClick={pdfPainterController.moveToNextPage}>{">"}</button>
		</div>
	);
};

export default memo(PDFPainterControlBar);
