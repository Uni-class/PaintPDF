import { Editor } from 'tldraw';
import { ExternalAssetStore } from './types';
export declare const Painter: import('react').MemoExoticComponent<({ width, height, readOnly, externalAssetStore, onEditorLoad, }: {
    width?: number | string;
    height?: number | string;
    readOnly?: boolean;
    externalAssetStore?: ExternalAssetStore | null;
    onEditorLoad?: (editor: Editor) => void;
}) => import("react/jsx-runtime").JSX.Element>;
