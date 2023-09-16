#!/usr/bin/env node
/* eslint-disable import/extensions */
import * as process from 'node:process';
import {log} from './log';
import parser from './args';
import {injectSnippets, loadSnippets} from './index';

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  const argv = await parser(process.argv);

  log.setLevel(argv.logLevel);
  log.debug('argv:', argv);

  await loadSnippets(argv).catch(error => {
    log.error(error);
    process.exit(1);
  });

  await injectSnippets(argv).catch(error => {
    log.error(error);
    process.exit(1);
  });

  process.exit(0);
})();

// #!/usr/bin/env node
// declare var require;
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
