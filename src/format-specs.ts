const whitespace = /[^\S\r\n]*/;
const wsAndLine = new RegExp(whitespace.source + '\\r?\\n');

export type FormatSpec = {
	commentStart: string;
	commentEnd: string;
	postProcess?: (arg0: string) => string;
};

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
