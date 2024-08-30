import PDFPainter from "./components/PDFPainter/PDFPainter.tsx";
import PainterInstanceGenerator from "@components/PDFPainter/PainterInstanceGenerator.tsx";

import TestDocument from "@assets/examples/test.pdf";
import usePDFPainterController from "@components/PDFPainter/hooks/usePDFPainterController.ts";
import usePDFPainterInstanceController from "@components/PDFPainter/hooks/usePDFPainterInstanceController.ts";

export default function App() {
	const pdfPainterControllerHook = usePDFPainterController({ painterId: "Session123_File123" });
	const { pdfPainterController } = pdfPainterControllerHook;
	const pdfPainterHostInstanceControllerHook = usePDFPainterInstanceController({
		editorId: "Host",
		pdfPainterController: pdfPainterControllerHook.pdfPainterController,
		onStoreUpdate: (changes) => console.log("Host Changes", changes),
	});
	const { pdfPainterInstanceController: hostInstanceController } = pdfPainterHostInstanceControllerHook;
	const pdfPainterGuestInstanceControllerHook = usePDFPainterInstanceController({
		editorId: "Guest",
		pdfPainterController: pdfPainterControllerHook.pdfPainterController,
		onStoreUpdate: (changes) => console.log("Guest Changes", changes),
	});
	const { pdfPainterInstanceController: guestInstanceController } = pdfPainterGuestInstanceControllerHook;

	console.log("Painter Global Controller", pdfPainterController);
	console.log("Host Controller", hostInstanceController);
	console.log("Guest Controller", guestInstanceController);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100vw",
				height: "100vh",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<PDFPainter customPdfPainterControllerHook={pdfPainterControllerHook} painterId={"Session123_File123"} pdfDocumentURL={TestDocument}>
				<PainterInstanceGenerator
					instanceId={"Host"}
					readOnly={true}
					enableKeyboardShortcuts={false}
					customPdfPainterInstanceControllerHook={pdfPainterHostInstanceControllerHook}
				/>
				<PainterInstanceGenerator
					instanceId={"Guest"}
					readOnly={false}
					enableKeyboardShortcuts={true}
					customPdfPainterInstanceControllerHook={pdfPainterGuestInstanceControllerHook}
				/>
			</PDFPainter>
		</div>
	);
}
