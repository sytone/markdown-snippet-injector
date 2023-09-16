/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import * as fs from 'node:fs';
import {ProgramOptions} from './args';
import {FormatSpec, getFormatSpec} from './format-specs';
import {snippetEndPrefix, snippetName, snippetStartPrefix, snippetToken} from './snippet';

export type FileSystem = {
  readFileSync: (path: string, encoding: BufferEncoding) => string;

};

export class NodeFileSystem implements FileSystem {
  public readFileSync(path: string, encoding: BufferEncoding): string {
    return fs.readFileSync(path, encoding);
  }
}

export class InMemoryFileSystem implements FileSystem {
  constructor(
    public readonly fileContents: string,
  ) {
    this.fileContents = fileContents;
  }

  public readFileSync(path: string, encoding: BufferEncoding): string {
    return this.fileContents;
  }
}

export class SourceFile {
  public spec: FormatSpec;
  public fileContents: string;

  constructor(
    public readonly programOptions: ProgramOptions,
    public readonly fileExtension: string,
    public readonly file: string,
    public readonly fs: FileSystem = new NodeFileSystem(),
  ) {
    this.spec = getFormatSpec(fileExtension);
    this.fileContents = this.fs.readFileSync(file, 'utf8');
  }

  // {comment} >> id='id' options='key=value&key=value' {/comment}
  // {comment} >> the-name-of-the-snippet {/comment}
  public get openRegExp(): RegExp {
    return new RegExp(this.spec.commentStart + snippetStartPrefix.source + snippetToken.source + this.spec.commentEnd, 'g');
  }

  // {comment} >> the-name-of-the-snippet {/comment}
  public get openReplacerRegExp(): RegExp {
    return new RegExp(this.spec.commentStart + snippetStartPrefix.source + snippetToken.source + this.spec.commentEnd, 'g');
  }

  // {comment} << the-name-of-the-snippet {/comment}
  public get closeReplacerRegExp(): RegExp {
    return new RegExp(this.spec.commentStart + snippetEndPrefix.source + snippetName.source + this.spec.commentEnd, 'g');
  }

  // {comment} << the-name-of-the-snippet {/comment}
  public getClosingEofRegExp(id: string): RegExp {
    return new RegExp(this.spec.commentStart + snippetEndPrefix.source + id + '$', 'm');
  }

  // {comment} << the-name-of-the-snippet([^-]){/comment}
  public getClosingRegExp(id: string): RegExp {
    return new RegExp(this.spec.commentStart + snippetEndPrefix.source + id + '([^-])' + this.spec.commentEnd);
  }
}
