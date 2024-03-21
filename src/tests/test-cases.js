// OK
module.exports = (x) => {
  return x;
};
exports.foo = (x) => x;

function f() {}

exports.f = f;

// Not OK
const foo = (x) => {
  return x;
};
const bar = (x) => x;

// OK
exports.other = [foo, bar];
