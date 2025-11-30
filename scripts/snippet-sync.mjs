import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, watch } from "node:fs";
import { dirname, resolve } from "node:path";

const ARTICLE_PATH = resolve("src/content/posts/2025-11-29-mocker-python.md");
const HASH_MARKER = "<!-- snippet-hash:";

const args = process.argv.slice(2);
const watchMode = args.includes("--watch");

syncOnce();
if (watchMode) {
	setupWatchers();
}

function syncOnce() {
	const markdown = readFileSync(ARTICLE_PATH, "utf8");
	const snippetFiles = extractSnippetFiles(markdown);
	if (snippetFiles.length === 0) {
		return;
	}

	const hash = computeHash(snippetFiles);
	updateHashComment(markdown, hash);
}

function setupWatchers() {
	let timeout;
	const queueSync = () => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			syncOnce();
		}, 50);
	};

	const markdownWatcher = watch(ARTICLE_PATH, queueSync);
	process.on("exit", () => markdownWatcher.close());

	const markdown = readFileSync(ARTICLE_PATH, "utf8");
	const snippetFiles = extractSnippetFiles(markdown);
	const baseDir = dirname(ARTICLE_PATH);

	for (const file of snippetFiles) {
		const absPath = resolve(baseDir, file);
		const watcher = watch(absPath, queueSync);
		process.on("exit", () => watcher.close());
	}
}

function extractSnippetFiles(markdown) {
	const regex = /```[\w+-]+\s+file=([^\s]+)\s*```/g;
	const files = [];
	let match;
	while ((match = regex.exec(markdown))) {
		files.push(match[1].replace(/['"]/g, ""));
	}
	return files;
}

function computeHash(files) {
	const hash = createHash("sha1");
	for (const file of files) {
		const absPath = resolve(dirname(ARTICLE_PATH), file);
		hash.update(readFileSync(absPath, "utf8"));
	}
	return hash.digest("hex");
}

function updateHashComment(markdown, hash) {
	const currentMatch = markdown.match(/<!-- snippet-hash:\s*([a-f0-9]+)\s*-->/);
	if (currentMatch && currentMatch[1] === hash) {
		return;
	}

	let updated;
	if (currentMatch) {
		updated = markdown.replace(
			/<!-- snippet-hash:\s*[a-f0-9]+\s*-->/,
			`<!-- snippet-hash: ${hash} -->`,
		);
	} else {
		const parts = markdown.split("-----------------------------");
		if (parts.length < 2) {
			throw new Error("Unable to locate frontmatter delimiter in article.");
		}
		parts.splice(1, 0, "\n<!-- snippet-hash: " + hash + " -->\n");
		updated = parts.join("-----------------------------");
	}

	writeFileSync(ARTICLE_PATH, updated);
}
