/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./www/src/preview.ts"
/*!****************************!*\
  !*** ./www/src/preview.ts ***!
  \****************************/
(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nvar _a, _b, _c, _d;\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst results = __importStar(__webpack_require__(/*! ./results.json */ \"./www/src/results.json\"));\nconst testList = results;\nconst testSelector = document.querySelector('#test_selector');\nconst browserSelector = document.querySelector('#browser_selector');\nconst previewImage = document.querySelector('#preview_image');\nconst testLink = document.querySelector('#test_link');\nfunction onTestChange(browserTests) {\n    if (browserSelector) {\n        const currentSelection = browserSelector.value;\n        while (browserSelector.firstChild) {\n            browserSelector.firstChild.remove();\n        }\n        let newSelection;\n        browserTests.forEach((browser, i) => {\n            if (i === 0) {\n                newSelection = browser;\n            }\n            const option = document.createElement('option');\n            option.value = browser.id;\n            if (browser.id === currentSelection) {\n                option.selected = true;\n                newSelection = browser;\n            }\n            option.textContent = browser.id.replace(/_/g, ' ');\n            browserSelector.appendChild(option);\n        });\n        if (newSelection) {\n            onBrowserChange(newSelection);\n        }\n    }\n}\nfunction onBrowserChange(browserTest) {\n    if (previewImage) {\n        previewImage.src = `/results/${browserTest.screenshot}.png`;\n        if (browserTest.devicePixelRatio > 1) {\n            previewImage.style.transform = `scale(${1 / browserTest.devicePixelRatio})`;\n            previewImage.style.transformOrigin = 'top left';\n        }\n        else {\n            previewImage.style.transform = '';\n            previewImage.style.transformOrigin = '';\n        }\n    }\n    if (history) {\n        history.replaceState(null, document.title, `?browser=${browserSelector === null || browserSelector === void 0 ? void 0 : browserSelector.value}&test=${testSelector === null || testSelector === void 0 ? void 0 : testSelector.value}`);\n    }\n}\nfunction selectTest(testName) {\n    const foundTest = testList[testName];\n    if (foundTest) {\n        if (testLink) {\n            testLink.textContent = testLink.href = testName;\n        }\n        onTestChange(foundTest);\n    }\n}\nconst UP_ARROW = 38;\nconst DOWN_ARROW = 40;\nconst LEFT_ARROW = 37;\nconst RIGHT_ARROW = 39;\nwindow.addEventListener('keydown', e => {\n    if (testSelector && browserSelector) {\n        if (e.keyCode === UP_ARROW) {\n            testSelector.selectedIndex = Math.max(0, testSelector.selectedIndex - 1);\n            const event = new Event('change');\n            testSelector.dispatchEvent(event);\n            e.preventDefault();\n        }\n        else if (e.keyCode === DOWN_ARROW) {\n            testSelector.selectedIndex = Math.min(testSelector.children.length - 1, testSelector.selectedIndex + 1);\n            const event = new Event('change');\n            testSelector.dispatchEvent(event);\n            e.preventDefault();\n        }\n        else if (e.keyCode === LEFT_ARROW) {\n            browserSelector.selectedIndex = Math.max(0, browserSelector.selectedIndex - 1);\n            const event = new Event('change');\n            browserSelector.dispatchEvent(event);\n            e.preventDefault();\n        }\n        else if (e.keyCode === RIGHT_ARROW) {\n            browserSelector.selectedIndex = Math.min(browserSelector.children.length - 1, browserSelector.selectedIndex + 1);\n            const event = new Event('change');\n            browserSelector.dispatchEvent(event);\n            e.preventDefault();\n        }\n    }\n});\nif (testSelector && browserSelector) {\n    testSelector.addEventListener('change', () => {\n        selectTest(testSelector.value);\n    }, false);\n    browserSelector.addEventListener('change', () => {\n        testList[testSelector.value].some(browser => {\n            if (browser.id === browserSelector.value) {\n                if (browser) {\n                    onBrowserChange(browser);\n                }\n                return true;\n            }\n            return false;\n        });\n    }, false);\n    let testFromUrl = null;\n    if (URLSearchParams) {\n        const url = new URLSearchParams(location.search);\n        testFromUrl = url.get('test');\n        if (browserSelector) {\n            const option = document.createElement('option');\n            browserSelector.appendChild(option);\n            browserSelector.value = option.value = (_a = url.get('browser')) !== null && _a !== void 0 ? _a : '';\n        }\n    }\n    const tests = Object.keys(testList);\n    tests.forEach(testName => {\n        const option = document.createElement('option');\n        option.value = testName;\n        option.textContent = testName;\n        if (option.value === testFromUrl) {\n            option.selected = true;\n        }\n        testSelector.appendChild(option);\n    });\n    selectTest((_d = (_b = testSelector.value) !== null && _b !== void 0 ? _b : (_c = testSelector.firstChild) === null || _c === void 0 ? void 0 : _c.textContent) !== null && _d !== void 0 ? _d : '');\n}\n\n\n//# sourceURL=webpack://@html2canvas/html2canvas/./www/src/preview.ts?\n}");

/***/ },

/***/ "./www/src/results.json"
/*!******************************!*\
  !*** ./www/src/results.json ***!
  \******************************/
(module) {

eval("{module.exports = {};\n\n//# sourceURL=webpack://@html2canvas/html2canvas/./www/src/results.json?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__("./www/src/preview.ts");
/******/ 	
/******/ })()
;