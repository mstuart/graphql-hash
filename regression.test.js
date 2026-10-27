import test from "ava";
import graphqlHash, { normalizeQuery } from "./index.js";

test("carriage-return comments do not consume following fields", (t) => {
  const plain = "{ first second }";
  const commented = "{ first # comment\r second }";
  t.is(normalizeQuery(commented), normalizeQuery(plain));
  t.is(graphqlHash(commented), graphqlHash(plain));
  t.not(graphqlHash(commented), graphqlHash("{ first }"));
});

test("line-feed and CRLF comments preserve the same selection", (t) => {
  const plain = "{ first second }";
  for (const newline of ["\n", "\r\n"]) {
    t.is(
      graphqlHash(`{ first # comment${newline} second }`),
      graphqlHash(plain)
    );
  }
});

for (const backslashCount of [1, 2, 3, 4]) {
  test(`escaped block quotes after ${backslashCount} backslashes preserve content`, (t) => {
    const prefix = `keep ${"\\".repeat(backslashCount)}""" # `;
    const first = `{ a(x: """${prefix}first""") }`;
    const second = `{ a(x: """${prefix}second""") }`;

    t.is(normalizeQuery(first), `{a(x:"""${prefix}first""")}`);
    t.not(graphqlHash(first), graphqlHash(second));
  });
}
