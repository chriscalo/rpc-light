const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createService } = require("./client.js");

test("createService() returns an object", async () => {
  const service = createService(function noop() {});
  assert.strictEqual(typeof service, "object");
});

test("descendant properties of a service return functions", async () => {
  const service = createService(function noop() {});
  assert.strictEqual(typeof service.foo, "function");
  assert.strictEqual(typeof service.foo.bar, "function");
  assert.strictEqual(typeof service.foo.bar.baz, "function");
});

test("function call: receives path & args", async () => {
  const service = createService(callHandler);
  await service.foo.bar({ name: "World" }, "!");

  function callHandler(...args) {
    assert.deepStrictEqual(this.path, ["foo", "bar"]);
    const [details, punctuation] = args;
    assert.deepStrictEqual(details, { name: "World" });
    assert.strictEqual(punctuation, "!");
  }
});

test("function call: returns value", async () => {
  const service = createService(callHandler);
  const response = await service.foo.bar({ name: "World" }, "!");
  assert.strictEqual(response, "Hello, World!");

  function callHandler(...args) {
    const [details, punctuation] = args;
    return `Hello, ${details.name}${punctuation}`;
  }
});
