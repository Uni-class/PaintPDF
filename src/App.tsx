import PDFPainter from "./components/PDFPainter";
import Painter from "./components/Painter/Painter.tsx";

import TestDocument from "./assets/test.pdf";

export default function App() {
	return (
		<PDFPainter pdfDocumentURL={TestDocument}>
			<Painter onEditorLoad={(editor) => console.log("Editor Loaded! I am the Host Painter", editor)} />
			<Painter onEditorLoad={(editor) => console.log("Editor Loaded! I am the Guest Painter", editor)} />
		</PDFPainter>
	);
}
