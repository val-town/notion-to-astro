import { test } from "node:test";
import assert from "node:assert";
import { removeJunk, linkedPath } from "./paths.js";

test("removeJunk", (t) => {
  assert.strictEqual(
    removeJunk(
      "🔒 Restricted Library Mode 0cb2636d8e514d2daf4f3655ecbfb88f.md",
    ),
    "Restricted Library Mode.md",
  );
});

test("linkedPath", (t) => {
  assert.strictEqual(
    linkedPath(
      `HTTP%20Val%202a3b94843e544a6aa1de9d563f717b3f/Basic%20examples%2017c51b6e6f9e4b1e8e84158ec7a1cf62.md`,
      true,
    ),
    "http-val/basic-examples/",
  );
});
