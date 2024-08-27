import PDFPainter from "./components/PDFPainter/PDFPainter.tsx";
import PainterInstance from "@components/PDFPainter/PDFPainterInstance.tsx";

import TestDocument from "@assets/examples/test.pdf";

export default function App() {
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
			<PDFPainter painterId={"Session123_File123"} pdfDocumentURL={TestDocument}>
				<PainterInstance instanceId={"Host"} readOnly={true} />
				<PainterInstance instanceId={"Guest"} readOnly={false} />
			</PDFPainter>
		</div>
	);
}
