import PDFPainter from "./components/PDFPainter";
import Painter from "./components/Painter/Painter.tsx";

import TestDocument from "./assets/test.pdf";

export default function App() {
	return (
		<div
			style={{
				display: "flex",
				width: "80vw",
				height: "80vh",
			}}
		>
			<PDFPainter pdfDocumentURL={TestDocument}>
				<Painter onEditorLoad={(editor) => console.log("Painter Loaded! I am the Host Editor", editor)} />
				<Painter onEditorLoad={(editor) => console.log("Painter Loaded! I am the Guest Editor", editor)} />
			</PDFPainter>
		</div>
	);
}
