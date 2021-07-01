# rpc-light
A lightweight RPC library for Node.js and the browser

## Installation

``` sh
yarn add rpc-light
# OR
npm install rpc-light
```

## Node.js RPC Server

The RPC server requires minimal setup. The `rpcService()` function accepts an
object of sync or async methods you want to expose to the client and returns an
`express` handler function. Compose this with your Express server and start it
to handle RPCs.

Example:

``` js
const { rpcService } = require("rpc-light/server.js");
const express = require("express");

const app = express();

// These are methods you want to expose to the client. This structure can have
// arbitrarily deep nesting.
const exposedMethods = {
  greetingService: {
    greet(name, exclaim = false) {
      const punctuation = exclaim ? "!": "."
      const message = `Hello, ${name}` + punctuation;
      return {
        message,
      };
    },
  },
};

// choose any URL path you would like, just make sure your client sends requests
// to that URL
app.use("/rpc", rpcService(exposedMethods));

app.listen(8080);
```

It's now possible to invoke `greetingService.greet("World", true)` via a `POST`
request to the URL `/rpc` passing a JSON object with `path` and `args` keys:

```
POST /rpc
{
  "path": ["greetingService", "greet"],
  "args": ["World", true]
}
```

Next, we'll use the included RPC client to do just this.


## Proxy-based RPC Client

The proxy-based RPC client is intended for use in the browser, but doesn't rely
on any browser-specific APIs. It has no embedded knowledge of the RPC server or
any of its methods and doesn't require type definitions of any kind such as
protocol buffers.

Instead, this proxy-based RPC client tracks the names of properties accessed as
a `path` variable until we invoke one of these properties as a function, at
which point it delegates to a handler function that you provide.

Example:

``` js
import { createService } from "rpc-light/client.js";
import axios from "axios"; // optional, use any transport you like

// (1) We first call `createService()`, providing a `callHandler` (see below).
const service = createService(callHandler);

// (2) Then, we are able to access an arbitrarily deep hierarchy of properties
// on the service. As we access a deeper property chain, the service tracks this
// path. This has no effect before we invoke a function call on one of these
// properties.
service.greetingService.greet; //=> path = ["greetingService", "greet"]

// (3) Whenever we invoke a function call, the `callHandler` provided to
// `createService()` is called with the provided arguments. Note that because
// this is remote communication, all function calls return a promise that must
// be `await`-ed or `then()`-ed.
const response = await service.greetingService.greet("World", true);
console.log(response); //=> { message: "Hello, World!" }

// (4) The provided `callHandler()` is invoked with:
//  - `this` set to the proxy object (which contains the sequence of properties
//    accessed on its `path` key)
//  - all arguments passed as function parameters
async function callHandler(...args) {
  const { path } = this;
  const payload = { path, args };
  // (5) Finally, you issue server call here via fetch(), axios(), etc. The way
  // `rpc-light`'s server expects the call to be made is as follows, but if you
  // want to use your own custom server logic, you can do anything you want
  // here. (And the endpoint can be anything you configure on your server, it
  // doesn't need to be `/rpc` to work with `rpc-light`'s server.)
  return await axios.post("/rpc", payload).then(res => res.data);
}
```

## Credits

Inspired by [`wildcard-api`](https://www.npmjs.com/package/wildcard-api)
