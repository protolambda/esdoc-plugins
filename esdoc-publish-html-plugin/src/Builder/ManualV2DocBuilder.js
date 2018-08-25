import IceCap from 'ice-cap';
import path from 'path';
import cheerio from 'cheerio';
import DocBuilder from './DocBuilder.js';
import {markdown} from './util.js';


/**
 * Manual Output Builder class.
 * V2 improvements:
 * - no breaking links, structured docs (non-flat)
 *  - link translate repo-relative location to site relative location.
 *  - translate link extension (.md -> .html)
 * - assets can be mixed with the markdown, no need to specify an asset folder
 * - no list of manual files necessary, just specify root folder
 * - removed the manual-badge. It's a bit too much focus on metrics.
 */
export default class ManualV2DocBuilder extends DocBuilder {

  exec({writeFile, copy, readFile}) {

    const manuals = this._tags.filter(tag => tag.kind === 'manual');
    const manualIndex = this._tags.find(tag => tag.kind === 'manualIndex');
    const manualAsset = this._tags.find(tag => tag.kind === 'manualAsset');

    if (manuals.length === 0) return;

    {
        const ice = this._buildLayoutDoc();
        ice.autoDrop = false;
        ice.attr('rootContainer', 'class', ' manual-root');

        const badgeFileNamePatterns = this._builderOptions.badgeFileNamePatterns || defaultManualRequirements;

        const fileName = this._getOutputFileName('index.html');
        const badgeFlag = this._writeBadge(manuals, writeFile, badgeFileNamePatterns);
        ice.load('content', this._buildManualCardIndex(manuals, manualIndex, badgeFlag), IceCap.MODE_WRITE);
        ice.load('nav', this._buildManualNav(manuals), IceCap.MODE_WRITE);
        ice.text('title', this._builderOptions.manualTitle || 'Manual', IceCap.MODE_WRITE);
        ice.drop('baseUrl');
        ice.attr('rootContainer', 'class', 'manual-index');
        writeFile(fileName, ice.html);
    }

    for (const manual of manuals) {
      const ice = this._buildLayoutDoc();
      ice.autoDrop = false;
      const fileName = this._getOutputFileName(manual.name);
      ice.load('content', this._buildManual(manual), IceCap.MODE_WRITE);
      ice.load('nav', this._buildManualNav(manuals), IceCap.MODE_WRITE);
      ice.text('title', manual.title, IceCap.MODE_WRITE);
      writeFile(fileName, ice.html);
    }

    if (manualAsset) {
      const fileName = this._getOutputFileName(manualAsset.name);
        copy(manualAsset.name, fileName);
    }
  }

  /**
   * build manual navigation.
   * @param {Manual[]} manuals - target manuals.
   * @return {IceCap} built navigation
   * @private
   */
  _buildManualNav(manuals) {
    const ice = new IceCap(this._readTemplate('manualIndex.html'));

    ice.loop('manual', manuals, (i, manual, ice)=>{
      const toc = [];
      const fileName = this._getAbsLink(this._getOutputFileName(manual.name));
      const html = markdown(manual.content);
      const $root = cheerio.load(html).root();
      const h1Count = $root.find('h1').length;

      $root.find('h1,h2,h3,h4,h5').each((i, el)=>{
        const $el = cheerio(el);
        const label = $el.text();
        const indent = `indent-${el.tagName.toLowerCase()}`;

        let link = `${fileName}#${$el.attr('id')}`;
        if (el.tagName.toLowerCase() === 'h1' && h1Count === 1) link = fileName;

        toc.push({label, link, indent});
      });

      ice.loop('manualNav', toc, (i, tocItem, ice)=>{
        ice.attr('manualNav', 'class', tocItem.indent);
        ice.attr('manualNav', 'data-link', tocItem.link.split('#')[0]);
        ice.text('link', tocItem.label);
        ice.attr('link', 'href', tocItem.link);
      });
    });

    return ice;
  }

  /**
   * build manual.
   * @param {Object} manual - target manual.
   * @return {IceCap} built manual.
   * @private
   */
  _buildManual(manual) {
    const html = markdown(manual.content);
    const ice = new IceCap(this._readTemplate('manual.html'));
    ice.load('content', html);

    // convert relative src to base url relative src.
    const $root = cheerio.load(ice.html).root();
    $root.find('img').each((i, el)=>{
      const $el = cheerio(el);
      const src = $el.attr('src');
      if (!src) return;
      if (src.match(/^http[s]?:/)) return;
      if (src.charAt(0) === '/') return;
      $el.attr('src', this._getAbsLink(this._getOutputFileName(src)));
    });
    $root.find('a').each((i, el)=>{
      const $el = cheerio(el);
      const href = $el.attr('href');
      if (!href) return;
      if (href.match(/^http[s]?:/)) return;
      if (href.charAt(0) === '/') return;
      if (href.charAt(0) === '#') return;
      $el.attr('href', this._getAbsLink(this._getOutputFileName(href)));
    });

    return $root.html();
  }

  /**
   * built manual card style index.
   * @param {Object[]} manuals - target manual.
   * @param manualIndex
   * @param badgeFlag If
   * @return {IceCap} built index.
   * @private
   */
  _buildManualCardIndex(manuals, manualIndex, badgeFlag) {
    const cards = [];
    for (const manual of manuals) {
      const fileName = this._getAbsLink(this._getManualOutputFileName(manual.name));
      const html = this._buildManual(manual);
      const $root = cheerio.load(html).root();
      const h1Count = $root.find('h1').length;

      $root.find('h1').each((i, el)=>{
        const $el = cheerio(el);
        const label = $el.text();
        const link = h1Count === 1 ? fileName : `${fileName}#${$el.attr('id')}`;
        let card = `<h1>${label}</h1>`;
        const nextAll = $el.nextAll();

        for (let i = 0; i < nextAll.length; i++) {
          const next = nextAll.get(i);
          const tagName = next.tagName.toLowerCase();
          if (tagName === 'h1') return;
          const $next = cheerio(next);
          card += `<${tagName}>${$next.html()}</${tagName}>`;
        }

        cards.push({label, link, card});
      });
    }

    const ice = new IceCap(this._readTemplate('manualCardIndex.html'));
    ice.loop('cards', cards, (i, card, ice)=>{
      ice.attr('link', 'href', card.link);
      ice.load('card', card.card);
    });

    if (manualIndex && manualIndex.content) {
      const userIndex = markdown(manualIndex.content);
      ice.load('manualUserIndex', userIndex);
    } else {
      ice.drop('manualUserIndex', true);
    }

    // Remove old badge from v1.
    ice.drop('manualBadge', true);

    return ice;
  }

  /**
   * get manual file output name.
   * @param {string} filePath - target manual file path.
   * @returns {string} file name.
   * @protected
   */
  _getOutputFileName(filePath) {
    const parsed = path.parse(filePath);
    let pathRemainder = parsed.dir;
    // Strip off path prefix
    const prefix = this._builderOptions.inputPrefix || './manual/';
    if (pathRemainder.startsWith(prefix)) {
      pathRemainder = pathRemainder.substring(prefix.length)
    }
    const extension = parsed.ext === '.md' ? '.html' : parsed.ext;
    const dstFolder = this._builderOptions.outputPath || 'manual';
    return `${dstFolder}/${pathRemainder}/${parsed.name}/${extension}`;
  }

}
