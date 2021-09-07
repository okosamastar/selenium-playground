(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[6],{

/***/ 199:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return withAsyncPerformanceMark; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return withSyncPerformanceMark; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return withCallbackPerformanceMark; });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

const supportsUserTiming = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function';

function mark(markName) {
  if (supportsUserTiming) {
    performance.mark(markName + '-start');
  }
}

function measure(markName) {
  if (supportsUserTiming) {
    performance.mark(markName + '-end');
    performance.measure(markName, markName + '-start', markName + '-end');
  }
}

async function withAsyncPerformanceMark(markName, callback) {
  if (_constants__WEBPACK_IMPORTED_MODULE_0__[/* __PERFORMANCE_PROFILE__ */ "x"]) {
    mark(markName);
    const result = await callback();
    measure(markName);
    return result;
  }

  return callback();
}
function withSyncPerformanceMark(markName, callback) {
  if (_constants__WEBPACK_IMPORTED_MODULE_0__[/* __PERFORMANCE_PROFILE__ */ "x"]) {
    mark(markName);
    const result = callback();
    measure(markName);
    return result;
  }

  return callback();
}
function withCallbackPerformanceMark(markName, callback) {
  if (_constants__WEBPACK_IMPORTED_MODULE_0__[/* __PERFORMANCE_PROFILE__ */ "x"]) {
    mark(markName);

    const done = () => {
      measure(markName);
    };

    return callback(done);
  }

  return callback(() => {});
}

/***/ }),

/***/ 200:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return loadSourceAndMetadata; });
/* unused harmony export hasNamedHooks */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return flattenHooksList; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return prefetchSourceFiles; });
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(36);
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lru_cache__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var react_devtools_shared_src_hookNamesCache__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(51);
/* harmony import */ var _SourceMapUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(206);
/* harmony import */ var react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(199);
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
// Parsing source and source maps is done in a Web Worker
// because parsing is CPU intensive and should not block the UI thread.
//
// Fetching source and source map files is intentionally done on the UI thread
// so that loaded source files can reuse the browser's Network cache.
// Requests made from within an extension do not share the page's Network cache,
// but messages can be sent from the UI thread to the content script
// which can make a request from the page's context (with caching).
//
// Some overhead may be incurred sharing (serializing) the loaded data between contexts,
// but less than fetching the file to begin with,
// and in some cases we can avoid serializing the source code at all
// (e.g. when we are in an environment that supports our custom metadata format).
//
// The overall flow of this file is such:
// 1. Find the Set of source files defining the hooks and load them all.
//    Then for each source file, do the following:
//
//    a. Search loaded source file to see if a source map is available.
//       If so, load that file and pass it to a Worker for parsing.
//       The source map is used to retrieve the original source,
//       which is then also parsed in the Worker to infer hook names.
//       This is less ideal because parsing a full source map is slower,
//       since we need to evaluate the mappings in order to map the runtime code to the original source,
//       but at least the eventual source that we parse to an AST is small/fast.
//
//    b. If no source map, pass the full source to a Worker for parsing.
//       Use the source to infer hook names.
//       This is the least optimal route as parsing the full source is very CPU intensive.
//
// In the future, we may add an additional optimization the above sequence.
// This check would come before the source map check:
//
//    a. Search loaded source file to see if a custom React metadata file is available.
//       If so, load that file and pass it to a Worker for parsing and extracting.
//       This is the fastest option since our custom metadata file is much smaller than a full source map,
//       and there is no need to convert runtime code to the original source.





// Prefer a cached albeit stale response to reduce download time.
// We wouldn't want to load/parse a newer version of the source (even if one existed).
const FETCH_OPTIONS = {
  cache: 'force-cache'
};
const MAX_SOURCE_LENGTH = 100000000; // Fetch requests originated from an extension might not have origin headers
// which may prevent subsequent requests from using cached responses
// if the server returns a Vary: 'Origin' header
// so this cache will temporarily store pre-fetches sources in memory.

