import { memo } from "react";
import { PDFPainterInstanceController } from "@components/PDFPainter/types";

const PainterInstanceGenerator = ({
	instanceId,
	readOnly = false,
}: {
	instanceId: string;
	readOnly?: boolean;
	onLoad?: (pdfPainterInstanceController: PDFPainterInstanceController) => void;
}) => {
	return (
		<div>
			<div>{instanceId}</div>
			<div>{readOnly}</div>
		</div>
	);
};

export default memo(PainterInstanceGenerator);
