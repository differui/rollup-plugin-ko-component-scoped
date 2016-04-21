'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var hash = _interopDefault(require('hash-sum'));
var path = require('path');
var compiler = require('ko-component-compiler');
var compiler__default = _interopDefault(compiler);
var parse5 = require('parse5');

function has(target, key) {
    return target && target.hasOwnProperty(key);
};

function eachArray(target, callback, context) {
    for (var i = 0, len = target.length; i < len; i += 1) {
        var result = callback.call(context || null, target[i], i, target);

        if (result === false) {
            return;
        }
    }
};

function eachDict(target, callback, context) {
    var keys = target ? Object.keys(target) : [];

    eachArray(keys, function (key) {
        return callback.call(context || null, key, target[key], target);
    });
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

var SCOPED_IMPORTEE_PREFIX = 'scoped!';
var SCOPED_HASH_ID_PREFIX = '_s-';
var SCOPED_EXTENSION = '.__scoped__';

var scopePrefixLen = SCOPED_IMPORTEE_PREFIX.length;
var scopedIdRe = new RegExp('^' + SCOPED_IMPORTEE_PREFIX, 'i');
var scopedCodeMap = {};

var index = (function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


    // apply compiler config
    eachDict(options, function (key, value) {
        compiler__default.config(key, value);
    });

    return {
        resolveId: function resolveId(importee, importer) {
            if (!scopedIdRe.test(importee)) {
                return null;
            }

            var realImporteeId = path.resolve(path.parse(importer).dir, importee.substr(scopePrefixLen));
            var mockImporteeId = '' + importee + importer + SCOPED_EXTENSION;

            scopedCodeMap[mockImporteeId] = {
                path: realImporteeId,
                hash: '' + SCOPED_HASH_ID_PREFIX + hash(importer)
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
                promise = compiler.processStyle(mockStyleNode(code, style[ext]), hashId, filePath);
            } else if (has(template, ext)) {
                promise = compiler.processTemplate(mockTemplateNode(code, template[ext]), hashId, filePath);
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