const prefetchedSources = new lru_cache__WEBPACK_IMPORTED_MODULE_0___default.a({
  max: 15
});
async function loadSourceAndMetadata(hooksList, fetchFileWithCaching) {
  return Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withAsyncPerformanceMark */ "a"])('loadSourceAndMetadata()', async () => {
    const locationKeyToHookSourceAndMetadata = Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('initializeHookSourceAndMetadata', () => initializeHookSourceAndMetadata(hooksList));
    await Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withAsyncPerformanceMark */ "a"])('loadSourceFiles()', () => loadSourceFiles(locationKeyToHookSourceAndMetadata, fetchFileWithCaching));
    await Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withAsyncPerformanceMark */ "a"])('extractAndLoadSourceMapJSON()', () => extractAndLoadSourceMapJSON(locationKeyToHookSourceAndMetadata)); // At this point, we've loaded JS source (text) and source map (JSON).
    // The remaining works (parsing these) is CPU intensive and should be done in a worker.

    return locationKeyToHookSourceAndMetadata;
  });
}

function decodeBase64String(encoded) {
  if (typeof atob === 'function') {
    return atob(encoded);
  } else if (typeof Buffer !== 'undefined' && Buffer !== null && typeof Buffer.from === 'function') {
    return Buffer.from(encoded, 'base64');
  } else {
    throw Error('Cannot decode base64 string');
  }
}

function extractAndLoadSourceMapJSON(locationKeyToHookSourceAndMetadata) {
  // Deduplicate fetches, since there can be multiple location keys per source map.
  const dedupedFetchPromises = new Map();
  const setterPromises = [];
  locationKeyToHookSourceAndMetadata.forEach(hookSourceAndMetadata => {
    const sourceMapRegex = / ?sourceMappingURL=([^\s'"]+)/gm;
    const runtimeSourceCode = hookSourceAndMetadata.runtimeSourceCode; // TODO (named hooks) Search for our custom metadata first.
    // If it's found, we should use it rather than source maps.
    // TODO (named hooks) If this RegExp search is slow, we could try breaking it up
    // first using an indexOf(' sourceMappingURL=') to find the start of the comment
    // (probably at the end of the file) and then running the RegExp on the remaining substring.

    let sourceMappingURLMatch = Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('sourceMapRegex.exec(runtimeSourceCode)', () => sourceMapRegex.exec(runtimeSourceCode));

    if (sourceMappingURLMatch == null) {
      if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
        console.log('extractAndLoadSourceMapJSON() No source map found');
      } // Maybe file has not been transformed; we'll try to parse it as-is in parseSourceAST().

    } else {
      const externalSourceMapURLs = [];

      while (sourceMappingURLMatch != null) {
        const {
          runtimeSourceURL
        } = hookSourceAndMetadata;
        const sourceMappingURL = sourceMappingURLMatch[1];
        const hasInlineSourceMap = sourceMappingURL.indexOf('base64,') >= 0;

        if (hasInlineSourceMap) {
          // TODO (named hooks) deduplicate parsing in this branch (similar to fetching in the other branch)
          // since there can be multiple location keys per source map.
          // Web apps like Code Sandbox embed multiple inline source maps.
          // In this case, we need to loop through and find the right one.
          // We may also need to trim any part of this string that isn't based64 encoded data.
          const trimmed = sourceMappingURL.match(/base64,([a-zA-Z0-9+\/=]+)/)[1];
          const decoded = Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('decodeBase64String()', () => decodeBase64String(trimmed));
          const sourceMapJSON = Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('JSON.parse(decoded)', () => JSON.parse(decoded));

          if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
            console.groupCollapsed('extractAndLoadSourceMapJSON() Inline source map');
            console.log(sourceMapJSON);
            console.groupEnd();
          } // Hook source might be a URL like "https://4syus.csb.app/src/App.js"
          // Parsed source map might be a partial path like "src/App.js"


          if (Object(_SourceMapUtils__WEBPACK_IMPORTED_MODULE_3__[/* sourceMapIncludesSource */ "a"])(sourceMapJSON, runtimeSourceURL)) {
            hookSourceAndMetadata.sourceMapJSON = sourceMapJSON; // OPTIMIZATION If we've located a source map for this source,
            // we'll use it to retrieve the original source (to extract hook names).
            // We only fall back to parsing the full source code is when there's no source map.
            // The source is (potentially) very large,
            // So we can avoid the overhead of serializing it unnecessarily.

            hookSourceAndMetadata.runtimeSourceCode = null;
            break;
          }
        } else {
          externalSourceMapURLs.push(sourceMappingURL);
        } // If the first source map we found wasn't a match, check for more.


        sourceMappingURLMatch = Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('sourceMapRegex.exec(runtimeSourceCode)', () => sourceMapRegex.exec(runtimeSourceCode));
      }

      if (hookSourceAndMetadata.sourceMapJSON === null) {
        externalSourceMapURLs.forEach((sourceMappingURL, index) => {
          if (index !== externalSourceMapURLs.length - 1) {
            // Files with external source maps should only have a single source map.
            // More than one result might indicate an edge case,
            // like a string in the source code that matched our "sourceMappingURL" regex.
            // We should just skip over cases like this.
            console.warn(`More than one external source map detected in the source file; skipping "${sourceMappingURL}"`);
            return;
          }

          const {
            runtimeSourceURL
          } = hookSourceAndMetadata;
          let url = sourceMappingURL;

          if (!url.startsWith('http') && !url.startsWith('/')) {
            // Resolve paths relative to the location of the file name
            const lastSlashIdx = runtimeSourceURL.lastIndexOf('/');

            if (lastSlashIdx !== -1) {
              const baseURL = runtimeSourceURL.slice(0, runtimeSourceURL.lastIndexOf('/'));
              url = `${baseURL}/${url}`;
            }
          }

          hookSourceAndMetadata.sourceMapURL = url;
          const fetchPromise = dedupedFetchPromises.get(url) || fetchFile(url).then(sourceMapContents => {
            const sourceMapJSON = Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('JSON.parse(sourceMapContents)', () => JSON.parse(sourceMapContents));
            return sourceMapJSON;
          }, // In this case, we fall back to the assumption that the source has no source map.
          // This might indicate an (unlikely) edge case that had no source map,
          // but contained the string "sourceMappingURL".
          error => null);

          if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
            if (!dedupedFetchPromises.has(url)) {
              console.log(`extractAndLoadSourceMapJSON() External source map "${url}"`);
            }
          }

          dedupedFetchPromises.set(url, fetchPromise);
          setterPromises.push(fetchPromise.then(sourceMapJSON => {
            if (sourceMapJSON !== null) {
              hookSourceAndMetadata.sourceMapJSON = sourceMapJSON; // OPTIMIZATION If we've located a source map for this source,
              // we'll use it to retrieve the original source (to extract hook names).
              // We only fall back to parsing the full source code is when there's no source map.
              // The source is (potentially) very large,
              // So we can avoid the overhead of serializing it unnecessarily.

              hookSourceAndMetadata.runtimeSourceCode = null;
            }
          }));
        });
      }
    }
  });
  return Promise.all(setterPromises);
}

