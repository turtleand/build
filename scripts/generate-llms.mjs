import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, body: content };
  const raw = match[1];
  const body = content.slice(match[0].length).trim();
  const data = {};
  let currentKey = null;
  let inArray = false;
  for (const line of raw.split('\n')) {
    if (inArray) {
      const itemMatch = line.match(/^\s+-\s+(.*)/);
      if (itemMatch) {
        data[currentKey].push(itemMatch[1].replace(/^["']|["']$/g, ''));
        continue;
      } else {
        inArray = false;
      }
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1];
      let val = kvMatch[2].trim();
      if (val === '') {
        currentKey = key;
        data[key] = [];
        inArray = true;
        continue;
      }
      val = val.replace(/^["']|["']$/g, '');
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      data[key] = val;
      currentKey = key;
    }
  }
  return { data, body };
}

function walkMd(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMd(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walkMd(POSTS_DIR).sort();
const posts = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const { data, body } = parseFrontmatter(content);
  // Only English, non-draft, non-research-notes
  if (data.draft === true) continue;
  if (data.locale && data.locale !== 'en') continue;
  if (data.isResearchNotes === true) continue;
  
  const slug = data.slug || path.basename(file, '.md').replace(/^index$/, path.basename(path.dirname(file)));
  posts.push({
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || '',
    body,
  });
}

// Sort by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const llmsTxt = `# Turtleand Build

> Engineering fundamentals, software craft, and deep technical understanding.

## Articles
${posts.map(p => `- [${p.title}](https://build.turtleand.com/blog/${p.slug}/): ${p.description}`).join('\n')}

## About
Written by Turtleand — exploring engineering fundamentals with clarity and depth.
- Portal: https://turtleand.com
- GitHub: https://github.com/turtleand
`;

const llmsFullTxt = `# Turtleand Build — Full Content

> All posts concatenated for AI consumption.

${posts.map(p => `---\n\n# ${p.title}\n\n> ${p.description}\n\nPublished: ${p.date}\nURL: https://build.turtleand.com/blog/${p.slug}/\n\n${p.body}`).join('\n\n')}
`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsTxt);
fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFullTxt);

console.log(`✅ Generated llms.txt (${posts.length} posts) and llms-full.txt`);
