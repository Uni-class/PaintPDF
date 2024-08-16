import { useState, useEffect, useRef, useCallback, memo } from "react";
import Painter from "./Painter/Painter";
import { Editor } from "tldraw";
import PDFViewer from "./PDF/PDFViewer";
import type { PDFPage } from "./PDF/BasePDFRenderer";
import type { PdfRenderOptions } from "./PDF/PDFRenderer";
import CleanPainterSnapshot from "../assets/snapshot.json";

const PDFPainter = ({ pdfDocumentURL }: { pdfDocumentURL: string }) => {
	const [editorSize, setEditorSize] = useState<[number, number]>([0, 0]);
	const [editor, setEditor] = useState<Editor | null>(null);
	const currentPageId = useRef<string | null>(null);
	const [paintMode, setPaintMode] = useState(true);

	const getPageId = useCallback(
		(index: number) => {
			return `${pdfDocumentURL}_${index}`;
		},
		[pdfDocumentURL],
	);

	const pdfPageChangeHandler = useCallback((pdfPage: PDFPage | null) => {
		setEditorSize([pdfPage?.originalWidth || 0, pdfPage?.originalHeight || 0]);
	}, []);

	const pdfPageIndexChangeHandler = useCallback(
		(index: number) => {
			if (!editor) {
				return;
			}
			if (currentPageId.current !== null) {
				console.log(`Save Paint: ${currentPageId.current}`);
				try {
					localStorage.setItem(currentPageId.current, JSON.stringify(editor.getSnapshot()));
				} catch {
					console.log(`Failed to save paint: ${currentPageId.current}`);
				}
			}
			currentPageId.current = getPageId(index);
			console.log(`Load Paint: ${currentPageId.current}`);
			try {
				editor.loadSnapshot(JSON.parse(localStorage.getItem(currentPageId.current) || ""));
			} catch {
				console.log(`Failed to load paint: ${currentPageId.current}`);
				console.log("Removing previous paint.");
				try {
					editor.loadSnapshot(CleanPainterSnapshot as any);
				} catch {
					console.log(`Failed to remove paint.`);
				}
			}
		},
		[getPageId, editor],
	);

	const pdfRenderOptionsChangeHandler = useCallback(
		(pdfRenderOptions: PdfRenderOptions) => {
			if (editor === null) {
				return;
			}
			const { baseX, baseY, scale } = pdfRenderOptions;
			editor.setCamera(
				{
					x: -baseX,
					y: -baseY,
					z: scale,
				},
				{
					force: true,
				},
			);
		},
		[editor],
	);

	useEffect(() => {
		if (editor === null) {
			return;
		}
		editor.updateInstanceState({
			isDebugMode: false,
			isReadonly: !paintMode,
		});
		editor.setCameraOptions({
			isLocked: true,
		});
	}, [editor, paintMode]);

	return (
		<div>
			<div
				style={{
					position: "relative",
					width: "fit-content",
					height: "fit-content",
				}}
			>
				<PDFViewer
					pdfDocumentURL={pdfDocumentURL}
					onPdfPageChange={pdfPageChangeHandler}
					onPdfPageIndexChange={pdfPageIndexChangeHandler}
					onPdfRenderOptionsChange={pdfRenderOptionsChangeHandler}
				/>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "fit-content",
						height: "fit-content",
						pointerEvents: paintMode ? "unset" : "none",
					}}
				>
					<Painter width={editorSize[0]} height={editorSize[1]} readOnly={!paintMode} onEditorLoad={setEditor} />
				</div>
			</div>
			<button onClick={() => setPaintMode(!paintMode)}>{paintMode ? "그리기 모드 해제" : "그리기 모드"}</button>
		</div>
	);
};

export default memo(PDFPainter);
