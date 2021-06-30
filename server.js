// consider smaller replacements:
// - https://www.npmjs.com/package/get-value
// - https://www.npmjs.com/package/object-path-get
const express = require("express");
const bodyParser = require("body-parser");
const R = require("ramda");
const { schema, items, is } = require("~/util/schema");

function rpcService(exposedMethods) {
  
  // put path in the URL? 🤔
  // handle OPTIONS request at the root? 🤔
  // handle only POST requests? 🤔
  
  const service = express();
  
  service.use(bodyParser.json());
  
  service.use(async function rpcHandler(req, res, next) {
    const { path, args } = req.body;
    
    if (!ArrayOfStringsSchema.test(path)) {
      console.log("failed ArrayOfStringsSchema");
      next(new TypeError("path parameter must be an array of strings"));
      return;
    }
    
    if (!Array.isArray(args)) {
      console.log("failed Array.isArray");
      next(new TypeError("args parameter must be an array"));
      return;
    }
    
    const thisArg = R.path(path.slice(0, -1), exposedMethods);
    const method = R.path(path, exposedMethods);
    
    if (typeof method !== "function") {
      next();
      return;
    }
    
    try {
      res.json(await method.apply(thisArg, args));
    } catch (error) {
      next(error);
    }
  });
  
  service.use(function errorHandler(err, req, res, next) {
    console.log(err);
    res.status(400).json({
      error: err,
    });
  });
  
  return service;
}

module.exports = {
  rpcService,
};

const ArrayOfStringsSchema = schema(
  is(Array),
  items(is(String)),
);
