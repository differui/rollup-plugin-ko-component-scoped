var path = require('path');
var parse5 = require('parse5');
var hash  = require('hash-sum');
var compiler = require('ko-component-compiler');
var rollupPluginutils = require('rollup-pluginutils');

const SCOPED_PREFIX = 'scoped!';
const SCOPED_PREFIX_LEN = SCOPED_PREFIX.length;
const STYLE_LANG_MAP = {
    '.css': '',
    '.sass': 'sass',
    '.scss': 'sass',
    '.styl': 'style',
    '.less': 'less'
};
const TEMPLATE_LANG_MAP = {
    '.tpl': '',
    '.html': '',
    '.jade': 'jade'
};

module.exports = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var extensions = options.extensions || Object.keys(STYLE_LANG_MAP).concat(Object.keys(TEMPLATE_LANG_MAP));
    var include = extensions.map(function (ext) { return '**/*' + ext; });
    var filter = rollupPluginutils.createFilter(include, options.exclude || 'node_modules/**');
    var scopedIdRe = new RegExp('^' + SCOPED_PREFIX, 'i');
    var scopedIdMap = {};

    function mockStyleNode(code, lang) {
        var tpl = `<style lang="${lang || ''}" scoped>\n${code}</style>`;

        return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
    }

    function mockTemplateNode(code, lang) {
        var tpl = `<template lang="${lang || ''}" scoped>\n${code}</template>`;

        return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
    }

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

            var ext = path.parse(id).ext.toLowerCase();
            var scopedId = scopedIdMap[id];
            var promise = null;

            if (STYLE_LANG_MAP.hasOwnProperty(ext)) {
                promise = compiler.processStyle(mockStyleNode(code, STYLE_LANG_MAP[ext]), scopedId);
            } else if (TEMPLATE_LANG_MAP.hasOwnProperty(ext)) {
                promise = compiler.processTemplate(mockTemplateNode(code, TEMPLATE_LANG_MAP[ext]), scopedId);
            }

            delete scopedIdMap[id];

            return new Promise(function (resolve) {
                promise.then(function (result) {
                    resolve(result.source);
                });
            });
        }
    };
};
