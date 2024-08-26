import { memo, useEffect } from "react";
import type { PDFPainterController } from "./types";
import ToolPointerIcon from "../../assets/icons/tool-pointer.svg";
import ToolHandIcon from "../../assets/icons/tool-hand.svg";
import ToolEditIcon from "../../assets/icons/tool-edit.svg";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg";
import ArrowRightIcon from "../../assets/icons/arrow-right.svg";

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
				<img src={ToolPointerIcon} alt={"기본"} />
			</button>
			<button disabled={pdfPainterController.getPaintMode() === "move"} onClick={() => pdfPainterController.setPaintMode("move")}>
				<img src={ToolHandIcon} alt={"이동"} />
			</button>
			<button disabled={pdfPainterController.getPaintMode() === "draw"} onClick={() => pdfPainterController.setPaintMode("draw")}>
				<img src={ToolEditIcon} alt={"그리기"} />
			</button>
			<button onClick={pdfPainterController.moveToPreviousPage}>
				<img src={ArrowLeftIcon} alt={"이전 페이지"} />
			</button>
			<div>
				{pdfPainterController.getPageIndex() + 1}/{pdfPainterController.getPageCount()}
			</div>
			<div>{Math.round(pdfPainterController.getRenderOptions().scale * 100)}%</div>
			<button onClick={pdfPainterController.moveToNextPage}>
				<img src={ArrowRightIcon} alt={"다음 페이지"} />
			</button>
		</div>
	);
};

export default memo(PDFPainterControlBar);
