/**
 * @typedef {import('mdast').Root} Root
 */
import { toString } from "mdast-util-to-string";
import { visit, EXIT } from "unist-util-visit";
import yaml from "js-yaml";
/**
 * Find the first heading, remove it,
 * and add its content to a new YAML
 * frontmatter as the title attribute.
 *
 * @returns Transform
 */
export function extractTitle() {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    let title = "";
    visit(tree, "heading", function (node, index, parent) {
      title = toString(node);
      parent.children.splice(index, 1);
      return EXIT;
    });

    tree.children.unshift({
      type: "yaml",
      value: yaml.dump({
        title: title,
        generated: Date.now(),
      }),
    });
  };
}
