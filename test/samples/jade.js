import template3 from 'scoped!./asset/template3.jade';

assert.is(/<h1 _s-\w{8}="">Hello<\/h1>/i.test(template3), true);
