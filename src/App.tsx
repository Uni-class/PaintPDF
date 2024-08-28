import PDFPainter from "./components/PDFPainter/PDFPainter.tsx";
import PainterInstanceGenerator from "@components/PDFPainter/PainterInstanceGenerator.tsx";

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
				<PainterInstanceGenerator instanceId={"Host"} readOnly={true} />
				<PainterInstanceGenerator instanceId={"Guest"} readOnly={false} />
			</PDFPainter>
		</div>
	);
}