function fetchFile(url, markName = 'fetchFile') {
  return Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withCallbackPerformanceMark */ "b"])(`${markName}("${url}")`, done => {
    return new Promise((resolve, reject) => {
      fetch(url, FETCH_OPTIONS).then(response => {
        if (response.ok) {
          response.text().then(text => {
            done();
            resolve(text);
          }).catch(error => {
            if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
              console.log(`${markName}() Could not read text for url "${url}"`);
            }

            done();
            reject(null);
          });
        } else {
          if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
            console.log(`${markName}() Got bad response for url "${url}"`);
          }

          done();
          reject(null);
        }
      }, error => {
        if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
          console.log(`${markName}() Could not fetch file: ${error.message}`);
        }

        done();
        reject(null);
      });
    });
  });
}

function hasNamedHooks(hooksTree) {
  for (let i = 0; i < hooksTree.length; i++) {
    const hook = hooksTree[i];

    if (!isUnnamedBuiltInHook(hook)) {
      return true;
    }

    if (hook.subHooks.length > 0) {
      if (hasNamedHooks(hook.subHooks)) {
        return true;
      }
    }
  }

  return false;
}
function flattenHooksList(hooksTree) {
  const hooksList = [];
  Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withSyncPerformanceMark */ "c"])('flattenHooksList()', () => {
    flattenHooksListImpl(hooksTree, hooksList);
  });

  if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
    console.log('flattenHooksList() hooksList:', hooksList);
  }

  return hooksList;
}

