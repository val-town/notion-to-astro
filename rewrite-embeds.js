import { toString } from "mdast-util-to-string";
import { visit, SKIP } from "unist-util-visit";

/**
 * Astro has some aggressive stylesheets that include
 * rules for iframes. Disable them by wrapping
 * stuff in a div with a .no-content class.
 */
function notContent(child) {
  return {
    type: "mdxJsxFlowElement",
    name: "div",
    attributes: [
      {
        type: "mdxJsxAttribute",
        name: "class",
        value: "not-content",
      },
    ],
    children: [child],
  };
}

/**
 * We used a bunch of embeds for our documentation,
 * and Notion exports them as links to themselves on
 * the same line. This tries to sniff for them.
 *
 * @returns Transform
 */
export function rewriteEmbeds() {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    visit(tree, "link", function (node, index, parent) {
      // If it's a link to itself and it's alone on a line,
      // it's probably an iframe.
      if (
        node.url &&
        node.url == toString(node) &&
        parent.children.length === 1
      ) {
        if (node.url.includes("val.town")) {
          parent.children[index] = notContent({
            type: "mdxJsxFlowElement",
            name: "iframe",
            attributes: [
              { type: "mdxJsxAttribute", name: "src", value: node.url },
              { type: "mdxJsxAttribute", name: "width", value: "100%" },
              { type: "mdxJsxAttribute", name: "frameborder", value: "no" },
              {
                type: "mdxJsxAttribute",
                name: "style",
                value: "height: 400px;",
              },
            ],
            /** Make sure that this is not self-closing. */
            children: [
              {
                type: "text",
                value: " ",
              },
            ],
          });
          return SKIP;
        } else if (node.url.includes("youtube.com")) {
          const u = new URL(node.url);
          const v = u.searchParams.get("v");

          if (v) {
            parent.children[index] = notContent({
              type: "mdxJsxFlowElement",
              name: "lite-youtube",
              attributes: [
                { type: "mdxJsxAttribute", name: "videoid", value: v },
              ],
              children: [
                {
                  type: "text",
                  value: " ",
                },
              ],
            });
            return SKIP;
          }
        }
      }
    });
  };
}
