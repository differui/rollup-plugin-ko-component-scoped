var path = require('path');
var parse5 = require('parse5');
var hash  = require('hash-sum');
const compiler = require('ko-component-compiler');
const rollupPluginutils = require('rollup-pluginutils');

const SCOPED_PREFIX = 'scoped!';
const SCOPED_PREFIX_LEN = SCOPED_PREFIX.length;

const buildInStyleLang = {
    '.css': '',
    '.sass': 'sass',
    '.scss': 'sass',
    '.styl': 'style',
    '.less': 'less'
};
const buildInTemplateLang = {
    '.tpl': '',
    '.html': '',
    '.jade': 'jade'
};

const buildInExtensions = Object.keys(buildInStyleLang).concat(Object.keys(buildInTemplateLang));
const includeExtensions = buildInExtensions.map(function (ext) { return '**/*' + ext; });
const scopedIdRe = new RegExp('^' + SCOPED_PREFIX, 'i');
const scopedIdMap = {};

function has(target, key) {
    return target && target.hasOwnProperty(key);
}

function mockStyleNode(code, lang, scoped) {
    const tpl = `<style lang="${lang || ''}" scoped>\n${code}</style>`;
    return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
}

function mockTemplateNode(code, lang, scoped) {
    const tpl = `<template lang="${lang || ''}" scoped>\n${code}</template>`;
    return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
}

module.exports = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var filter = rollupPluginutils.createFilter(includeExtensions, options.exclude || 'node_modules/**');

    return {
        resolveId: function (importee, importer) {
            var importeeId;

            if (!scopedIdRe.test(importee)) {
                return null;
            }

            importeeId = importee.substr(SCOPED_PREFIX_LEN);
            importeeId = path.resolve(path.parse(importer).dir, importeeId);
            scopedIdMap[importeeId] = hash(importer);

            return importeeId;
        },
        transform: function (code, id) {
            if (!filter(id) || !scopedIdMap[id]) {
                return null;
            }

            const ext = path.parse(id).ext.toLowerCase();
            const scopedId = scopedIdMap[id];
            var promise = null;

            if (has(buildInStyleLang, ext)) {
                promise = compiler.processStyle(mockStyleNode(code, buildInStyleLang[ext]), scopedId, id);
            } else if (has(buildInTemplateLang, ext)) {
                promise = compiler.processTemplate(mockTemplateNode(code, buildInTemplateLang[ext]), scopedId, id);
            }

            delete scopedIdMap[id];

            return new Promise(function (resolve, reject) {
                promise.then(function (result) {
                    resolve({
                        code: `export default ${JSON.stringify(result.source)}`,
                        map: { mappings: '' }
                    });
                });

                promise.catch(reject);
            });
        }
    };
};
