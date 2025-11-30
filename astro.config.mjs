// @ts-check
import { defineConfig } from "astro/config";
import remarkCodeImport from "./scripts/remark-code-import.mjs";

// https://astro.build/config
export default defineConfig({
	markdown: {
		remarkPlugins: [remarkCodeImport],
	},
});
