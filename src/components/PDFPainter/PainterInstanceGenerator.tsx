import { memo } from "react";
import { PDFPainterInstanceControllerHook } from "@components/PDFPainter/types";

const PainterInstanceGenerator = ({
	instanceId,
	readOnly = false,
	customPdfPainterInstanceControllerHook,
}: {
	instanceId: string;
	readOnly?: boolean;
	customPdfPainterInstanceControllerHook?: PDFPainterInstanceControllerHook;
}) => {
	return (
		<div>
			<div>{instanceId}</div>
			<div>{readOnly}</div>
			<div>{String(customPdfPainterInstanceControllerHook)}</div>
		</div>
	);
};

export default memo(PainterInstanceGenerator);
