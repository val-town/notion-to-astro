import emojiRegex from "emoji-regex";
import * as Path from "node:path";
import GithubSlugger from "github-slugger";

const slugger = new GithubSlugger();

/**
 * GitHubSlugger will, by default,
 * disambiguate slugs. We don’t want that.
 *
 * @param {string} str
 */
function slug(str) {
  slugger.reset();
  return slugger.slug(str);
}

/**
 * Notion pages are exported including the UUID of the page
 * that Notion keeps for renaming purposes. We generally
 * don't want that, so this regex gets rid of it.
 *
 * This also rewrites the path from the input directory
 * to the output directory.
 *
 * @param {string} path
 * @param {string} inputDir
 * @param {string} outputDir
 */
export function getTargetPath(path, inputDir, outputDir) {
  const relativePath = Path.relative(inputDir, path);
  const outputPath = Path.join(
    outputDir,
    slugifyPath(removeJunk(relativePath)),
  );
  return outputPath;
}

export function linkedPath(path) {
  return slugifyPath(removeJunk(decodeURI(path)));
}

/**
 * Remove UUIDs and emojis from paths
 */
export function removeJunk(path) {
  return path
    .replace(/( [0-9a-f]{32})/g, "")
    .replace(emojiRegex(), "")
    .trim();
}

export function slugifyPath(path, overrideExtname = "") {
  const extname = Path.extname(path);
  const dir = Path.dirname(path);
  const base = Path.basename(path, extname);
  const parts = dir.split(Path.sep);
  const slugParts = parts.map((part) => slug(part));
  const joinedParts = slugParts.join(Path.sep);
  const slugPath = Path.join(
    joinedParts,
    slug(base) + (overrideExtname || extname),
  );
  return slugPath;
}
