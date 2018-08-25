
// Import html base plugin, name it plugin, and export it. This will be picked up by ESdoc.
// The base plugin can be extended to customize behaviour and add custom builders.
import HtmlBasePlugin from './HtmlBasePlugin';
import ManualV2DocBuilder from "./Builder/ManualV2DocBuilder";

const Plugin = new HtmlBasePlugin();
Plugin.builders.manualV2 = ((template, data, tags, builderOpts, globalOpts) =>
    new ManualV2DocBuilder(template, data, tags, builderOpts, globalOpts));
module.exports = Plugin;
