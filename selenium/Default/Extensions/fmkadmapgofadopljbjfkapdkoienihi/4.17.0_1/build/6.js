(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[6],{

/***/ 195:
/***/ (function(module, exports, __webpack_require__) {


				var addMethods = __webpack_require__(104)
				var methods = ["parseHookNames","purgeCachedMetadata"]
				module.exports = function() {
					addMethods(w, methods)
					
					return w
				}
			

/***/ }),

/***/ 196:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseHookNames", function() { return parseHookNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "purgeCachedMetadata", function() { return purgeCachedMetadata; });
/* harmony import */ var _parseHookNames_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(195);
/* harmony import */ var _parseHookNames_worker__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_parseHookNames_worker__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
// This file uses workerize to load ./parseHookNames.worker as a webworker and instanciates it,
// exposing flow typed functions that can be used on other files.

const workerizedParseHookNames = _parseHookNames_worker__WEBPACK_IMPORTED_MODULE_0___default()();
const parseHookNames = hooksTree => workerizedParseHookNames.parseHookNames(hooksTree);
const purgeCachedMetadata = workerizedParseHookNames.purgeCachedMetadata;

/***/ })

}]);