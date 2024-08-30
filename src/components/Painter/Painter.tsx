import { useMemo, memo } from "react";
import { Editor, Tldraw, TLComponents, TLUiOverrides, TLUiActionsContextType, TLUiToolsContextType } from "tldraw";

import "tldraw/tldraw.css";
import "./Painter.css";

const Painter = ({
	width = "100%",
	height = "100%",
	readOnly = false,
	enableKeyboardShortcuts = false,
	onEditorLoad = () => {},
}: {
	width?: number | string;
	height?: number | string;
	readOnly?: boolean;
	enableKeyboardShortcuts?: boolean;
	onEditorLoad?: (editor: Editor) => void;
}) => {
	const components = useMemo<TLComponents>(
		() => ({
			PageMenu: null,
		}),
		[],
	);

	const keyboardShortcutsEnabledOverrides: TLUiOverrides = {
		actions(_editor, actions): TLUiActionsContextType {
			return actions;
		},
		tools(_editor, tools): TLUiToolsContextType {
			return tools;
		},
	};

	const keyboardShortcutsDisabledOverrides: TLUiOverrides = {
		actions(_editor, actions): TLUiActionsContextType {
			return Object.fromEntries(Object.entries(actions).map(([key, value]) => [key, { ...value, kbd: "" }]));
		},
		tools(_editor, tools): TLUiToolsContextType {
			return Object.fromEntries(Object.entries(tools).map(([key, value]) => [key, { ...value, kbd: "" }]));
		},
	};

	return (
		<div
			style={{
				width: width,
				height: height,
				pointerEvents: readOnly ? "none" : "unset",
			}}
		>
			<Tldraw
				onMount={onEditorLoad}
				hideUi={readOnly}
				components={components}
				overrides={enableKeyboardShortcuts ? keyboardShortcutsEnabledOverrides : keyboardShortcutsDisabledOverrides}
			></Tldraw>
		</div>
	);
};

export default memo(Painter);
