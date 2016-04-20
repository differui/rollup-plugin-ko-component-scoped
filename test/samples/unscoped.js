import style1 from 'scoped!./asset/style1.scss';
import template1 from 'scoped!./asset/template1.tpl';
import style2 from './asset/style2.scss';
import template2 from './asset/template2.tpl';

assert.is(style1, 'body[0e309e62]{color:red}');
assert.is(template1, '<h1 0e309e62="">Hello</h1>');
assert.is(style2.replace(/[\n\r\s]/g, ''), 'body{color:red;}');
assert.is(template2.replace(/[\n\r\s]/g, ''), '<h1>World</h1>');
