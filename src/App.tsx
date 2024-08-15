import PDFViewer from "./components/PDF/PDFViewer";
import TestDocument from "./assets/test.pdf";

export default function App() {
	return <PDFViewer pdfDocumentURL={TestDocument} />;
}
