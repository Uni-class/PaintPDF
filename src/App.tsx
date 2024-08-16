import PDFPainter from "./components/PDFPainter";
import TestDocument from "./assets/test.pdf";

export default function App() {
	return <PDFPainter pdfDocumentURL={TestDocument} />;
}
