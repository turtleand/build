import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const FILE_META_REGEX = /(?:^|\s)file=(?:"([^"]+)"|([^\s]+))/;

export default function remarkCodeImport() {
	return (tree, file) => {
		const markdownDir =
			file?.history && file.history.length > 0
				? dirname(file.history[0])
				: process.cwd();

		visit(tree, (node) => {
			if (node.type !== "code" || !node.meta) {
				return;
			}

			const match = node.meta.match(FILE_META_REGEX);
			if (!match) {
				return;
			}

			const filePath = match[1] ?? match[2];
			if (!filePath) {
				return;
			}

			const absPath = resolve(markdownDir, filePath);
			const contents = readFileSync(absPath, "utf8");
			node.value = contents.replace(/\r\n/g, "\n");
			node.meta = node.meta.replace(FILE_META_REGEX, "").trim();

			const addWatchFile = file?.data?.astro?.addWatchFile;
			if (typeof addWatchFile === "function") {
				addWatchFile(absPath);
			}
		});
	};
}

function visit(node, fn) {
	fn(node);
	if (node.children && Array.isArray(node.children)) {
		for (const child of node.children) {
			visit(child, fn);
		}
	}
}
