'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _taffydb = require('taffydb');

var _iceCap = require('ice-cap');

var _iceCap2 = _interopRequireDefault(_iceCap);

var _DocBuilder = require('./Builder/DocBuilder');

var _DocBuilder2 = _interopRequireDefault(_DocBuilder);

var _StaticFileBuilder = require('./Builder/StaticFileBuilder.js');

var _StaticFileBuilder2 = _interopRequireDefault(_StaticFileBuilder);

var _IdentifiersDocBuilder = require('./Builder/IdentifiersDocBuilder.js');

var _IdentifiersDocBuilder2 = _interopRequireDefault(_IdentifiersDocBuilder);

var _IndexDocBuilder = require('./Builder/IndexDocBuilder.js');

var _IndexDocBuilder2 = _interopRequireDefault(_IndexDocBuilder);

var _ClassDocBuilder = require('./Builder/ClassDocBuilder.js');

var _ClassDocBuilder2 = _interopRequireDefault(_ClassDocBuilder);

var _SingleDocBuilder = require('./Builder/SingleDocBuilder.js');

var _SingleDocBuilder2 = _interopRequireDefault(_SingleDocBuilder);

var _FileDocBuilder = require('./Builder/FileDocBuilder.js');

var _FileDocBuilder2 = _interopRequireDefault(_FileDocBuilder);

var _SearchIndexBuilder = require('./Builder/SearchIndexBuilder.js');

var _SearchIndexBuilder2 = _interopRequireDefault(_SearchIndexBuilder);

var _SourceDocBuilder = require('./Builder/SourceDocBuilder.js');

var _SourceDocBuilder2 = _interopRequireDefault(_SourceDocBuilder);

var _TestDocBuilder = require('./Builder/TestDocBuilder.js');

var _TestDocBuilder2 = _interopRequireDefault(_TestDocBuilder);

var _TestFileDocBuilder = require('./Builder/TestFileDocBuilder.js');

var _TestFileDocBuilder2 = _interopRequireDefault(_TestFileDocBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HtmlBasePlugin {

    constructor() {
        this.defaultBuilderSet = ["indetifiersDoc", "indexDoc", "classDoc", "singleDoc", "fileDoc", "staticFile", "searchIndex", "sourceDoc", "testDoc", "testFileDoc"];

        // helper method to remove boilerplate.
        const builder = clazz => (template, data, tags, builderOpts, globalOpts) => new clazz(template, data, tags, builderOpts, globalOpts);

        // Plugins can extend this Plugin and add custom builders.
        this.builders = {
            indetifiersDoc: builder(_IdentifiersDocBuilder2.default),
            indexDoc: builder(_IndexDocBuilder2.default),
            classDoc: builder(_ClassDocBuilder2.default),
            singleDoc: builder(_SingleDocBuilder2.default),
            fileDoc: builder(_FileDocBuilder2.default),
            staticFile: builder(_StaticFileBuilder2.default),
            searchIndex: builder(_SearchIndexBuilder2.default),
            sourceDoc: builder(_SourceDocBuilder2.default),
            testDoc: builder(_TestDocBuilder2.default),
            testFileDoc: builder(_TestFileDocBuilder2.default)
        };
    }

    onHandleDocs(ev) {
        this._docs = ev.data.docs;
    }

    onPublish(ev) {
        this._option = ev.data.option || {};
        this._template = typeof this._option.template === 'string' ? _path2.default.resolve(process.cwd(), this._option.template) : _path2.default.resolve(__dirname, './Builder/template');
        this._exec(this._docs, ev.data.writeFile, ev.data.copyDir, ev.data.readFile);
    }

    _exec(tags, writeFile, copy, readFile) {
        _iceCap2.default.debug = !!this._option.debug;

        const data = (0, _taffydb.taffy)(tags);

        //bad hack: for other plugin uses builder.
        _DocBuilder2.default.createDefaultBuilder = () => {
            return new _DocBuilder2.default(this._template, data, tags, null, null);
        };

        /**
         * Implementation:
         *  https://github.com/esdoc/esdoc/blob/38ad523936d425278cc037c9c0e11338faa2709b/src/ESDoc.js#L340
         * Based on fs-extra:
         *  https://github.com/jprichardson/node-fs-extra
         * @type Object builderUtil
         * @property {function(filePath: string, content: string, option: *)} builderUtil.writeFile
         * @property {function(srcPath: string, destPath: string)} builderUtil.copy
         * @property {function(filePath: string): string} builderUtil.readFile
         */
        const builderUtil = { writeFile, copy, readFile };

        // An object, keys: builder names, values: builder options, if any.
        let builderSet = this.defaultBuilderSet;
        if (this._option.builders) builderSet = Object.keys(this._option.builders);

        const globalOpts = this._option.globalOptions || {};

        // Get the options for all builders, may be null.
        const buildersOptions = this._option.builders || {};

        // Iterate over every configured builder
        // Note: test-only builders will check for a "test" tag themselves, and exit immediately if it cannot be found.
        for (const builderName of builderSet) {
            const builderCreator = this.builders[builderName];
            if (!builderCreator) {
                console.log(`Warning: esdoc-publish-html-plugin does not recognize a builder: ${builderName}.`);
            } else {
                // Get a new instance of the builder.
                const builder = builderCreator(this._template, data, tags, buildersOptions[builderName] || {}, globalOpts);
                // Run the builder, it will build using the util
                builder.exec(builderUtil);
            }
        }
    }
}
exports.default = HtmlBasePlugin;