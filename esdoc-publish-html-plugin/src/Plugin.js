
// Import html base plugin, name it plugin, and export it. This will be picked up by ESdoc.
// The base plugin can be extended to customize behaviour and add custom builders.
import HtmlBasePlugin from './HtmlBasePlugin';

const Plugin = new HtmlBasePlugin();

module.exports = Plugin;
