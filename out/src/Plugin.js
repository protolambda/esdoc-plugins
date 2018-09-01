"use strict";

var _HtmlBasePlugin = require("./HtmlBasePlugin");

var _HtmlBasePlugin2 = _interopRequireDefault(_HtmlBasePlugin);

var _ManualV2DocBuilder = require("./Builder/ManualV2DocBuilder");

var _ManualV2DocBuilder2 = _interopRequireDefault(_ManualV2DocBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import html base plugin, name it plugin, and export it. This will be picked up by ESdoc.
// The base plugin can be extended to customize behaviour and add custom builders.
const Plugin = new _HtmlBasePlugin2.default();
Plugin.builders.manualV2 = (template, data, tags, builderOpts, globalOpts) => new _ManualV2DocBuilder2.default(template, data, tags, builderOpts, globalOpts);
module.exports = Plugin;