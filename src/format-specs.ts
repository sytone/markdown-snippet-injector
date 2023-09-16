const whitespace = /[^\S\r\n]*/;
const wsAndLine = new RegExp(whitespace.source + '\\r?\\n');

export type FormatSpec = {
  commentStart: string;
  commentEnd: string;
  postProcess?: (arg0: string) => string;
};

/*
// >> id='snippet-injector-format-spec-js' options='file=format-spec/js.md'
title: Snippet Injector - Defining snippets in `JavaScript` and `TypeScript` source files
---

Defining code snippets in your source files is done by enclosing them with a starting token and
ending token prefixed by a line comment.

After the comment the two character `>>` indicate that there is a starting token. Next come
the `id` of the snippet, this is wrapped in single quotes like this `id='snippet-name-goes-here'`
next are options, if you are not setting any it should be empty like this `options=''`

// << snippet-injector-format-spec-js
*/
export const jsSpec: FormatSpec = {
  commentStart: whitespace.source + '\\/\\/' + whitespace.source,
  commentEnd: wsAndLine.source,
};

export const cssSpec: FormatSpec = {
  commentStart: whitespace.source + '\\/\\*' + whitespace.source,
  commentEnd: whitespace.source + '\\*\\/' + wsAndLine.source,
};

export const xmlSpec: FormatSpec = {
  commentStart: whitespace.source + '<!--' + whitespace.source,
  commentEnd: whitespace.source + '-->' + wsAndLine.source,
  postProcess(snippet: string) {
    const bindingRegEx = /{{.*}}/;
    const newLineChar = '\n';
    const linesOfSnippet = snippet.split(newLineChar);
    let newSnippet = linesOfSnippet.length > 0 ? '' : snippet;

    for (let i = 0; i < linesOfSnippet.length; i++) {
      let currentLine = linesOfSnippet[i];
      const match = bindingRegEx.exec(currentLine);

      if (match) {
        currentLine = '{% raw %}' + currentLine + '{% endraw %}';
      }

      newSnippet += currentLine;

      if (i < linesOfSnippet.length - 1) {
        newSnippet += newLineChar;
      }
    }

    return newSnippet;
  },
};

export const htmlSpec: FormatSpec = xmlSpec;

export function getFormatSpec(extension: string): FormatSpec {
  switch (extension) {
    case '.cs':
    case '.swift':
    case '.h':
    case '.m':
    case '.js':
    case '.java':
    case '.ts': {
      return jsSpec;
    }

    case '.css': {
      return cssSpec;
    }

    case '.xaml':
    case '.xml': {
      return xmlSpec;
    }

    case '.html': {
      return htmlSpec;
    }

    default: {
      throw new Error(`Unsupported file extension: ${extension}`);
    }
  }
}
