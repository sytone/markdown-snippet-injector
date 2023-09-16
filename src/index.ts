#!/usr/bin/env node
/* eslint-disable import/extensions */

// Types
import * as path from 'node:path';
import * as process from 'node:process';
import type {ProgramOptions} from './args';
import parser from './args';
import {log} from './log';
import {SnippetInjector} from './snippet-injector';

let snippetInjector: SnippetInjector;

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
	const argv = await parser(process.argv);
	snippetInjector = new SnippetInjector(argv);

	log.setLevel(argv.logLevel);
	log.debug('argv:', argv);

	log.info('Loading Snippets from Source Files under', argv.root);

	await loadSnippets(argv).catch(error => {
		log.error(error);
		process.exit(1);
	});

	log.info('Injecting Snippets into Document Files under', argv.docsRoot);

	await injectSnippets(argv).catch(error => {
		log.error(error);
		process.exit(1);
	});

	process.exit(0);
})();

/**
 * Load snippets procedure entrypoint, called by the CLI.
 */
export async function loadSnippets(options: ProgramOptions): Promise<void> {
	log.info('Loading snippets from', path.normalize(options.root));
	snippetInjector.process(path.normalize(options.root));
}

/**
 * Injection procedure entrypoint, called by the CLI.
 */
export async function injectSnippets(options: ProgramOptions): Promise<void> {
	log.info('Injecting snippets to', path.normalize(options.docsRoot));
	snippetInjector.injectSnippets(path.normalize(options.docsRoot));
	// Const outArchive = new JSZip()
	// const outPath = await destination.resolve(opts)
	// await fs.mkdir(outPath.dir, { recursive: true })
	// const pathList = await packlist({ path: opts.source })

	// const archivePromises = pathList.map(async file => {
	//     await archive.addPath(
	//         outArchive,
	//         opts,
	//         path.resolve(opts.source),
	//         path.resolve(opts.source, file),
	//     )
	// })

	// if (opts.addRootNodeModules) {
	//     await archive.addRootNodeModules(outArchive, opts)
	//     log.verbose('Added pnpm workspace node modules')
	// } else {
	//     log.debug('Skipping pnpm workspace node modules')
	// }

	// await Promise.all(archivePromises)
	// log.debug('All paths processed')

	// if (opts.staticDateModified) {
	//     Object.entries(outArchive.files).forEach(([name, file]) => {
	//         log.debug('Setting static date for', name)
	//         file.date = util.staticDate
	//     })
	// } else {
	//     log.debug('Not setting static dates')
	// }

	// const output = outArchive.generateAsync({ type: 'nodebuffer' })
	// await fs.writeFile(outPath.path, await output)
	// log.info('Packaged contents to', outPath.path)
}

// Declare var require;
// import {SnippetInjector} from "./snippet-injector";
// var yargsModule = require("yargs");

// var rootDirectory = yargsModule.argv.root;
// var docsRoot = yargsModule.argv.docsroot;

// if (rootDirectory === undefined) {
//     throw new Error("Root of snippet sources not defined. Please specify sources root by using the --root parameter.");
// }

// if (docsRoot === undefined) {
//     throw new Error("Root of documentation sources not defined. Please specify documentation root by using the --docsroot parameter.");
// }

// var snippetInjector = new SnippetInjector();

// snippetInjector.toWrap = yargsModule.argv.w;
// snippetInjector.sourceFileExtensionFilter = yargsModule.argv.sourceext || ".ts";
// snippetInjector.targetFileExtensionFilter = yargsModule.argv.targetext || ".md";

// snippetInjector.placeholderPrefix = yargsModule.argv.placeholderPrefix || "%%";
// snippetInjector.placeholderSuffix =yargsModule.argv.placeholderSuffix || "%%";

// snippetInjector.snippetTitles = yargsModule.argv.snippettitles;

// snippetInjector.process(rootDirectory);
// snippetInjector.injectSnippets(docsRoot);
