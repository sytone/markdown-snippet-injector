/* eslint-disable import/extensions */
import {assert} from 'chai';
import {Snippet, snippetExpressions, snippetExpressionsV2} from '../../src/snippet';
import {type ProgramOptions} from '../../src/args';
import {type FormatSpec, jsSpec} from '../../src/format-specs';
import {InMemoryFileSystem, SourceFile} from '../../src/source-file';

const options: ProgramOptions = {
	root: 'root',
	docsRoot: 'docsRoot',
	snippetTitles: 'JavaScript|TypeScript',
	wrap: true,
	sourceFileExtensionFilter: '.js|.ts',
	targetFileExtensionFilter: '.md',
	placeholderPrefix: '%%',
	placeholderSuffix: '%%',
	logLevel: 'debug',
};

const spec: FormatSpec = jsSpec;

// {comment} >> the-name-of-the-snippet {/comment}
// >> id='snippetinjector-process' options=''
const regExpOpenReplacer = new RegExp(spec.commentStart + snippetExpressions.start + snippetExpressionsV2.snippet + spec.commentEnd, 'g');
// {comment} << the-name-of-the-snippet {/comment}
const regExpCloseReplacer = new RegExp(spec.commentStart + snippetExpressions.end + snippetExpressions.name + spec.commentEnd, 'g');

function generateSnippetStart(id: string, options: string) {
	if (options && options.length > 0) {
		return `// >> id='${id}' options='${options}'`;
	}

	return `// >> id='${id}'`;
}

function generateSnippetEnd(id: string) {
	return `// << ${id}`;
}

describe('Snippet Tests', () => {
	it('return parsed contents for a simple snippet', () => {
		const id = 'snippet-id';
		const snippetStart = generateSnippetStart(id, '');
		const snippetEnd = generateSnippetEnd(id);
		const content = `${snippetStart} \nconst a = 1;\n${snippetEnd}  `;

		const sourceFile = new SourceFile(options, '.ts', '/test/in-memory.ts', new InMemoryFileSystem(content));

		const snippet = new Snippet(options, snippetStart, 'fileExtension', sourceFile, spec);
		snippet.value = content;

		assert.equal(snippet.id, id);
		assert.equal(snippet.file, '');

		const result = snippet.processedValue;
		assert.equal(snippet.originalValue, content);

		assert.equal(result, 'const a = 1;');
	});

	it('return parsed contents for a sippet with file creation', () => {
		const id = 'template-helper-make-md-link';
		const snippetStart = generateSnippetStart(id, 'file=templates/makemdlink.md');
		const snippetEnd = generateSnippetEnd(id);
		const content = `${snippetStart} \nconst a = 1;\n${snippetEnd}  `;

		const sourceFile = new SourceFile(options, '.ts', '/test/in-memory.ts', new InMemoryFileSystem(content));
		const snippet = new Snippet(options, snippetStart, 'fileExtension', sourceFile, spec);
		snippet.value = content;

		assert.equal(snippet.id, id);
		assert.equal(snippet.file, 'templates/makemdlink.md');

		const result = snippet.processedValue;
		assert.equal(result, 'const a = 1;');
	});
});
