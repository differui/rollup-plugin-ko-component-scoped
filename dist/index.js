'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var hash = _interopDefault(require('hash-sum'));
var path = require('path');
var koComponentCompiler = require('ko-component-compiler');
var parse5 = require('parse5');

function has(target, key) {
    return target && target.hasOwnProperty(key);
};

function mockStyleNode(code, lang, scoped) {
    var tpl = '<style lang="' + (lang || '') + '" scoped>\n' + code + '</style>';

    return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
};

function mockTemplateNode(code, lang, scoped) {
    var tpl = '<template lang="' + (lang || '') + '" scoped>\n' + code + '</template>';

    return parse5.parseFragment(tpl, { locationInfo: true }).childNodes[0];
};

var style = {
    '.css': '',
    '.sass': 'sass',
    '.scss': 'sass',
    '.styl': 'style',
    '.less': 'less'
};

var template = {
    '.tpl': '',
    '.html': '',
    '.jade': 'jade'
};

var SCOPED_PREFIX = 'scoped!';
var SCOPED_EXTENSION = '.__scoped__';

var scopePrefixLen = SCOPED_PREFIX.length;
var scopedIdRe = new RegExp('^' + SCOPED_PREFIX, 'i');
var scopedCodeMap = {};

var index = (function (options) {
    return {
        resolveId: function resolveId(importee, importer) {
            if (!scopedIdRe.test(importee)) {
                return null;
            }

            var realImporteeId = path.resolve(path.parse(importer).dir, importee.substr(scopePrefixLen));
            var mockImporteeId = '' + importee + importer + SCOPED_EXTENSION;

            scopedCodeMap[mockImporteeId] = {
                path: realImporteeId,
                hash: hash(importer)
            };

            return mockImporteeId;
        },
        load: function load(id) {
            if (has(scopedCodeMap, id)) {
                return fs.readFileSync(scopedCodeMap[id].path, 'utf-8');
            }
        },
        transform: function transform(code, id) {
            if (!has(scopedCodeMap, id)) {
                return null;
            }

            var hashId = scopedCodeMap[id].hash;
            var filePath = scopedCodeMap[id].path;
            var ext = path.parse(filePath).ext.toLowerCase();

            var promise = void 0;

            if (has(style, ext)) {
                promise = koComponentCompiler.processStyle(mockStyleNode(code, style[ext]), hashId, filePath);
            } else if (has(template, ext)) {
                promise = koComponentCompiler.processTemplate(mockTemplateNode(code, template[ext]), hashId, filePath);
            }

            delete scopedCodeMap[id];

            return new Promise(function (resolve, reject) {
                promise.then(function (result) {
                    resolve({
                        code: 'export default ' + JSON.stringify(result.source) + ';',
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