function flattenHooksListImpl(hooksTree, hooksList) {
  for (let i = 0; i < hooksTree.length; i++) {
    const hook = hooksTree[i];

    if (isUnnamedBuiltInHook(hook)) {
      // No need to load source code or do any parsing for unnamed hooks.
      if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
        console.log('flattenHooksListImpl() Skipping unnamed hook', hook);
      }

      continue;
    }

    hooksList.push(hook);

    if (hook.subHooks.length > 0) {
      flattenHooksListImpl(hook.subHooks, hooksList);
    }
  }
}

function initializeHookSourceAndMetadata(hooksList) {
  // Create map of unique source locations (file names plus line and column numbers) to metadata about hooks.
  const locationKeyToHookSourceAndMetadata = new Map();

  for (let i = 0; i < hooksList.length; i++) {
    const hook = hooksList[i];
    const hookSource = hook.hookSource;

    if (hookSource == null) {
      // Older versions of react-debug-tools don't include this information.
      // In this case, we can't continue.
      throw Error('Hook source code location not found.');
    }

    const locationKey = Object(react_devtools_shared_src_hookNamesCache__WEBPACK_IMPORTED_MODULE_2__[/* getHookSourceLocationKey */ "b"])(hookSource);

    if (!locationKeyToHookSourceAndMetadata.has(locationKey)) {
      // Can't be null because getHookSourceLocationKey() would have thrown
      const runtimeSourceURL = hookSource.fileName;
      const hookSourceAndMetadata = {
        hookSource,
        runtimeSourceCode: null,
        runtimeSourceURL,
        sourceMapJSON: null,
        sourceMapURL: null
      };
      locationKeyToHookSourceAndMetadata.set(locationKey, hookSourceAndMetadata);
    }
  }

  return locationKeyToHookSourceAndMetadata;
} // Determines whether incoming hook is a primitive hook that gets assigned to variables.


function isUnnamedBuiltInHook(hook) {
  return ['Effect', 'ImperativeHandle', 'LayoutEffect', 'DebugValue'].includes(hook.name);
}

function loadSourceFiles(locationKeyToHookSourceAndMetadata, fetchFileWithCaching) {
  // Deduplicate fetches, since there can be multiple location keys per file.
  const dedupedFetchPromises = new Map();
  const setterPromises = [];
  locationKeyToHookSourceAndMetadata.forEach(hookSourceAndMetadata => {
    const {
      runtimeSourceURL
    } = hookSourceAndMetadata;
    const prefetchedSourceCode = prefetchedSources.get(runtimeSourceURL);

    if (prefetchedSourceCode != null) {
      hookSourceAndMetadata.runtimeSourceCode = prefetchedSourceCode;
    } else {
      let fetchFileFunction = fetchFile;

      if (fetchFileWithCaching != null) {
        // If a helper function has been injected to fetch with caching,
        // use it to fetch the (already loaded) source file.
        fetchFileFunction = url => {
          return Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withAsyncPerformanceMark */ "a"])(`fetchFileWithCaching("${url}")`, () => {
            return fetchFileWithCaching(url);
          });
        };
      }

      const fetchPromise = dedupedFetchPromises.get(runtimeSourceURL) || fetchFileFunction(runtimeSourceURL).then(runtimeSourceCode => {
        // TODO (named hooks) Re-think this; the main case where it matters is when there's no source-maps,
        // because then we need to parse the full source file as an AST.
        if (runtimeSourceCode.length > MAX_SOURCE_LENGTH) {
          throw Error('Source code too large to parse');
        }

        if (react_devtools_shared_src_constants__WEBPACK_IMPORTED_MODULE_1__[/* __DEBUG__ */ "w"]) {
          console.groupCollapsed(`loadSourceFiles() runtimeSourceURL "${runtimeSourceURL}"`);
          console.log(runtimeSourceCode);
          console.groupEnd();
        }

        return runtimeSourceCode;
      });
      dedupedFetchPromises.set(runtimeSourceURL, fetchPromise);
      setterPromises.push(fetchPromise.then(runtimeSourceCode => {
        hookSourceAndMetadata.runtimeSourceCode = runtimeSourceCode;
      }));
    }
  });
  return Promise.all(setterPromises);
}

