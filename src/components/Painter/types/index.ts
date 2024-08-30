export type ExternalAssetStore = {
	upload(id: string, type: string, file: File): Promise<string>;
	resolve(id: string, type: string, url: string): string | Promise<string>;
};
