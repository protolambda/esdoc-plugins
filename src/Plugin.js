const fs = require('fs');
const path = require('path');
const assert = require('assert');
const readdir = require('readdir-enhanced');

class Plugin {
    onHandleDocs(ev) {
        this._docs = ev.data.docs;
        this._option = ev.data.option;

        this._exec();
    }

    _exec() {
        const docs = this._generateDocs();
        this._docs.push(...docs);
    }

    _generateDocs() {
        const manual = this._option;
        const results = [];

        if (!manual) return results;

        if (manual.index) {
            results.push({
                kind: 'manualIndex',
                globalIndex: manual.globalIndex,
                content: fs.readFileSync(manual.index).toString(),
                longname: path.resolve(manual.index),
                name: manual.index,
                static: true,
                access: 'public'
            });
        } else {
            results.push({
                kind: 'manualIndex',
                globalIndex: false,
                content: null,
                longname: '', // longname must not be null.
                name: manual.index,
                static: true,
                access: 'public'
            });
        }

        if (manual.manualFolder) {
            // TODO: maybe add a glob and/or regex pattern option to match or ignore files?
            // Scan recursively for files in the manualfolder, do not include directories.
            const files = readdir.sync(manual.manualFolder, {deep: true, filter: (stats) => stats.isFile()});
            for (const manualFile of files) {
                const isDoc = manualFile.endsWith('.md');
                if (isDoc) {
                  results.push({
                    kind: 'manual',
                    longname: path.resolve(manualFile),
                    name: manualFile,
                    content: fs.readFileSync(path.join(manual.manualFolder, manualFile)).toString(),
                    static: true,
                    access: 'public'
                  });
                } else {
                  results.push({
                    kind: 'manualAsset',
                    longname: path.resolve(path.join(manual.manualFolder, manualFile)),
                    name: manualFile,
                    static: true,
                    access: 'public'
                  });
                }
            }
        }

        return results;
    }
}

module.exports = new Plugin();