function prefetchSourceFiles(hooksTree, fetchFileWithCaching) {
  // Deduplicate fetches, since there can be multiple location keys per source map.
  const dedupedFetchPromises = new Set();
  let fetchFileFunction = null;

  if (fetchFileWithCaching != null) {
    // If a helper function has been injected to fetch with caching,
    // use it to fetch the (already loaded) source file.
    fetchFileFunction = url => {
      return Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_4__[/* withAsyncPerformanceMark */ "a"])(`[pre] fetchFileWithCaching("${url}")`, () => {
        return fetchFileWithCaching(url);
      });
    };
  } else {
    fetchFileFunction = url => fetchFile(url, '[pre] fetchFile');
  }

  const hooksQueue = Array.from(hooksTree);

  for (let i = 0; i < hooksQueue.length; i++) {
    const hook = hooksQueue.pop();

    if (isUnnamedBuiltInHook(hook)) {
      continue;
    }

    const hookSource = hook.hookSource;

    if (hookSource == null) {
      continue;
    }

    const runtimeSourceURL = hookSource.fileName;

    if (prefetchedSources.has(runtimeSourceURL)) {
      // If we've already fetched this source, skip it.
      continue;
    }

    if (!dedupedFetchPromises.has(runtimeSourceURL)) {
      dedupedFetchPromises.add(runtimeSourceURL);
      fetchFileFunction(runtimeSourceURL).then(text => {
        prefetchedSources.set(runtimeSourceURL, text);
      });
    }

    if (hook.subHooks.length > 0) {
      hooksQueue.push(...hook.subHooks);
    }
  }
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(202).Buffer))

/***/ }),

/***/ 201:
/***/ (function(module, exports, __webpack_require__) {


				var addMethods = __webpack_require__(108)
				var methods = ["parseSourceAndMetadata","purgeCachedMetadata"]
				module.exports = function() {
					addMethods(w, methods)
					
					return w
				}
			

/***/ }),

/***/ 206:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return sourceMapIncludesSource; });
/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
function sourceMapIncludesSource(sourcemap, source) {
  if (source == null) {
    return false;
  }

  if (sourcemap.mappings === undefined) {
    const indexSourceMap = sourcemap;
    return indexSourceMap.sections.some(section => {
      return sourceMapIncludesSource(section.map, source);
    });
  }

  const basicMap = sourcemap;
  return basicMap.sources.some(s => s === 'Inline Babel script' || source.endsWith(s));
}

/***/ }),

/***/ 207:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseSourceAndMetadata", function() { return parseSourceAndMetadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "purgeCachedMetadata", function() { return purgeCachedMetadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseHookNames", function() { return parseHookNames; });
/* harmony import */ var react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(199);
/* harmony import */ var _parseSourceAndMetadata_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(201);
/* harmony import */ var _parseSourceAndMetadata_worker__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_parseSourceAndMetadata_worker__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _loadSourceAndMetadata__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(200);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "prefetchSourceFiles", function() { return _loadSourceAndMetadata__WEBPACK_IMPORTED_MODULE_2__["c"]; });

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */



const workerizedParseHookNames = _parseSourceAndMetadata_worker__WEBPACK_IMPORTED_MODULE_1___default()();

function parseSourceAndMetadata(hooksList, locationKeyToHookSourceAndMetadata) {
  return workerizedParseHookNames.parseSourceAndMetadata(hooksList, locationKeyToHookSourceAndMetadata);
}
const purgeCachedMetadata = workerizedParseHookNames.purgeCachedMetadata;
const EMPTY_MAP = new Map();
async function parseHookNames(hooksTree, fetchFileWithCaching) {
  return Object(react_devtools_shared_src_PerformanceMarks__WEBPACK_IMPORTED_MODULE_0__[/* withAsyncPerformanceMark */ "a"])('parseHookNames', async () => {
    const hooksList = Object(_loadSourceAndMetadata__WEBPACK_IMPORTED_MODULE_2__[/* flattenHooksList */ "a"])(hooksTree);

    if (hooksList.length === 0) {
      // This component tree contains no named hooks.
      return EMPTY_MAP;
    } // Runs on the main/UI thread so it can reuse Network cache:


    const locationKeyToHookSourceAndMetadata = await Object(_loadSourceAndMetadata__WEBPACK_IMPORTED_MODULE_2__[/* loadSourceAndMetadata */ "b"])(hooksList, fetchFileWithCaching); // Runs in a Worker because it's CPU intensive:

    return parseSourceAndMetadata(hooksList, locationKeyToHookSourceAndMetadata);
  });
}

/***/ })

}]);