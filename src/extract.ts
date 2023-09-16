#!/usr/bin/env node

import log from './log'
import parser from './args'
import { injectSnippets, loadSnippets} from './index'

void (async () => {
  const argv = await parser(process.argv)

  log.setLevel(argv.logLevel)
  log.debug('argv:', argv)

  await loadSnippets(argv).catch(error => {
    log.error(error)
    process.exit(1)
  })

  await injectSnippets(argv).catch(error => {
    log.error(error)
    process.exit(1)
  })

  process.exit(0)
})()


// declare var require;
// import {SnippetExtractor} from "./snippet-extractor";
// var yargsModule = require("yargs");

// var rootDirectory = yargsModule.argv.root;
// var targetDir = yargsModule.argv.target;

// if (rootDirectory === undefined) {
//     throw new Error("Root of snippet sources not defined. Please specify sources root by using the --root parameter.");
// }

// if (targetDir === undefined) {
//     throw new Error("Target dir not defined. Please provide the --target parameter.");
// }

// var snippetExtractor = new SnippetExtractor();
// snippetExtractor.targetDir = targetDir;
// snippetExtractor.sourceFileExtensionFilter = yargsModule.argv.sourceext || ".ts";

// snippetExtractor.process(rootDirectory);
