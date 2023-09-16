/* eslint-disable import/extensions */

// Node stdlib
import * as fs from 'node:fs';
import * as path from 'node:path';
import {SnippetInjector} from './snippet-injector';

type HashTable<T> = Record<string, T>;

export class SnippetExtractor extends SnippetInjector {
	public targetDir = '';

	// Excluding for the moment.
	// protected hasSnippet(fileExtension: string, id: string): boolean {
	// 	const snippetPath = this.fileForSnippet(id);
	// 	let snippetData: HashTable<string> = {};
	// 	if (fs.existsSync(snippetPath)) {
	// 		const contents = fs.readFileSync(snippetPath, 'utf8');
	// 		snippetData = JSON.parse(contents);
	// 	}

	// 	if (snippetData[this.keyForExtension(fileExtension)]) {
	// 		throw new Error(`Duplicate snippet: '${id}' for type: '${fileExtension}'`);
	// 	}

	// 	return false;
	// }

	// protected addSnippet(fileExtension: string, id: string, snippet: string): void {
	// 	const snippetPath = this.fileForSnippet(id);
	// 	let snippetData: HashTable<string> = {};
	// 	if (fs.existsSync(snippetPath)) {
	// 		const contents = fs.readFileSync(snippetPath, 'utf8');
	// 		snippetData = JSON.parse(contents);
	// 	}

	// 	snippetData[this.keyForExtension(fileExtension)] = snippet;
	// 	fs.writeFileSync(snippetPath, JSON.stringify(snippetData, null, '    '));
	// }

	// private fileForSnippet(id: string) {
	// 	return path.join(this.targetDir, id) + '.json';
	// }

	// private keyForExtension(fileExtension: string): string {
	// 	return fileExtension.toLowerCase().replace(/^\./, '');
	// }
}
