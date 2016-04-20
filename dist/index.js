'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs$1 = require('fs');
var hash = _interopDefault(require('hash-sum'));
var path = require('path');
var koComponentCompiler = require('ko-component-compiler');
var parse5 = require('parse5');

function has(target, key) {
    return target && target.hasOwnProperty(key);
};

function mockStyleNode(code, lang, scoped) {
    const tpl = `<style lang="${ lang || '' }" scoped>\n${ code }</style>`;

    return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
};

function mockTemplateNode(code, lang, scoped) {
    const tpl = `<template lang="${ lang || '' }" scoped>\n${ code }</template>`;

    return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
};

const style = {
    '.css': '',
    '.sass': 'sass',
    '.scss': 'sass',
    '.styl': 'style',
    '.less': 'less'
};

const template = {
    '.tpl': '',
    '.html': '',
    '.jade': 'jade'
};

const SCOPED_PREFIX = 'scoped!';
const SCOPED_EXTENSION = '.__scoped__';

const scopePrefixLen = SCOPED_PREFIX.length;
const scopedIdRe = new RegExp('^' + SCOPED_PREFIX, 'i');
const scopedCodeMap = {};

extensions.push(SCOPED_EXTENSION);

var index = (options => {
    return {
        resolveId(importee, importer) {
            if (!scopedIdRe.test(importee)) {
                return null;
            }

            let importerHashId = hash(importer);
            let mockImporteeId = `${ importerHashId }${ SCOPED_EXTENSION }`;
            let realImporteeId = path.resolve(path.parse(importer).dir, importee.substr(scopePrefixLen));

            scopedCodeMap[mockImporteeId] = {
                id: realImporteeId,
                hash: importerHashId
            };

            return mockImporteeId;
        },

        load(id) {
            if (has(scopedCodeMap, id)) {
                return fs.readFileSync(scopedCodeMap.id, 'utf-8');
            }
        },

        transform(code, id) {
            if (!has(scopedCodeMap, id)) {
                return null;
            }

            const ext = path.parse(scopedCodeMap[id].id).ext.toLowerCase();
            const hashId = scopedCodeMap[id].hash;

            let promise;

            if (has(style, ext)) {
                promise = koComponentCompiler.processStyle(mockStyleNode(code, style[ext]), hashId, id);
            } else if (has(template, ext)) {
                promise = koComponentCompiler.processTemplate(mockTemplateNode(code, template[ext]), hashId, id);
            }

            delete scopedCodeMap[id];

            return new Promise((resolve, reject) => {
                promise.then(result => {
                    resolve({
                        code: `export default ${ JSON.stringify(result.source) };`,
                        map: { mappings: '' }
                    });
                });

                promise.catch(reject);
            });
        }
    };
})

module.exports = index;
//# sourceMappingURL=index.js.map