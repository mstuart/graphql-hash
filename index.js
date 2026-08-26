import { createHash } from "node:crypto";

// Normalize a run of GraphQL source that contains no string literals:
// strip comments, collapse insignificant whitespace, and remove whitespace
// around structural punctuation.
function normalizeOutsideStrings(segment) {
  return segment
    .replaceAll(/#[^\n]*/g, "")
    .replaceAll(/\s+/g, " ")
    .replaceAll(/\s*([{}(),:@=])\s*/g, "$1");
}

export function normalizeQuery(query) {
  let result = "";
  let pending = "";
  let index = 0;
  const { length } = query;

  const flush = () => {
    result += normalizeOutsideStrings(pending);
    pending = "";
  };

  while (index < length) {
    // Block string ("""..."""): preserve verbatim, including # and whitespace.
    if (query.startsWith('"""', index)) {
      flush();
      const end = query.indexOf('"""', index + 3);
      const stop = end === -1 ? length : end + 3;
      result += query.slice(index, stop);
      index = stop;
      continue;
    }

    // Regular string ("..."): preserve verbatim, honoring backslash escapes.
    if (query[index] === '"') {
      flush();
      let cursor = index + 1;
      while (cursor < length) {
        if (query[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (query[cursor] === '"') {
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      result += query.slice(index, cursor);
      index = cursor;
      continue;
    }

    pending += query[index];
    index += 1;
  }

  flush();
  return result.trim();
}

export default function graphqlHash(query, options = {}) {
  const { algorithm = "sha256" } = options;
  const normalized = normalizeQuery(query);
  return createHash(algorithm).update(normalized).digest("hex");
}
