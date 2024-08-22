import { useMemo, memo } from "react";
import { Editor, Tldraw, TLComponents } from "tldraw";

import "tldraw/tldraw.css";
import "./Painter.css";

const Painter = ({
	width = "100%",
	height = "100%",
	paintEnabled = true,
	onEditorLoad = () => {},
}: {
	width?: number | string;
	height?: number | string;
	paintEnabled?: boolean;
	onEditorLoad?: (editor: Editor) => void;
}) => {
	const components = useMemo<TLComponents>(
		() => ({
			PageMenu: null,
		}),
		[],
	);

	return (
		<div
			style={{
				width: width,
				height: height,
			}}
		>
			<Tldraw onMount={onEditorLoad} hideUi={!paintEnabled} components={components}></Tldraw>
		</div>
	);
};

export default memo(Painter);
