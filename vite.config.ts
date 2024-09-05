import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), dts({ tsconfigPath: "./tsconfig.app.json" })],
	server: {
		port: 3000,
	},
	resolve: {
		alias: [
			{
				find: "@components",
				replacement: path.resolve(__dirname, "src/components"),
			},
			{
				find: "@assets",
				replacement: path.resolve(__dirname, "src/assets"),
			},
		],
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, "index.ts"),
			name: "PaintPDF",
			formats: ["es"],
			fileName: "index",
		},
	},
});
