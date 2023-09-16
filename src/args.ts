/* eslint-disable n/file-extension-in-import */
/* eslint-disable import/extensions */
import * as process from 'node:process';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {levelNames, Level} from './log';
import type {LevelName} from './log';

/**
 * Program options, as passed by yargs.argv
 */
export type ProgramOptions = {
	[key: string]: unknown;
	logLevel: LevelName;

	root: string;
	docsRoot: string;
	snippetTitles: string;

	wrap: boolean;
	sourceFileExtensionFilter: string;
	targetFileExtensionFilter: string;
	placeholderPrefix: string;
	placeholderSuffix: string;
};

/**
 * Yargs CLI definition
 */
export default async function args(cmd: string[]): Promise<ProgramOptions> {
	return yargs(hideBin(cmd))
		.usage(
			'Usage: $0 [options...]\n\nBoolean options can be negated by prefixing with "no-" e.g. "--no-add-version"',
		)
		.option('root', {
			description: 'Root of snippet sources',
			alias: 'r',
			default: `${process.cwd()}/src`,
			defaultDescription: 'current working directory plus "/src"',
			normalize: true,
		})
		.normalize('root')
		.option('docs-root', {
			description:
        'Root of documentation sources',
			alias: 'd',
			default: `${process.cwd()}/docs`,
			defaultDescription: 'current working directory plus "/docs"',
			normalize: true,
		})
		.normalize('docs-root')
		.option('snippet-titles', {
			description: 'Suffix used for the placeholder command in the target files.',
			default: 'JavaScript|TypeScript',
		})
		.option('log-level', {
			description: 'Level of detail in logs',
			alias: 'l',
			choices: levelNames,
			default: levelNames[Level.info],
			defaultDescription: '',
		})
		.option('wrap', {
			description: 'Wrap the snippet around the snippet content if possible.',
			type: 'boolean',
			default: true,
		})
		.option('source-file-extension-filter', {
			description: 'File extension filter for source files',
			alias: 's',
			default: '.js|.ts',
		})
		.option('target-file-extension-filter', {
			description: 'File extension filter for source files',
			alias: 't',
			default: '.md',
		})
		.option('placeholder-prefix', {
			description: 'Prefix used for the placeholder command in the target files.',
			default: '%%',
		})
		.option('placeholder-suffix', {
			description: 'Suffix used for the placeholder command in the target files.',
			default: '%%',
		})
		.strict().argv;
}
