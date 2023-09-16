/* eslint-disable max-params */
/* eslint-disable import/extensions */
import * as os from 'node:os';
import {type ProgramOptions} from './args';
import {log} from './log';
import {type FormatSpec} from './format-specs';
import {type SourceFile} from './source-file';

// Old Version: const ws = '[\\t ]*';
// const ws = '[^\\S\\r\\n]*';

// REGEX Refactor
// export const snippetExpressions = {
// 	name: '([a-z][a-zA-Z0-9-_?=&/\\\\\\.]*)',
// 	properties: '(?:&?[^=&]*=[^=&]*)*', // &prop1=value1&prop2=value2
// 	hide: '\\(hide\\)' + ws,
// 	start: '>>' + ws,
// 	end: '<<' + ws,
// };

export const whitespace = /[^\S\r\n]/;
export const whitespaceNewline = new RegExp(whitespace.source + '\\r?\\n');
export const snippetStartPrefix = new RegExp('>>' + whitespace.source);
export const snippetEndPrefix = new RegExp('<<' + whitespace.source);
export const hideToken = /\(hide\)/;
export const snippetToken = /id='([a-z][\w-]*)'[^\S\r\n]*(?:options='(.*)')?/;
export const snippetName = /([a-z][\w-?=&/\\.]*)/;
export const snippetProperties = new RegExp('(?:&?[^=&]*=[^=&]*)*' + whitespace.source);
// MD Regex: 		const regex = new RegExp(`${this.placeholderPrefix}${whitespace.source}*snippet${whitespace.source}+id=['"]([a-z][a-zA-Z0-9-_]*)['"]${whitespace.source}*(?:options=['"](.*)['"])?[\\S\\s]${this.placeholderSuffix}[\\S\\s]*?${this.placeholderPrefix}\\/snippet${this.placeholderSuffix}`, 'g');

// REGEX Refactor
// export const snippetExpressionsV2 = {
// 	name: '([a-z][a-zA-Z0-9-_?=&/\\\\\\.]*)',
// 	snippet: 'id=\'([a-z][a-zA-Z0-9-_]*)\'[^\\S\\r\\n]*(?:options=\'(.*)\')?',
// 	hide: '\\(hide\\)' + ws,
// 	start: />>/.source + /\s*/.source,
// 	end: /<</.source + /\s*/.source,
// 	whitespace: /\s*/,
// };

export class Snippet {
	public value: string;
	public id!: string;
	public options!: string;

	constructor(
		public readonly programOptions: ProgramOptions,
		public readonly token: string,
		public readonly fileExtension: string,
		public readonly sourceFile: SourceFile,
		public readonly spec: FormatSpec,
	) {
		this.value = '';
		const match = sourceFile.openRegExp.exec(token);

		log.debug('Snippet Token', token);
		log.debug('Snippet Start Regex', sourceFile.openRegExp);

		if (match) {
			log.debug('Snippet ID:', match[1]);
			log.debug('Snippet Options:', match[2]);
			this.id = match[1];
			this.options = match[2];
		}
	}

	public get originalValue(): string {
		return this.value;
	}

	public get file(): string {
		return this.getOptionsValue('file');
	}

	public get header(): string {
		return this.getOptionsValue('header');
	}

	public get footer(): string {
		return this.getOptionsValue('footer');
	}

	public getOptionsValue(key: string): string {
		if (this.options) {
			const value = this.options.split('&').find(p => p.startsWith(key + '='));
			if (value) {
				return value.split('=')[1];
			}
		}

		return '';
	}

	public get processedValue(): string {
		let snippet = this.value
			.replace(this.sourceFile.openReplacerRegExp, '')
			.replace(this.sourceFile.closeReplacerRegExp, '');
		snippet = this.trimWhiteSpaces(snippet);

		if (this.spec.postProcess) {
			snippet = this.spec.postProcess(snippet);
		}

		snippet = this.removeHiddenBlocks(snippet, this.spec);

		return snippet;
	}

	public test() {
		log.info('Snippet test');
	}

	private trimWhiteSpaces(snippet: string): string {
		// Const hasText = (str: string) => /\S/;
		snippet = snippet.replaceAll('\t', '    '); // Replace tabs with 4 spaces
		const lines = snippet.split(/\r?\n/);

		// Remove lines that has no text at start of snippet
		while (lines.length > 0 && !this.lineHasText(lines[0])) {
			lines.shift();
		}

		// Remove lines that has no text at end of snippet
		while (lines.length > 0 && !this.lineHasText(lines.at(-1))) {
			lines.pop();
		}

		// Get starting spaces
		let minStartingSpaces = Number.POSITIVE_INFINITY;
		for (const line of lines) {
			if (/\S/.test(line)) {
				const spaces = /^ */.exec(line);
				if (spaces) {
					const spacesOnLeft = spaces[0].length;
					minStartingSpaces = Math.min(minStartingSpaces, spacesOnLeft);
				}
			}
		}

		// Remove starting spaces
		if (minStartingSpaces !== Number.POSITIVE_INFINITY && minStartingSpaces > 0) {
			for (let i = 0; i < lines.length; i++) {
				if (/\S/.test(lines[i])) {
					lines[i] = lines[i].slice(minStartingSpaces);
				}
			}
		}

		return lines.join(os.EOL);
	}

	private lineHasText(line: string | undefined): boolean {
		if (line !== undefined) {
			return /\S/.test(line);
		}

		return false;
	}

	private removeHiddenBlocks(snippet: string, spec: FormatSpec) {
		const startExp = new RegExp(spec.commentStart + snippetStartPrefix.source + hideToken.source + spec.commentEnd, 'g');
		const endExp = new RegExp(spec.commentStart + snippetEndPrefix.source + hideToken.source + spec.commentEnd, 'g');

		// eslint-disable-next-line @typescript-eslint/ban-types
		let match: RegExpMatchArray | null;
		const startMatches = new Array<RegExpMatchArray>();
		const endMatches = new Array<RegExpMatchArray>();

		// eslint-disable-next-line no-cond-assign
		while (match = startExp.exec(snippet)) {
			startMatches.push(match);
		}

		// eslint-disable-next-line no-cond-assign
		while (match = endExp.exec(snippet)) {
			endMatches.push(match);
		}

		// Validate
		if (startMatches.length !== endMatches.length) {
			throw new Error('Start and end match blocks don\'t match for snippet: ' + snippet);
		}

		for (let i = startMatches.length - 1; i >= 0; i--) {
			const start = startMatches[i];
			const end = endMatches[i];
			if (start.index && end.index) {
				snippet = snippet.slice(0, Math.max(0, start.index)) + snippet.slice(Math.max(0, end.index + end[0].length));
			}
		}

		return snippet;
	}
}
