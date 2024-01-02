/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/extensions */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {log} from './log';
import {jsSpec, cssSpec, xmlSpec, htmlSpec, type FormatSpec, getFormatSpec} from './format-specs';
import {type ProgramOptions} from './args';
import {Snippet, snippetToken, whitespace} from './snippet';
import {SourceFile} from './source-file';

const ws = '[\\t ]*';

type HashTable<T> = Record<string, T>;

export class SnippetInjector {
  public storedSnippets: Map<string, Snippet> = new Map<string, Snippet>();
  public snippetTitles = '';
  public sourceFileExtensionFilter = '';
  public targetFileExtensionFilter = '';
  public toWrap = true;
  public useOsEol = false;
  public endOfLineValue = '/n';

  public placeholderPrefix = '%%';
  public placeholderSuffix = '%%';

  private _storedSourceTypes: string[] = [];
  private _storedTargetTypes: string[] = [];
  private _storedSourceTitles: HashTable<string> = {};

  constructor(readonly programOptions: ProgramOptions) {
    this.programOptions = programOptions;
    this.sourceFileExtensionFilter = programOptions.sourceFileExtensionFilter;
    this.targetFileExtensionFilter = programOptions.targetFileExtensionFilter;
    this.placeholderPrefix = programOptions.placeholderPrefix;
    this.placeholderSuffix = programOptions.placeholderSuffix;
    this.snippetTitles = programOptions.snippetTitles;
    this.toWrap = programOptions.wrap;
    this.useOsEol = programOptions.useOsEol;

    if (this.useOsEol) {
      this.endOfLineValue = os.EOL;
    }
  }

  /*
  // >> id='snippetinjector-process'
  Loads the code snippets from the source-tree at the specified location.
  @param root The root of the source-tree to load the snippets from.
  // << snippetinjector-process
  */
  public process(root: string) {
    const lStat = fs.lstatSync(root);

    this.init();

    for (const storedSourceType of this._storedSourceTypes) {
      if (lStat.isDirectory()) {
        this.processDirectory(root, storedSourceType);
      } else if (lStat.isFile()) {
        this.processFile(root, storedSourceType);
      }
    }
  }

  /*
  // >> id='snippetinjector-injectSnippets' options='file=injectSnippets.md'
  Loads the code snippets from the source-tree at the specified location.
  @param root The root of the source-tree to load the snippets from.
  // << snippetinjector-injectSnippets
  */
  public injectSnippets(docsRoot: string) {
    if (this.storedSnippets.size > 0) {
      // Look for snippets that have an explicit file option and create
      // the file with the snippet content. Adding header and footer content
      // if specified or found.
      for (const [_, value] of this.storedSnippets) {
        const {file, header, footer, processedValue} = value;

        /*
        // >> id='snippet-injector-implicit-header-footer' options='file=implicit-header-footer/injectSnippets.md'
        title: Snippet Injector - Implicit Header Footer
        ---

        This section looks for the `_header.md` and `_footer.md` files in the same director as the file
        to be created then the root of the docs directory. IF specified the header should be
        relative to the root of the docs-root value.

        // << snippet-injector-implicit-header-footer
        */
        const headerContent = this.getFileContentWithImplicitLookup(header, docsRoot, file, '_header.md');
        const footerContent = this.getFileContentWithImplicitLookup(footer, docsRoot, file, '_footer.md');

        if (file) {
          const filePath = `${docsRoot}/${file}`;
          this.ensureDirectoryExistence(filePath);
          const dateTime = new Date().toDateString();
          const fileContents = `${headerContent}${processedValue ?? ''}${footerContent}\n\n${this.placeholderPrefix}This file is auto-generated. Do not edit. Generated at: ${dateTime}${this.placeholderSuffix}`;
          fs.writeFileSync(filePath, fileContents, 'utf8');
        }
      }

      const lStat = fs.lstatSync(docsRoot);
      for (const storedTargetType of this._storedTargetTypes) {
        if (lStat.isDirectory()) {
          this.processDocsDirectory(docsRoot, storedTargetType);
        } else if (lStat.isFile()) {
          this.processDocsFile(docsRoot, storedTargetType);
        }
      }
    }
  }

