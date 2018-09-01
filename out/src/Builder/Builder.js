'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _iceCap = require('ice-cap');

var _iceCap2 = _interopRequireDefault(_iceCap);

var _NPMUtil = require('esdoc/out/src/Util/NPMUtil.js');

var _NPMUtil2 = _interopRequireDefault(_NPMUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Builder base class.
 */
/* eslint-disable max-lines */
class Builder {

    /**
     * Create builder base instance.
     * @param {String} template - template absolute path
     * @param {Taffy} data - doc object database.
     * @param tags -
     * @param builderOptions {object} - options/data specific to the builder.
     * @param globalOptions {object} - options/data available to each builder.
     */
    constructor(template, data, tags, builderOptions = {}, globalOptions = {}) {
        this._template = template;
        this._data = data;
        this._tags = tags;
        this._builderOptions = builderOptions;
        this._globalOptions = globalOptions;
    }

    /* eslint-disable no-unused-vars */
    /**
     * execute building output.
     * @abstract
     * @param builderUtil Utility functions to build with.
     * @param builderUtil.writeFile {function(html: string, filePath: string)} - to write files with.
     * @param builderUtil.copy {function(src: string, dest: string)} - to copy directories/files with.
     * @param builderUtil.readFile {function(filePath: string): string} - to read files with.
     */
    exec({ writeFile, copy, readFile }) {}

    /**
     * read html template.
     * @param {string} fileName - template file name.
     * @return {string} html of template.
     * @protected
     */
    _readTemplate(fileName) {
        const filePath = _path2.default.resolve(this._template, `./${fileName}`);
        return _fs2.default.readFileSync(filePath, { encoding: 'utf-8' });
    }

    /**
     * get output html page title.
     * @param {DocObject} doc - target doc object.
     * @returns {string} page title.
     * @protected
     */
    _getTitle(doc = '') {
        const name = doc.name || doc.toString();

        if (name) {
            return `${name}`;
        } else {
            return '';
        }
    }

    /**
     * get base url html page. it is used html base tag.
     * @param {string} fileName - output file path.
     * @returns {string} base url.
     * @protected
     */
    _getBaseUrl(fileName) {
        return '../'.repeat(fileName.split('/').length - 1);
    }

    /**
     * Get the absolute link path for the given destination path. This applies the globally configured rootPath
     * @param dstPath The path of the resource relative to the output folder root.
     * @return {string} The absolute path used in the website.
     * @protected
     */
    _getAbsLink(dstPath) {
        return (this._globalOptions.rootPath || '/') + dstPath;
    }

    /**
     * build common layout output.
     * @return {IceCap} layout output.
     * @protected
     */
    _buildLayoutDoc() {
        const ice = new _iceCap2.default(this._readTemplate('layout.html'), { autoClose: false });

        const packageObj = _NPMUtil2.default.findPackage();
        if (packageObj) {
            ice.text('esdocVersion', `(${packageObj.version})`);
        } else {
            ice.drop('esdocVersion');
        }

        const cssSheets = ['css/style.css', 'css/prettify-tomorrow.css'];
        const headScripts = ['script/prettify/prettify.js', 'script/manual.js'];
        const bodyScripts = ['script/search_index.js', 'script/search.js', 'script/pretty-print.js', 'script/inherited-summary.js', 'script/test-summary.js', 'script/inner-link.js', 'script/patch-for-local.js'];
        ice.loop('layoutCss', cssSheets, (i, sheet, ice) => {
            ice.attr('layoutCss', 'href', this._getAbsLink(sheet));
        });
        ice.loop('layoutHeadScript', headScripts, (i, headScript, ice) => {
            ice.attr('layoutHeadScript', 'src', this._getAbsLink(headScript));
        });
        ice.loop('layoutBodyScript', bodyScripts, (i, bodyScript, ice) => {
            ice.attr('layoutBodyScript', 'src', this._getAbsLink(bodyScript));
        });

        ice.load('pageHeader', this._buildPageHeader());
        ice.load('nav', this._buildNavDoc());
        return ice;
    }

    /**
     * build common page header output.
     * @return {IceCap} layout output for page header.
     * @protected
     */
    _buildPageHeader() {
        const ice = new _iceCap2.default(this._readTemplate('header.html'), { autoClose: false });

        let headerLinks = this._globalOptions.headerLinks;

        // If there is no headerLink configuration available, then use the old behaviour:
        //  insert default headerLinks based on available data.
        if (!headerLinks) {

            headerLinks = [];

            headerLinks.push({
                text: "Home",
                href: "./"
            });

            const existManual = this._tags.find(tag => tag.kind.indexOf('manual') === 0);
            const manualIndex = this._tags.find(tag => tag.kind === 'manualIndex');
            if (!(!existManual || manualIndex && manualIndex.globalIndex)) {
                headerLinks.push({
                    text: "Manual",
                    href: "manual/index.html",
                    cssClass: 'header-manual-link'
                });
            }
            headerLinks.push({
                text: "Reference",
                href: "identifiers.html",
                cssClass: 'header-reference-link'
            });
            headerLinks.push({
                text: "Source",
                href: "source.html",
                cssClass: 'header-source-link'
            });

            const existTest = this._tags.find(tag => tag.kind.indexOf('test') === 0);
            if (existTest) headerLinks.push({
                text: "Test",
                href: "test.html",
                cssClass: 'header-test-link'
            });
        }

        // Insert all headerLinks into the template
        ice.loop('headerLink', headerLinks, (i, link, ice) => {
            ice.text('headerLink', link.text);
            ice.attr('headerLink', 'href', link.href);
            if (link.cssClass) ice.attr('headerLink', 'class', link.cssClass);
        });

        return ice;
    }

    /**
     * build common page side-nave output.
     * @return {IceCap} layout output for side-nav.
     * @protected
     */
    _buildNavDoc() {
        const html = this._readTemplate('nav.html');
        return new _iceCap2.default(html);
        // TODO: maybe fill nav with something by default?
    }
}
exports.default = Builder;