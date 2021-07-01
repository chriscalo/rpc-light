/**
 * Proxy-based RPC client. Intended for use in the browser, but doesn't rely on
 * any browser-specific APIs.
 * 
 * Has no embedded knowledge of the RPC server or any of its methods. Instead,
 * this proxy-based RPC client tracks the names of properties accessed as a
 * `path` variable until a function call is invoked, at which point it delegates
 * to a handler function that you provide.
 * 
 * When an RPC call is issued, the RpcProxyHandler instance is set as `this` in
 * the `callHandler` function and all arguments are passed as function
 * parameters.
 * 
 * Usage example:
 * 
 * const rpc = createService(handler);
 * const response = await rpc.accounts.update(1234, { name: "Foo" });
 * 
 * // Example only, you can do anything you want with the data.
 * async function handler(...args) {
 *   // args === [ 1234, { name: "Foo" } ]
 *   // path === [ "accounts", "update" ]
 *   const { path } = this;
 *   const payload = { path, args };
 *   return await $axios.post("/rpc", payload).then(res => res.data);
 * }
 */

/**
 * Creates an RPC service.
 * 
 * @param callHandler Handler for each RPC call
 * @returns A proxy instance that builds up 
 */
// FIXME: validate that callHandler is a function
function createService(callHandler) {
  const handler = new RpcProxyHandler(callHandler);
  return new Proxy({}, handler);
}

/**
 * Class that serves as a Proxy handler for an RPC service. The purpose of this
 * class is to track the sequence of properties accessed to build a an ordered
 * `path` until a function call is invoked, at which point the class delegates
 * to the user-provided `callHandler` passed to the constructor.
 */
class RpcProxyHandler {
  
  /**
   * Creates a new instance of an RpcProxyHandler.
   * 
   * @param callHandler Function called when an RPC is invoked
   * @param path Array of properties accessed up to this point
   */
  constructor(callHandler, path = []) {
    this.callHandler = callHandler;
    this.path = path;
  }
  
  /**
   * Called each time a property is accessed. Returns a new proxied function
   * that contains the full path of properties accessed up to this point and is
   * ready to call to issue an RPC. 
   * 
   * @param target The proxy target
   * @param prop The name of the accessed property
   * @param receiver
   * @returns A proxied function that is ready to call to issue and RPC
   */
  get(target, prop, receiver) {
    const path = [...this.path, prop];
    const handler = new RpcProxyHandler(this.callHandler, path);
    return new Proxy(async function noop() {}, handler);
  }
  
  /**
   * Called for every RPC function call. Delegates to the `callHandler` passed
   * to `createService()` when the service was created.
   */
  async apply(target, thisArg, args) {
    const { path, callHandler } = this;
    // TODO: to simplify library usage, consider passing the path:
    // `callHandler.call(this, path, args)`
    return await callHandler.apply(this, args);
  }
  
}

// TODO: we should provide a default handler that POSTs RPC calls to a server at
// some provided URL or path
// async function defaultRpcHandler(endpoint = "/rpc") {
//   const { path } = this;
//   const payload = { path, args };
//   return await axios.post(endpoint, payload).then(res => res.data);
// }


module.exports = {
  createService,
  // defaultRpcHandler,
};
