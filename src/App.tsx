import PDFPainter from "./components/PDFPainter/PDFPainter.tsx";
import Painter from "./components/Painter/Painter.tsx";

import TestDocument from "./assets/examples/test.pdf";

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
			<PDFPainter pdfDocumentURL={TestDocument}>
				<Painter readOnly={true} onEditorLoad={(editor) => console.log("Painter Loaded! I am the Host Editor", editor)} />
				<Painter readOnly={false} onEditorLoad={(editor) => console.log("Painter Loaded! I am the Guest Editor", editor)} />
			</PDFPainter>
		</div>
	);
}
