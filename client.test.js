const test = require("ava");
const { createService } = require("./rpc-client.js");

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

test("function call: receives path & args, returns value", async t => {
  const service = createService(function (...args) {
    t.deepEqual(this.path, ["foo", "bar"]);
    const [ person, year ] = args;
    t.deepEqual(args[0], { name: "Chris" });
    t.deepEqual(args[1], 1981);
    const age = new Date().getFullYear() - year;
    return `Hello, ${person.name}! You turn ${age} this year!`;
  });
  
  const response = await service.foo.bar({ name: "Chris" }, 1981);
  t.is(response, "Hello, Chris! You turn 40 this year!");
});