  /**
   * Returns the content of a file with implicit lookup in the specified directories.
   * @param filePathRelativeToDocsRoot - The path to the file relative to the docs root directory.
   * @param docsRoot - The root directory of the documentation.
   * @param file - The path to the current file.
   * @param implicitFileName - The name of the file to look for implicitly.
   * @returns The content of the file.
   */
  public getFileContentWithImplicitLookup(filePathRelativeToDocsRoot: string, docsRoot: string, file: string, implicitFileName: string) {
    log.debug('filePathRelativeToDocsRoot', filePathRelativeToDocsRoot);
    log.debug('docsRoot', docsRoot);
    log.debug('file', file);
    log.debug('implicitFileName', implicitFileName);

    let filePath = '';
    if (filePathRelativeToDocsRoot && fs.existsSync(`${docsRoot}/${filePathRelativeToDocsRoot}`)) {
      filePath = `${docsRoot}/${filePathRelativeToDocsRoot}`;
    } else if (fs.existsSync(`${path.dirname(`${docsRoot}/${file}`)}/${implicitFileName}`)) {
      filePath = `${path.dirname(`${docsRoot}/${file}`)}/${implicitFileName}`;
    } else if (fs.existsSync(`${docsRoot}/${implicitFileName}`)) {
      filePath = `${docsRoot}/${implicitFileName}`;
    }

    log.info('Getting content for', filePath);

    return filePath ? fs.readFileSync(filePath, 'utf8') : '';
  }

