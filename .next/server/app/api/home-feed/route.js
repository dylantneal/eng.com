/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/home-feed/route";
exports.ids = ["app/api/home-feed/route"];
exports.modules = {

/***/ "(rsc)/./app/api/home-feed/route.ts":
/*!************************************!*\
  !*** ./app/api/home-feed/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   revalidate: () => (/* binding */ revalidate)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n/**\n * GET /api/home-feed?filter=newest|top|bookmarks&cursor=abc\n *\n * Returned shape:\n * {\n *   items: Project[],\n *   nextCursor: string | null\n * }\n */ const revalidate = 30; // ISR – regenerate JSON every 30 s\nasync function GET(req) {\n    const { searchParams } = new URL(req.url);\n    const filter = searchParams.get('filter') ?? 'following';\n    const cursor = searchParams.get('cursor') ?? null;\n    const cursorTipsParam = searchParams.get('cursorTips');\n    const pageSize = 12;\n    const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(\"https://ewbopfohuxlhhddtptka.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ym9wZm9odXhsaGhkZHRwdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTQ4NzAsImV4cCI6MjA2MzQzMDg3MH0.EhOaVCSP7upbI-j8H8Yjp4cPsuyoYU9cOhDaHPkNM-s\");\n    /* ––––– build a query per requested filter ––––– */ let query = supabase.from('projects').select('*').limit(pageSize);\n    if (filter === 'top') {\n        query = query.order('tips_cents', {\n            ascending: false\n        });\n    }\n    query = query.order('created_at', {\n        ascending: false\n    }).order('id', {\n        ascending: false\n    });\n    if (cursor) {\n        const [lastCursorCreatedAt, lastCursorId] = cursor.split('_');\n        if (filter === 'top') {\n            const lastCursorTips = parseFloat(cursorTipsParam || '0');\n            query = query.or([\n                `tips_cents.lt.${lastCursorTips}`,\n                `and(tips_cents.eq.${lastCursorTips},created_at.lt.${lastCursorCreatedAt})`,\n                `and(tips_cents.eq.${lastCursorTips},created_at.eq.${lastCursorCreatedAt},id.lt.${lastCursorId})`\n            ].join(','));\n        } else {\n            query = query.or([\n                `created_at.lt.${lastCursorCreatedAt}`,\n                `and(created_at.eq.${lastCursorCreatedAt},id.lt.${lastCursorId})`\n            ].join(','));\n        }\n    }\n    /* ——— bookmarks ——— */ if (filter === 'bookmarks') {\n        const userId = searchParams.get('uid');\n        const { data: rows, error } = await supabase.from('bookmarks').select('project_id').eq('user_id', userId);\n        if (error) return new Response(error.message, {\n            status: 500\n        });\n        const ids = rows?.map((r)=>r.project_id) ?? [];\n        if (!ids.length) return Response.json({\n            items: [],\n            nextCursor: null\n        });\n        query = query.in('id', ids);\n    }\n    /* ——— following ——— */ if (filter === 'following') {\n        const userId = searchParams.get('uid');\n        const { data: rows, error } = await supabase.from('follows').select('followee_id').eq('follower_id', userId);\n        if (error) return new Response(error.message, {\n            status: 500\n        });\n        const followIds = rows?.map((r)=>r.followee_id) ?? [];\n        if (!followIds.length) return Response.json({\n            items: [],\n            nextCursor: null\n        });\n        query = query.in('owner_id', followIds);\n    }\n    const { data, error } = await query;\n    if (error) return new Response(error.message, {\n        status: 500\n    });\n    let nextCursor = null;\n    let nextCursorTips = null;\n    if (data && data.length === pageSize) {\n        const lastItem = data[data.length - 1];\n        nextCursor = `${lastItem.created_at}_${lastItem.id}`;\n        if (filter === 'top') {\n            nextCursorTips = lastItem.tips_cents;\n        }\n    }\n    return Response.json({\n        items: data,\n        nextCursor,\n        nextCursorTips\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sRUFBRTtZQUFFQyxRQUFRO1FBQUk7UUFFNUQsTUFBTVUsWUFBWWYsTUFBTU8sSUFBSSxDQUFDQyxJQUFNQSxFQUFFUSxXQUFXLEtBQUssRUFBRTtRQUN2RCxJQUFJLENBQUNELFVBQVVMLE1BQU0sRUFBRSxPQUFPUCxTQUFTUSxJQUFJLENBQUM7WUFBRUMsT0FBTyxFQUFFO1lBQUVDLFlBQVk7UUFBSztRQUMxRTVCLFFBQVFBLE1BQU02QixFQUFFLENBQUMsWUFBWUM7SUFDL0I7SUFFQSxNQUFNLEVBQUVoQixJQUFJLEVBQUVFLEtBQUssRUFBRSxHQUFHLE1BQU1oQjtJQUM5QixJQUFJZ0IsT0FBTyxPQUFPLElBQUlFLFNBQVNGLE1BQU1HLE9BQU8sRUFBRTtRQUFFQyxRQUFRO0lBQUk7SUFFNUQsSUFBSVEsYUFBYTtJQUNqQixJQUFJSSxpQkFBZ0M7SUFDcEMsSUFBSWxCLFFBQVFBLEtBQUtXLE1BQU0sS0FBSy9CLFVBQVU7UUFDcEMsTUFBTXVDLFdBQVduQixJQUFJLENBQUNBLEtBQUtXLE1BQU0sR0FBRyxFQUFFO1FBQ3RDRyxhQUFhLEdBQUdLLFNBQVNDLFVBQVUsQ0FBQyxDQUFDLEVBQUVELFNBQVNFLEVBQUUsRUFBRTtRQUNwRCxJQUFJN0MsV0FBVyxPQUFPO1lBQ3BCMEMsaUJBQWlCQyxTQUFTRyxVQUFVO1FBQ3RDO0lBQ0Y7SUFFQSxPQUFPbEIsU0FBU1EsSUFBSSxDQUFDO1FBQ25CQyxPQUFPYjtRQUNQYztRQUNBSTtJQUNGO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9keWxhbm5lYWwvRG9jdW1lbnRzL0RvY3VtZW50cyAtIER5bGFu4oCZcyBNYWNCb29rIEFpci9Qcm9mZXNzaW9uYWwvVGVjaG5vbG9neS9XZWJEZXYvZW5nL2VuZy5jb20vYXBwL2FwaS9ob21lLWZlZWQvcm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QgfSBmcm9tICduZXh0L3NlcnZlcic7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuXG4vKipcbiAqIEdFVCAvYXBpL2hvbWUtZmVlZD9maWx0ZXI9bmV3ZXN0fHRvcHxib29rbWFya3MmY3Vyc29yPWFiY1xuICpcbiAqIFJldHVybmVkIHNoYXBlOlxuICoge1xuICogICBpdGVtczogUHJvamVjdFtdLFxuICogICBuZXh0Q3Vyc29yOiBzdHJpbmcgfCBudWxsXG4gKiB9XG4gKi9cbmV4cG9ydCBjb25zdCByZXZhbGlkYXRlID0gMzA7ICAgICAgICAgIC8vIElTUiDigJMgcmVnZW5lcmF0ZSBKU09OIGV2ZXJ5IDMwIHNcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xuICBjb25zdCBmaWx0ZXIgPSBzZWFyY2hQYXJhbXMuZ2V0KCdmaWx0ZXInKSA/PyAnZm9sbG93aW5nJztcbiAgY29uc3QgY3Vyc29yID0gc2VhcmNoUGFyYW1zLmdldCgnY3Vyc29yJykgPz8gbnVsbDtcbiAgY29uc3QgY3Vyc29yVGlwc1BhcmFtID0gc2VhcmNoUGFyYW1zLmdldCgnY3Vyc29yVGlwcycpO1xuICBjb25zdCBwYWdlU2l6ZSA9IDEyO1xuXG4gIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KFxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCEsXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhLFxuICApO1xuXG4gIC8qIOKAk+KAk+KAk+KAk+KAkyBidWlsZCBhIHF1ZXJ5IHBlciByZXF1ZXN0ZWQgZmlsdGVyIOKAk+KAk+KAk+KAk+KAkyAqL1xuICBsZXQgcXVlcnkgPSBzdXBhYmFzZVxuICAgIC5mcm9tKCdwcm9qZWN0cycpXG4gICAgLnNlbGVjdCgnKicpXG4gICAgLmxpbWl0KHBhZ2VTaXplKTtcblxuICBpZiAoZmlsdGVyID09PSAndG9wJykge1xuICAgIHF1ZXJ5ID0gcXVlcnkub3JkZXIoJ3RpcHNfY2VudHMnLCB7IGFzY2VuZGluZzogZmFsc2UgfSk7XG4gIH1cbiAgcXVlcnkgPSBxdWVyeS5vcmRlcignY3JlYXRlZF9hdCcsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KS5vcmRlcignaWQnLCB7IGFzY2VuZGluZzogZmFsc2UgfSk7XG5cbiAgaWYgKGN1cnNvcikge1xuICAgIGNvbnN0IFtsYXN0Q3Vyc29yQ3JlYXRlZEF0LCBsYXN0Q3Vyc29ySWRdID0gY3Vyc29yLnNwbGl0KCdfJyk7XG4gICAgaWYgKGZpbHRlciA9PT0gJ3RvcCcpIHtcbiAgICAgIGNvbnN0IGxhc3RDdXJzb3JUaXBzID0gcGFyc2VGbG9hdChjdXJzb3JUaXBzUGFyYW0gfHwgJzAnKTtcbiAgICAgIHF1ZXJ5ID0gcXVlcnkub3IoXG4gICAgICAgIFtcbiAgICAgICAgICBgdGlwc19jZW50cy5sdC4ke2xhc3RDdXJzb3JUaXBzfWAsXG4gICAgICAgICAgYGFuZCh0aXBzX2NlbnRzLmVxLiR7bGFzdEN1cnNvclRpcHN9LGNyZWF0ZWRfYXQubHQuJHtsYXN0Q3Vyc29yQ3JlYXRlZEF0fSlgLFxuICAgICAgICAgIGBhbmQodGlwc19jZW50cy5lcS4ke2xhc3RDdXJzb3JUaXBzfSxjcmVhdGVkX2F0LmVxLiR7bGFzdEN1cnNvckNyZWF0ZWRBdH0saWQubHQuJHtsYXN0Q3Vyc29ySWR9KWAsXG4gICAgICAgIF0uam9pbignLCcpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeSA9IHF1ZXJ5Lm9yKFxuICAgICAgICBbXG4gICAgICAgICAgYGNyZWF0ZWRfYXQubHQuJHtsYXN0Q3Vyc29yQ3JlYXRlZEF0fWAsXG4gICAgICAgICAgYGFuZChjcmVhdGVkX2F0LmVxLiR7bGFzdEN1cnNvckNyZWF0ZWRBdH0saWQubHQuJHtsYXN0Q3Vyc29ySWR9KWAsXG4gICAgICAgIF0uam9pbignLCcpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qIOKAlOKAlOKAlCBib29rbWFya3Mg4oCU4oCU4oCUICovXG4gIGlmIChmaWx0ZXIgPT09ICdib29rbWFya3MnKSB7XG4gICAgY29uc3QgdXNlcklkID0gc2VhcmNoUGFyYW1zLmdldCgndWlkJyk7XG4gICAgY29uc3QgeyBkYXRhOiByb3dzLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdib29rbWFya3MnKVxuICAgICAgLnNlbGVjdCgncHJvamVjdF9pZCcpXG4gICAgICAuZXEoJ3VzZXJfaWQnLCB1c2VySWQpO1xuICAgIGlmIChlcnJvcikgcmV0dXJuIG5ldyBSZXNwb25zZShlcnJvci5tZXNzYWdlLCB7IHN0YXR1czogNTAwIH0pO1xuXG4gICAgY29uc3QgaWRzID0gcm93cz8ubWFwKChyKSA9PiByLnByb2plY3RfaWQpID8/IFtdO1xuICAgIGlmICghaWRzLmxlbmd0aCkgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBpdGVtczogW10sIG5leHRDdXJzb3I6IG51bGwgfSk7XG4gICAgcXVlcnkgPSBxdWVyeS5pbignaWQnLCBpZHMpO1xuICB9XG5cbiAgLyog4oCU4oCU4oCUIGZvbGxvd2luZyDigJTigJTigJQgKi9cbiAgaWYgKGZpbHRlciA9PT0gJ2ZvbGxvd2luZycpIHtcbiAgICBjb25zdCB1c2VySWQgPSBzZWFyY2hQYXJhbXMuZ2V0KCd1aWQnKTtcbiAgICBjb25zdCB7IGRhdGE6IHJvd3MsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2ZvbGxvd3MnKVxuICAgICAgLnNlbGVjdCgnZm9sbG93ZWVfaWQnKVxuICAgICAgLmVxKCdmb2xsb3dlcl9pZCcsIHVzZXJJZCk7XG4gICAgaWYgKGVycm9yKSByZXR1cm4gbmV3IFJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIHsgc3RhdHVzOiA1MDAgfSk7XG5cbiAgICBjb25zdCBmb2xsb3dJZHMgPSByb3dzPy5tYXAoKHIpID0+IHIuZm9sbG93ZWVfaWQpID8/IFtdO1xuICAgIGlmICghZm9sbG93SWRzLmxlbmd0aCkgcmV0dXJuIFJlc3BvbnNlLmpzb24oeyBpdGVtczogW10sIG5leHRDdXJzb3I6IG51bGwgfSk7XG4gICAgcXVlcnkgPSBxdWVyeS5pbignb3duZXJfaWQnLCBmb2xsb3dJZHMpO1xuICB9XG5cbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgcXVlcnk7XG4gIGlmIChlcnJvcikgcmV0dXJuIG5ldyBSZXNwb25zZShlcnJvci5tZXNzYWdlLCB7IHN0YXR1czogNTAwIH0pO1xuXG4gIGxldCBuZXh0Q3Vyc29yID0gbnVsbDtcbiAgbGV0IG5leHRDdXJzb3JUaXBzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPT09IHBhZ2VTaXplKSB7XG4gICAgY29uc3QgbGFzdEl0ZW0gPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgbmV4dEN1cnNvciA9IGAke2xhc3RJdGVtLmNyZWF0ZWRfYXR9XyR7bGFzdEl0ZW0uaWR9YDtcbiAgICBpZiAoZmlsdGVyID09PSAndG9wJykge1xuICAgICAgbmV4dEN1cnNvclRpcHMgPSBsYXN0SXRlbS50aXBzX2NlbnRzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBSZXNwb25zZS5qc29uKHtcbiAgICBpdGVtczogZGF0YSxcbiAgICBuZXh0Q3Vyc29yLFxuICAgIG5leHRDdXJzb3JUaXBzLFxuICB9KTtcbn0gIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsInJldmFsaWRhdGUiLCJHRVQiLCJyZXEiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJmaWx0ZXIiLCJnZXQiLCJjdXJzb3IiLCJjdXJzb3JUaXBzUGFyYW0iLCJwYWdlU2l6ZSIsInN1cGFiYXNlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwicXVlcnkiLCJmcm9tIiwic2VsZWN0IiwibGltaXQiLCJvcmRlciIsImFzY2VuZGluZyIsImxhc3RDdXJzb3JDcmVhdGVkQXQiLCJsYXN0Q3Vyc29ySWQiLCJzcGxpdCIsImxhc3RDdXJzb3JUaXBzIiwicGFyc2VGbG9hdCIsIm9yIiwiam9pbiIsInVzZXJJZCIsImRhdGEiLCJyb3dzIiwiZXJyb3IiLCJlcSIsIlJlc3BvbnNlIiwibWVzc2FnZSIsInN0YXR1cyIsImlkcyIsIm1hcCIsInIiLCJwcm9qZWN0X2lkIiwibGVuZ3RoIiwianNvbiIsIml0ZW1zIiwibmV4dEN1cnNvciIsImluIiwiZm9sbG93SWRzIiwiZm9sbG93ZWVfaWQiLCJuZXh0Q3Vyc29yVGlwcyIsImxhc3RJdGVtIiwiY3JlYXRlZF9hdCIsImlkIiwidGlwc19jZW50cyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/home-feed/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fhome-feed%2Froute&page=%2Fapi%2Fhome-feed%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fhome-feed%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fhome-feed%2Froute&page=%2Fapi%2Fhome-feed%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fhome-feed%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_dylanneal_Documents_Documents_Dylan_s_MacBook_Air_Professional_Technology_WebDev_eng_eng_com_app_api_home_feed_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/home-feed/route.ts */ \"(rsc)/./app/api/home-feed/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/home-feed/route\",\n        pathname: \"/api/home-feed\",\n        filename: \"route\",\n        bundlePath: \"app/api/home-feed/route\"\n    },\n    resolvedPagePath: \"/Users/dylanneal/Documents/Documents - Dylan’s MacBook Air/Professional/Technology/WebDev/eng/eng.com/app/api/home-feed/route.ts\",\n    nextConfigOutput,\n    userland: _Users_dylanneal_Documents_Documents_Dylan_s_MacBook_Air_Professional_Technology_WebDev_eng_eng_com_app_api_home_feed_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZob21lLWZlZWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmhvbWUtZmVlZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmhvbWUtZmVlZCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmR5bGFubmVhbCUyRkRvY3VtZW50cyUyRkRvY3VtZW50cyUyMC0lMjBEeWxhbiVFMiU4MCU5OXMlMjBNYWNCb29rJTIwQWlyJTJGUHJvZmVzc2lvbmFsJTJGVGVjaG5vbG9neSUyRldlYkRldiUyRmVuZyUyRmVuZy5jb20lMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGZHlsYW5uZWFsJTJGRG9jdW1lbnRzJTJGRG9jdW1lbnRzJTIwLSUyMER5bGFuJUUyJTgwJTk5cyUyME1hY0Jvb2slMjBBaXIlMkZQcm9mZXNzaW9uYWwlMkZUZWNobm9sb2d5JTJGV2ViRGV2JTJGZW5nJTJGZW5nLmNvbSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDZ0Y7QUFDN0o7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9keWxhbm5lYWwvRG9jdW1lbnRzL0RvY3VtZW50cyAtIER5bGFu4oCZcyBNYWNCb29rIEFpci9Qcm9mZXNzaW9uYWwvVGVjaG5vbG9neS9XZWJEZXYvZW5nL2VuZy5jb20vYXBwL2FwaS9ob21lLWZlZWQvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2hvbWUtZmVlZC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2hvbWUtZmVlZFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvaG9tZS1mZWVkL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2R5bGFubmVhbC9Eb2N1bWVudHMvRG9jdW1lbnRzIC0gRHlsYW7igJlzIE1hY0Jvb2sgQWlyL1Byb2Zlc3Npb25hbC9UZWNobm9sb2d5L1dlYkRldi9lbmcvZW5nLmNvbS9hcHAvYXBpL2hvbWUtZmVlZC9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fhome-feed%2Froute&page=%2Fapi%2Fhome-feed%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fhome-feed%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fhome-feed%2Froute&page=%2Fapi%2Fhome-feed%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fhome-feed%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();