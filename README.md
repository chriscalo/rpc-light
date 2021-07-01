# rpc-light
A lightweight RPC library for the browser and Node.js

## Installation

``` sh
yarn add rpc-light
# OR
npm install rpc-light
```

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
import axios from "axios"; // optional, use any transport you like
import { createService } from "rpc-light/client.js";

// (1) We first call `createService()`, providing a `callHandler` (see below).
const service = createService(callHandler);

// (2) Then, we are able to access an arbitrarily deep hierarchy of properties
// on the service. As we access a deeper property chain, the service tracks this
// path. This has no effect before we invoke a function call on one of these
// properties.
service.foo.bar.baz; //=> path = ["foo", "bar", "baz"]

// (3) Whenever we invoke a function call, the `callHandler` provided to
// `createService()` is called with the provided arguments.
const response = await service.foo.bar.baz({ name: "World" }, "!");

// (4) Finally, the provided `callHandler()` is invoked with:
//  - `this` set to the proxy object (which contains the sequence of properties
//    accessed on its `path` key)
//  - all arguments passed as function parameters
async function callHandler(...args) {
  const { path } = this;
  const payload = { path, args };
  // (5) issue server call here via fetch(), axios(), etc. The way `rpc-light`'s
  // server expects the call to be made is as follows, but if you want to use
  // your own custom server logic, you can do anything you want here. (And the
  // endpoint can be anything you configure on your server, it doesn't need to
  // be `/rpc` to work with `rpc-light`'s server.)
  return await axios.post("/rpc", payload).then(res => res.data);
}
```

## Node.js RPC Server

COMING SOON
