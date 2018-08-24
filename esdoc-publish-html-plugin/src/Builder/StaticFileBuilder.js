import path from 'path';
import DocBuilder from './DocBuilder.js';

/**
 * Static file output builder class.
 */
export default class StaticFileBuilder extends DocBuilder {
  exec({writeFile, copy}) {
    copy(path.resolve(this._template, 'css'), './css');
    copy(path.resolve(this._template, 'script'), './script');
    copy(path.resolve(this._template, 'image'), './image');
  }
}
