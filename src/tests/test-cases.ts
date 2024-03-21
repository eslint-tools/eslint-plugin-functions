// OK
export default () => {};

export function f() {}

export class Foo {
  constructor() {}

  foo() {
    return 1;
  }

  async bar() {
    return await Promise.resolve(1);
  }

  get baz() {
    return 5;
  }

  set baz(v: number) {
    [v];
  }
}

export const obj = {
  get baz() {
    return 5;
  },
  set baz(v: number) {
    [v];
  },
};

// Not OK
export const foo = () => {};
export const bar = (x: unknown) => x;
export const baz = <T>(x: T): T => x;

export const obj2 = {
  baz: function () {
    return 5;
  },
};

export class Bar {
  x: () => void = function () {};
}
