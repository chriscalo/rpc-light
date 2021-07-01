const test = require("ava");
const { createService } = require("./client.js");

test("createService() returns an object", async t => {
  const service = createService(function noop() {});
  t.is(typeof service, "object");
});

test("descendant properties of a service return functions", async t => {
  const service = createService(function noop() {});
  t.is(typeof service.foo, "function");
  t.is(typeof service.foo.bar, "function");
  t.is(typeof service.foo.bar.baz, "function");
});

test("function call: receives path & args", async t => {
  const service = createService(callHandler);
  await service.foo.bar({ name: "World" }, "!");
  
  function callHandler(...args) {
    t.deepEqual(this.path, ["foo", "bar"]);
    const [ details, punctuation ] = args;
    t.deepEqual(details, { name: "World" });
    t.deepEqual(punctuation, "!");
  }
});

test("function call: returns value", async t => {
  const service = createService(callHandler);
  const response = await service.foo.bar({ name: "World" }, "!");
  t.is(response, "Hello, World!");
  
  function callHandler(...args) {
    const [ details, punctuation ] = args;
    return `Hello, ${details.name}${punctuation}`;
  }
});
