import style3 from 'scoped!./asset/style3.scss';

assert.is(/body\[\w{8}\]{color:red}/i.test(style3), true);
