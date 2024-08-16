import { memo } from "react";
import { Editor, Tldraw } from "tldraw";
import "./Painter.css";

const Painter = ({
	width,
	height,
	readOnly = false,
	onEditorLoad = () => {},
}: {
	width: number;
	height: number;
	readOnly?: boolean;
	onEditorLoad?: (editor: Editor) => void;
}) => {
	return (
		<div
			style={{
				width: width,
				height: height,
			}}
		>
			<Tldraw onMount={onEditorLoad} hideUi={readOnly}></Tldraw>
		</div>
	);
};

export default memo(Painter);
