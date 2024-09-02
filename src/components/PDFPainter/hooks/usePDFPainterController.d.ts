import { ExternalAssetStore } from '../../Painter/types';
import { PDFPainterControllerHook } from '../types';
export declare const usePDFPainterController: ({ painterId, externalAssetStore, }: {
    painterId: string;
    externalAssetStore?: ExternalAssetStore | null;
}) => PDFPainterControllerHook;
