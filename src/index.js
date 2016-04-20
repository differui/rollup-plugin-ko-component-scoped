import { readFileSync } from 'fs';
import { resolve, parse } from 'path';
import hash from 'hash-sum';
import { processStyle, processTemplate } from 'ko-component-compiler';
import { has } from './util';
import { mockStyleNode, mockTemplateNode } from './template';
import { style as styleLang, template as templateLang } from './lang';

const SCOPED_PREFIX = 'scoped!';
const SCOPED_EXTENSION = '.__scoped__';

const scopePrefixLen = SCOPED_PREFIX.length;
const scopedIdRe = new RegExp('^' + SCOPED_PREFIX, 'i');
const scopedCodeMap = {};

extensions.push(SCOPED_EXTENSION);

export default (options) => {
    return {
        resolveId(importee, importer) {
            if (!scopedIdRe.test(importee)) {
                return null;
            }

            let importerHashId = hash(importer);
            let mockImporteeId = `${importerHashId}${SCOPED_EXTENSION}`;
            let realImporteeId = resolve(parse(importer).dir, importee.substr(scopePrefixLen));

            scopedCodeMap[mockImporteeId] = {
                id: realImporteeId,
                hash: importerHashId
            };

            return mockImporteeId;
        }
        load(id) {
            if (has(scopedCodeMap, id)) {
                return fs.readFileSync(sourceCodeMap.id, 'utf-8');
            }
        }
        transform(code, id) {
            if (!has(scopedCodeMap, id)) {
                return null;
            }

            const ext = parse(scopedCodeMap[id].id).ext.toLowerCase();
            const hashId = scopedCodeMap[id].hash;

            let promise;

            if (has(styleLang, ext)) {
                promise = processStyle(mockStyleNode(code, styleLang[ext]), hashId, id);
            } else if (has(templateLang, ext)) {
                promise = processTemplate(mockTemplateNode(code, templateLang[ext]), hashId, id);
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
