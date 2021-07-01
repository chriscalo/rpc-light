const test = require("ava");
const request = require("supertest");
const { rpcService } = require("./server.js");

test("exports a function", t => {
  t.is(typeof rpcService, "function");
});

test("calling rpcService returns an express handler function", t => {
  const handler = rpcService({
    foo() {},
  });
  t.is(typeof handler, "function");
});

test("handler calls method with args, returns result as JSON", async t => {
  t.plan(4);
  
  const methods = {
    greet(name, exclaim = false) {
      t.is(name, "World");
      const punctuation = exclaim ? "!": "."
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
  
  t.is(res.ok, true);
  t.is(res.type, "application/json");
  t.like(res.body, {
    message: "Hello, World!",
  });
});
