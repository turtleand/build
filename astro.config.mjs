// @ts-check
import { defineConfig } from "astro/config";
import remarkCodeImport from "./scripts/remark-code-import.mjs";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://build.turtleand.com",
	integrations: [sitemap()],
	markdown: {
		remarkPlugins: [remarkCodeImport],
	},
});
