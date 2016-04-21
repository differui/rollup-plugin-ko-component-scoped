import { readFileSync } from 'fs';
import hash from 'hash-sum';
import { resolve, parse } from 'path';
import { processStyle, processTemplate } from 'ko-component-compiler';
import { has } from './util';
import { mockStyleNode, mockTemplateNode } from './template';
import { style as styleLang, template as templateLang } from './lang';

const SCOPED_IMPORTEE_PREFIX = 'scoped!';
const SCOPED_HASH_ID_PREFIX = '_s-';
const SCOPED_EXTENSION = '.__scoped__';

const scopePrefixLen = SCOPED_IMPORTEE_PREFIX.length;
const scopedIdRe = new RegExp('^' + SCOPED_IMPORTEE_PREFIX, 'i');
const scopedCodeMap = {};

export default (options) => {
    return {
        resolveId(importee, importer) {
            if (!scopedIdRe.test(importee)) {
                return null;
            }

            let realImporteeId = resolve(parse(importer).dir, importee.substr(scopePrefixLen));
            let mockImporteeId = `${importee}${importer}${SCOPED_EXTENSION}`;

            scopedCodeMap[mockImporteeId] = {
                path: realImporteeId,
                hash: `${SCOPED_HASH_ID_PREFIX}${hash(importer)}`
            };

            return mockImporteeId;
        },

        load(id) {
            if (has(scopedCodeMap, id)) {
                return readFileSync(scopedCodeMap[id].path, 'utf-8');
            }
        },

        transform(code, id) {
            if (!has(scopedCodeMap, id)) {
                return null;
            }

            const hashId = scopedCodeMap[id].hash;
            const filePath = scopedCodeMap[id].path;
            const ext = parse(filePath).ext.toLowerCase();

            let promise;

            if (has(styleLang, ext)) {
                promise = processStyle(mockStyleNode(code, styleLang[ext]), hashId, filePath);
            } else if (has(templateLang, ext)) {
                promise = processTemplate(mockTemplateNode(code, templateLang[ext]), hashId, filePath);
            }

            delete scopedCodeMap[id];

            return new Promise((resolve, reject) => {
                promise.then((result) => {
                    resolve({
                        code: `export default ${JSON.stringify(result.source)};`,
                        map: { mappings: '' }
                    });
                });

                promise.catch(reject);
            });
        }
    };
};
