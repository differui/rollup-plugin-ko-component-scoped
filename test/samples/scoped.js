import style1 from 'scoped!./asset/style1.scss';
import template1 from 'scoped!./asset/template1.tpl';

assert.is(/body\[\w{8}\]{color:red}/i.test(style1), true);
assert.is(/<h1 \w{8}="">Hello<\/h1>/i.test(template1), true);
