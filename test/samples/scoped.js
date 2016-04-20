import style1 from 'scoped!./asset/style1.scss';
import template1 from 'scoped!./asset/template1.tpl';

assert.is(style1, 'body[2c1dc44a]{color:red}');
assert.is(template1, '<h1 2c1dc44a="">Hello</h1>');
