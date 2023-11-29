/**
 * @typedef {import('mdast').Root} Root
 */
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkMdx from "remark-mdx";
import { unified } from "unified";
import { globby } from "globby";
import { visit } from "unist-util-visit";
import * as Fs from "node:fs/promises";
import * as Path from "node:path";
import meow from "meow";
import { extractTitle } from "./extract-title.js";
import { getTargetPath, linkedPath } from "./paths.js";
import { convertAsides } from "./convert-asides.js";
import { rewriteEmbeds } from "./rewrite-embeds.js";

const cli = meow(
  `
	Usage
	  $ notion-to-astro <input> <output> <subdirectory>

	Options
	  --clean, -c  Clean output directory

	Examples
	  $ notion-to-astro exported-notion astro-dir
`,
  {
    importMeta: import.meta,
    flags: {
      clean: {
        type: "boolean",
        shortFlag: "c",
      },
    },
  },
);

const INPUT_DIR = cli.input.at(0);
const OUTPUT_DIR = cli.input.at(1);
const SUBDIRECTORY = cli.input.at(2);

if (!INPUT_DIR) {
  console.error("Input dir missing");
  cli.showHelp();
}

if (!OUTPUT_DIR) {
  console.error("Input dir missing");
  cli.showHelp();
}

const files = await globby([`${INPUT_DIR}/**/*.md`]);
const otherFiles = (await globby([`${INPUT_DIR}/**/*`])).filter(
  (path) => Path.extname(path) !== ".md",
);

if (cli.flags.clean) {
  console.log(`Cleaning output directory`);
  await Fs.rm(OUTPUT_DIR, { recursive: true }).catch(() => {
    console.log("Directory to clean did not exist");
  });
}

/**
 * Link references use the filenames including
 * UUIDs - rewrite them.
 *
 * @returns Transform
 */
function rewriteLinks() {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    visit(tree, "link", function (node, _index, _parent) {
      try {
        new URL(node.url);
      } catch (e) {
        node.url = `../${linkedPath(node.url)}`.replace(/\.md$/, "");
      }
    });
  };
}

/**
 * Image references use the filenames including
 * UUIDs - rewrite them.
 *
 * @returns Transform
 */
function rewriteImageUrls() {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    visit(tree, "image", function (node, _index, _parent) {
      try {
        // If it's a valid URL, pass-through. We're only
        // transforming relative URLs.
        new URL(node.url);
      } catch (e) {
        node.url = `./${linkedPath(node.url, SUBDIRECTORY)}`;
      }
    });
  };
}

console.log("Transforming documents…");
for (let path of files) {
  const targetPath = getTargetPath(path, INPUT_DIR, OUTPUT_DIR, ".mdx");
  await Fs.mkdir(Path.dirname(targetPath), { recursive: true });

  let str = convertAsides(await Fs.readFile(path, "utf8"));

  console.log(`Transforming ${Path.basename(path)}`);

  /**
   * We want to parse the input _without_ mdx
   * syntax because the Notion export is just
   * markdown.
   */
  let ast = unified().use(remarkParse).parse(str);

  const u2 = unified()
    .use(remarkMdx)
    .use(remarkStringify)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(extractTitle)
    .use(rewriteImageUrls)
    .use(rewriteLinks)
    .use(rewriteEmbeds);

  ast = await u2.run(ast);
  const file = u2.stringify(ast);

  await Fs.writeFile(targetPath, String(file));
}

console.log("Copying other files…");
for (let other of otherFiles) {
  const target = getTargetPath(other, INPUT_DIR, OUTPUT_DIR);

  await Fs.mkdir(Path.dirname(target), { recursive: true });
  Fs.copyFile(other, target);
}
