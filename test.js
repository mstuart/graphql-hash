import test from "ava";
import graphqlHash, { normalizeQuery } from "./index.js";

const HEX_PATTERN = /^[\da-f]+$/;

test("identical queries produce same hash", (t) => {
  const hash1 = graphqlHash("{ user { name } }");
  const hash2 = graphqlHash("{ user { name } }");
  t.is(hash1, hash2);
});

test("whitespace variations produce same hash", (t) => {
  const compact = graphqlHash("{user{name}}");
  const spaced = graphqlHash("{ user { name } }");
  const multiline = graphqlHash(`{
		user {
			name
		}
	}`);
  t.is(compact, spaced);
  t.is(spaced, multiline);
});

test("comments do not affect hash", (t) => {
  const withComment = graphqlHash(`
		# This is a comment
		{ user { name } }
	`);
  const withoutComment = graphqlHash("{ user { name } }");
  t.is(withComment, withoutComment);
});

test("different queries produce different hashes", (t) => {
  const hash1 = graphqlHash("{ user { name } }");
  const hash2 = graphqlHash("{ user { email } }");
  t.not(hash1, hash2);
});

test("returns a hex string", (t) => {
  const hash = graphqlHash("{ user { name } }");
  t.regex(hash, HEX_PATTERN);
});

test("returns a 64-character hex string for sha256", (t) => {
  const hash = graphqlHash("{ user { name } }");
  t.is(hash.length, 64);
});

test("custom algorithm works", (t) => {
  const hash = graphqlHash("{ user { name } }", { algorithm: "md5" });
  t.is(hash.length, 32);
  t.regex(hash, HEX_PATTERN);
});

test("normalizeQuery strips comments", (t) => {
  const result = normalizeQuery(`
		# comment
		{ user { name } }
	`);
  t.false(result.includes("#"));
  t.false(result.includes("comment"));
});

test("normalizeQuery collapses whitespace", (t) => {
  const result = normalizeQuery("  {  user  {  name  }  }  ");
  t.false(result.includes("  "));
});

test("normalizeQuery removes space around structural chars", (t) => {
  const result = normalizeQuery("{ user { name } }");
  t.is(result, "{user{name}}");
});

test("normalizeQuery handles arguments", (t) => {
  const result = normalizeQuery("{ user ( id : 1 ) { name } }");
  t.is(result, "{user(id:1){name}}");
});

test("normalizeQuery handles directives", (t) => {
  const result = normalizeQuery("{ user @include(if: true) { name } }");
  t.is(result, "{user@include(if:true){name}}");
});

test("normalizeQuery trims result", (t) => {
  const result = normalizeQuery("  { user { name } }  ");
  t.false(result.startsWith(" "));
  t.false(result.endsWith(" "));
});

test("complex query with fragments", (t) => {
  const query = `
		# Get user data
		query GetUser($id: ID!) {
			user(id: $id) {
				...UserFields
			}
		}

		fragment UserFields on User {
			name
			email
		}
	`;
  const hash = graphqlHash(query);
  t.is(typeof hash, "string");
  t.is(hash.length, 64);
});

test("mutation query hashes correctly", (t) => {
  const hash = graphqlHash('mutation { updateUser(name: "test") { id } }');
  t.is(typeof hash, "string");
  t.is(hash.length, 64);
});

test("graphqlHash is the default export", (t) => {
  t.is(typeof graphqlHash, "function");
});

test("normalizeQuery is a named export", (t) => {
  t.is(typeof normalizeQuery, "function");
});

test("normalizeQuery rejects non-string input with a clear error", (t) => {
  t.throws(() => normalizeQuery(null), {
    instanceOf: TypeError,
    message: "Expected `query` to be a string",
  });
});

test("normalizeQuery handles inline comments at end of line", (t) => {
  const result = normalizeQuery("{ user { name # inline comment\n email } }");
  t.is(result, "{user{name email}}");
});

test("empty options object uses defaults", (t) => {
  const hash1 = graphqlHash("{ user { name } }");
  const hash2 = graphqlHash("{ user { name } }", {});
  t.is(hash1, hash2);
});

test("does not strip # inside string literals", (t) => {
  const result = normalizeQuery(`{ user(bio: "a # b") { name } }`);
  t.is(result, `{user(bio:"a # b"){name}}`);
});

test("preserves whitespace inside string literals (no collision)", (t) => {
  t.not(graphqlHash(`{ a(x: "a b") }`), graphqlHash(`{ a(x: "a  b") }`));
});

test("code after a string containing # is not lost", (t) => {
  const withHash = graphqlHash(`{ user(bio: "x # y") { name email } }`);
  const truncated = graphqlHash(`{ user(bio: "x`);
  t.not(withHash, truncated);
});

test("preserves block string literals verbatim", (t) => {
  const result = normalizeQuery(`{ a(x: """multi\nline # keep""") }`);
  t.is(result, `{a(x:"""multi\nline # keep""")}`);
});

test("honors escaped quotes inside strings", (t) => {
  const result = normalizeQuery(`{ a(x: "he said \\"hi\\" # ok") { b } }`);
  t.is(result, `{a(x:"he said \\"hi\\" # ok"){b}}`);
});

test("ignores quotes inside comments", (t) => {
  const withComment = `# Select the "name" field\n{ user { name } }`;
  t.is(normalizeQuery(withComment), normalizeQuery("{ user { name } }"));
});

test("honors escaped triple quotes inside block strings", (t) => {
  const compact = String.raw`{a(x:"""keep \""" # literal"""){b}}`;
  const spaced = String.raw`{ a ( x : """keep \""" # literal""" ) { b } }`;
  t.is(normalizeQuery(spaced), normalizeQuery(compact));
});
