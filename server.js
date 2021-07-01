const express = require("express");
const bodyParser = require("body-parser");
const R = require("ramda");

// put path in the URL? 🤔
// handle OPTIONS request at the root? 🤔
// handle only POST requests? 🤔
function rpcService(exposedMethods) {
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

const ArrayOfStringsSchema = {
  test(value) {
    if (!Array.isArray(value)) {
      return false;
    }
    
    if (!value.every(isString)) {
      return false;
    }
    
    return true;
  },
};

function isString(value) {
  return typeof value === "string";
}
