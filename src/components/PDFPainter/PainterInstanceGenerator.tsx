import { memo } from "react";
import { PDFPainterInstanceControllerHook } from "@components/PDFPainter/types";

const PainterInstanceGenerator = ({
	instanceId,
	readOnly = false,
	enableKeyboardShortcuts = false,
	customPdfPainterInstanceControllerHook,
}: {
	instanceId: string;
	readOnly?: boolean;
	enableKeyboardShortcuts?: boolean;
	customPdfPainterInstanceControllerHook?: PDFPainterInstanceControllerHook;
}) => {
	return (
		<div>
			<div>{instanceId}</div>
			<div>{readOnly}</div>
			<div>{enableKeyboardShortcuts}</div>
			<div>{String(customPdfPainterInstanceControllerHook)}</div>
		</div>
	);
};

export default memo(PainterInstanceGenerator);
