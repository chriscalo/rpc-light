const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { rpcService } = require("./server.js");

test("exports a function", () => {
  assert.strictEqual(typeof rpcService, "function");
});

test("calling rpcService returns an express handler function", () => {
  const handler = rpcService({
    foo() {},
  });
  assert.strictEqual(typeof handler, "function");
});

test("handler calls method with args, returns result as JSON", async () => {
  let greetCallCount = 0;

  const methods = {
    greet(name, exclaim = false) {
      greetCallCount++;
      assert.strictEqual(name, "World");
      const punctuation = exclaim ? "!" : ".";
      const message = `Hello, ${name}` + punctuation;
      return {
        message,
      };
    },
  };

  const handler = rpcService(methods);
  const res = await request(handler).post("/").send({
    path: ["greet"],
    args: ["World", true],
  });

  assert.strictEqual(greetCallCount, 1);
  assert.ok(res.ok);
  assert.strictEqual(res.type, "application/json");
  assert.strictEqual(res.body.message, "Hello, World!");
});
