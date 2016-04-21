import style1 from 'scoped!./asset/style1.scss';
import template1 from 'scoped!./asset/template1.tpl';
import style2 from './asset/style2.scss';
import template2 from './asset/template2.tpl';

assert.is(/body\[_s-\w{8}\]{color:red}/i.test(style1), true);
assert.is(/<h1 _s-\w{8}="">Hello<\/h1>/i.test(template1), true);
assert.is(style2.replace(/[\n\r\s]/g, ''), 'body{color:red;}');
assert.is(template2.replace(/[\n\r\s]/g, ''), '<h1>Hello</h1>');
