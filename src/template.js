import { parseFragment } from 'parse5';

export function mockStyleNode(code, lang, scoped) {
    const tpl = `<style lang="${lang || ''}" scoped>\n${code}</style>`;

    return parseFragment(tpl, { locationInfo: true }).childNodes[0];
};

export function mockTemplateNode(code, lang, scoped) {
    const tpl = `<template lang="${lang || ''}" scoped>\n${code}</template>`;

    return parseFragment(tpl, { locationInfo: true }).childNodes[0];
};