  protected ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }

    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }

  /*
  // >> id='snippetinjector-hasSnippet' options='file=snippetinjector/hassnippet.md&header=snippetinjector/test-header.md&footer=snippetinjector/test-footer.md'
  title: Snippet Injector - Has Snippet
  ---
  Loads the code snippets from the source-tree at the specified location.
  @param root The root of the source-tree to load the snippets from.
  // << snippetinjector-hasSnippet
  */
  protected hasSnippet(snippet: Snippet): boolean {
    return this.storedSnippets.has(snippet.fileExtension + snippet.id);
  }

  protected addSnippet(snippet: Snippet): void {
    this.storedSnippets.set(snippet.fileExtension + snippet.id, snippet);
  }

  private init() {
    log.info('Source File Extension Filter', this.sourceFileExtensionFilter);

    this._storedSourceTypes = this.sourceFileExtensionFilter.split('|');
    this._storedTargetTypes = this.targetFileExtensionFilter.split('|');

    this._storedSourceTitles = {};
    const currentTitles = this.snippetTitles.split('|');
    for (let i = 0; i < this._storedSourceTypes.length; i++) {
      this._storedSourceTitles[this._storedSourceTypes[i]] = (currentTitles[i] || '');
    }

    log.info('Stored Source Titles', this._storedSourceTitles);
  }

  private processDirectory(directory: string, extensionFilter: string) {
    const files = fs.readdirSync(directory);
    for (const currentFile of files) {
      const fullPath = path.normalize(directory + '/' + currentFile);
      const fileStat = fs.lstatSync(fullPath);
      if (fileStat.isDirectory()) {
        this.processDirectory(directory + '/' + currentFile, extensionFilter);
      } else if (fileStat.isFile() && path.extname(fullPath) === extensionFilter) {
        this.processFile(fullPath, extensionFilter);
      }
    }
  }

  private processFile(directory: string, extensionFilter: string) {
    log.info('Processing source file:', directory, extensionFilter);

    const sourceFile = new SourceFile(this.programOptions, extensionFilter, directory);

    // Get the format spec based off the file extension.
    const spec: FormatSpec = sourceFile.spec;

    // Create all the regular expressions needed to find the snippets.
    const regExpOpen = sourceFile.openRegExp;

    const fileContents = sourceFile.fileContents;

    // Find all the snippet matches in the file.
    let match = regExpOpen.exec(fileContents);

    if (match) {
      log.info(`Found ${match?.length} snippet matches`);
    }

    while (match) {
      const matchIndex = match.index;
      const matchLength = match[0].length;
      log.info(`Processing ${match[1]}`);

      const snippetEntry = new Snippet(this.programOptions, match[0], extensionFilter, sourceFile, spec);

      // If the snippet is already in the list, skip it.
      if (this.hasSnippet(snippetEntry)) {
        match = regExpOpen.exec(fileContents);
        continue;
      }

      // Find the closing tag for the snippet.
      // {comment} << the-name-of-the-snippet {/comment}
      const regExpCurrentClosingEOF = sourceFile.getClosingEofRegExp(snippetEntry.id);

      const closingTagMatchEOF = regExpCurrentClosingEOF.exec(fileContents);

      let indexOfClosingTag;

      if (closingTagMatchEOF) {
        indexOfClosingTag = closingTagMatchEOF.index;
      } else {
        // {comment} << the-name-of-the-snippet([^-]){/comment}
        const regExpCurrentClosing = sourceFile.getClosingRegExp(snippetEntry.id);
        const closingTagMatch = regExpCurrentClosing.exec(fileContents);
        if (!closingTagMatch) {
          throw new Error('Closing tag not found for: ' + snippetEntry.id);
        }

        indexOfClosingTag = closingTagMatch.index;
      }

      snippetEntry.value = fileContents.slice(matchIndex + matchLength, indexOfClosingTag);
      log.debug('Snippet value: ' + snippetEntry.value);

      log.info('Snippet resolved: ' + snippetEntry.id);
      this.addSnippet(snippetEntry);
      match = regExpOpen.exec(fileContents);
    }
  }

  private replaceWrappedSnippetsWithCorrespondingTags(fileContent: string): string {
    let content = '';
    const regex = new RegExp(`${this.placeholderPrefix}${whitespace.source}*snippet${whitespace.source}+${snippetToken.source}[\\S\\s]*?${this.placeholderSuffix}[\\S\\s]*?${this.placeholderPrefix}\\/snippet${this.placeholderSuffix}`, 'g');
    log.debug('replaceWrappedSnippetsWithCorrespondingTags:', regex);

    content = fileContent.replace(regex, `${this.placeholderPrefix}snippet id='$1' options='$2'/${this.placeholderSuffix}`);
    log.debug('replaceWrappedSnippetsWithCorrespondingTags:', content);

    return content;
  }

  private wrapSnippetWithComments(snippetTag: string, snippetId: string, snippetOptions: string): string {
    let wrappedSnippetTag = '';
    wrappedSnippetTag += `${this.placeholderPrefix}snippet id='${snippetId}' options='${snippetOptions}'${this.placeholderSuffix}\n`;
    wrappedSnippetTag += snippetTag;
    wrappedSnippetTag += `\n${this.placeholderPrefix}/snippet${this.placeholderSuffix}`;
    return wrappedSnippetTag;
  }

  private processDocsDirectory(directory: string, extensionFilter: string) {
    const files = fs.readdirSync(directory);
    for (const currentFile of files) {
      const fullPath = path.normalize(directory + '/' + currentFile);
      const fileStat = fs.lstatSync(fullPath);
      if (fileStat.isDirectory()) {
        this.processDocsDirectory(fullPath, extensionFilter);
      } else if (fileStat.isFile() && path.extname(fullPath) === extensionFilter) {
        this.processDocsFile(fullPath, extensionFilter);
      }
    }
  }

  // >> id='ts-snippet-with-hidden-section' options=''
  private div(a: number, b: number) {
    // >> (hide)
    console.log('You should not see this!');
    // << (hide)
    return a / b;
  }
  // << ts-snippet-with-hidden-section

  /*
  // >> id='snippetinjector-processDocsFile' options=''
  Handles the injection into the markdown files.
  // << snippetinjector-processDocsFile
  */

  private processDocsFile(directory: string, extensionFilter: string) {
    log.info('Processing docs file: ' + directory);
    let fileContents = fs.readFileSync(directory, 'utf8');

    fileContents = this.replaceWrappedSnippetsWithCorrespondingTags(fileContents);

    const regex = new RegExp(`${this.placeholderPrefix}${whitespace.source}*snippet${whitespace.source}+${snippetToken.source}[\\s]*/[\\s]*${this.placeholderSuffix}`, 'g');
    log.debug('processDocsFile:', regex);

    let match = regex.exec(fileContents);
    log.debug('processDocsFile:', match);

    let hadMatches = false;
    while (match) {
      const matchedString = match[0];
      const placeholderId = match[1];
      const placeholderOptions = match[2];
      let finalSnippet = '';
      log.info('Placeholder resolved: ' + matchedString);

      for (const storedSourceType of this._storedSourceTypes) {
        const currentSourceType = storedSourceType;
        const snippetForSourceType = this.storedSnippets.get(currentSourceType + placeholderId);

        if (snippetForSourceType !== undefined) {
          log.debug('Snippet Token', snippetForSourceType.token);
          log.debug('Snippet Original Value', snippetForSourceType.originalValue);

          hadMatches = true;
          if (finalSnippet.length > 0) {
            finalSnippet += this.endOfLineValue;
          }

          if (placeholderOptions.includes('nocodeblock')) {
            finalSnippet += snippetForSourceType.processedValue;
          } else {
            const currentSnippetTitle = this._storedSourceTitles[currentSourceType] || '';
            finalSnippet += '```' + currentSnippetTitle + this.endOfLineValue + snippetForSourceType.processedValue + this.endOfLineValue + '```';
          }

          log.debug('Final Snippet:', finalSnippet);
        }
      }

      if (finalSnippet.length > 0) {
        /*
            Check whether it should be wrapped or replaced.
            If the tag is closed it will be replaced by the snippet.

            From:
            <snippet id="snippetId"/>
            To:
            {your_snippet}

            If there is open and closed tag the snippet will be wrapped around snippet tag.

            From:
            <snippet id="snippetId"></snippet>
            To:
            <snippet id="snippetId">
            {your_snippet}
            </snippet>

        */
        if (this.toWrap) {
          const temporaryMatchedString = this.wrapSnippetWithComments(matchedString, placeholderId, placeholderOptions);
          fileContents = fileContents.replace(matchedString, temporaryMatchedString);
        }

        fileContents = fileContents.replace(matchedString, finalSnippet);
        log.info('Token replaced: ' + matchedString);
      }

      match = regex.exec(fileContents);
    }

    if (hadMatches) {
      fs.writeFileSync(directory, fileContents, 'utf8');
    }
  }
}
