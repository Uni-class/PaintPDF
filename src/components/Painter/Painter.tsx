import { useMemo, memo } from "react";
import { Editor, Tldraw, TLComponents, TLUiOverrides, TLUiActionsContextType, TLUiToolsContextType, TLAssetStore } from "tldraw";

import "tldraw/tldraw.css";
import "./Painter.css";
import { TLAsset, TLAssetContext } from "@tldraw/tlschema";
import { ExternalAssetStore } from "@components/Painter/types";

const Painter = ({
	width = "100%",
	height = "100%",
	readOnly = false,
	externalAssetStore = null,
	onEditorLoad = () => {},
}: {
	width?: number | string;
	height?: number | string;
	readOnly?: boolean;
	externalAssetStore?: ExternalAssetStore | null;
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
			const shortcuts: { [key: string]: string } = {
				undo: "$z",
				redo: "$!z",
				cut: "$x",
				copy: "$c",
				paste: "$v",
				"select-all": "$a",
				delete: "⌫,del,backspace",
				duplicate: "$d",
			};
			return Object.fromEntries(Object.entries(actions).map(([key, value]) => [key, { ...value, kbd: key in shortcuts ? shortcuts[key] : "" }]));
		},
		tools(_editor, tools): TLUiToolsContextType {
			return Object.fromEntries(Object.entries(tools).map(([key, value]) => [key, { ...value, kbd: "" }]));
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

	const assetStore: TLAssetStore | undefined = useMemo(() => {
		if (externalAssetStore) {
			return {
				upload(asset: TLAsset, file: File) {
					return externalAssetStore.upload(asset.id, asset.type, file);
				},
				resolve(asset: TLAsset, ctx: TLAssetContext) {
					return externalAssetStore.resolve(asset.id, asset.type, asset.props.src || "");
				},
			};
		} else {
			return undefined;
		}
	}, [externalAssetStore]);

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
				overrides={readOnly ? keyboardShortcutsDisabledOverrides : keyboardShortcutsEnabledOverrides}
				assets={assetStore}
			></Tldraw>
		</div>
	);
};

export default memo(Painter);
