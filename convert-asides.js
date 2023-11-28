/**
 *
 * Notion exports asides with <aside> tags,
 * whereas Starlight wants the :::aside syntax.
 *
 * https://starlight.astro.build/guides/authoring-content/#asides
 *
 * @param {string} str
 */
export function convertAsides(str) {
  return str
    .replace(/<aside>/g, ":::note")
    .replace(/<\/aside>/g, "OUTPUT_DIR:::");
}
