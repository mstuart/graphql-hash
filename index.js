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

function findBlockStringEnd(query, start) {
  let end = start;
  while (end < query.length) {
    end = query.indexOf('"""', end);
    let backslashes = 0;
    for (
      let cursor = end - 1;
      end !== -1 && query[cursor] === "\\";
      cursor -= 1
    ) {
      backslashes += 1;
    }
    if (end === -1 || backslashes % 2 === 0) {
      return end;
    }
    end += 3;
  }
  return -1;
}

function findRegularStringEnd(query, start) {
  let cursor = start;
  while (cursor < query.length) {
    if (query[cursor] === "\\") {
      cursor += 2;
      continue;
    }
    if (query[cursor] === '"') {
      return cursor + 1;
    }
    cursor += 1;
  }
  return query.length;
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
    // A quote in a comment is ordinary comment text, not a string opener.
    if (query[index] === "#") {
      while (index < length && query[index] !== "\n") {
        index += 1;
      }
      pending += "\n";
      index += 1;
      continue;
    }

    // Block string ("""..."""): preserve verbatim, including # and whitespace.
    if (query.startsWith('"""', index)) {
      flush();
      const end = findBlockStringEnd(query, index + 3);
      const stop = end === -1 ? length : end + 3;
      result += query.slice(index, stop);
      index = stop;
      continue;
    }

    // Regular string ("..."): preserve verbatim, honoring backslash escapes.
    if (query[index] === '"') {
      flush();
      const cursor = findRegularStringEnd(query, index + 1);
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
