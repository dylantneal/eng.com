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
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler),\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n/* harmony import */ var _next_auth_supabase_adapter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @next-auth/supabase-adapter */ \"(rsc)/./node_modules/@next-auth/supabase-adapter/dist/index.js\");\n\n\n\n\n\n\n// —————————————————————————————————————————————\n// Helper that returns a service-role Supabase client\n// (never used in the browser!)\n// —————————————————————————————————————————————\nfunction supabaseAdmin() {\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_5__.createClient)(\"https://ewbopfohuxlhhddtptka.supabase.co\", process.env.SUPABASE_SERVICE_ROLE_KEY);\n}\nconst supabaseUrl = \"https://ewbopfohuxlhhddtptka.supabase.co\";\nconst supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // <── preferred (server-side)\n ?? \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ym9wZm9odXhsaGhkZHRwdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTQ4NzAsImV4cCI6MjA2MzQzMDg3MH0.EhOaVCSP7upbI-j8H8Yjp4cPsuyoYU9cOhDaHPkNM-s\"; // dev fallback\n/** ── Auth.js / Next-Auth configuration ─────────────────────── */ const authOptions = {\n    /* build the adapter only if both pieces exist */ adapter: supabaseUrl && supabaseKey ? (0,_next_auth_supabase_adapter__WEBPACK_IMPORTED_MODULE_4__.SupabaseAdapter)({\n        url: supabaseUrl,\n        secret: supabaseKey\n    }) : undefined,\n    secret: process.env.NEXTAUTH_SECRET,\n    providers: [\n        // ── Email + password login ───────────────────────────\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_3__[\"default\"])({\n            name: 'Email',\n            credentials: {\n                email: {\n                    label: 'Email',\n                    type: 'email'\n                },\n                password: {\n                    label: 'Password',\n                    type: 'password'\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials.password) return null;\n                const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_5__.createClient)(\"https://ewbopfohuxlhhddtptka.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ym9wZm9odXhsaGhkZHRwdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTQ4NzAsImV4cCI6MjA2MzQzMDg3MH0.EhOaVCSP7upbI-j8H8Yjp4cPsuyoYU9cOhDaHPkNM-s\");\n                const { data, error } = await supabase.auth.signInWithPassword({\n                    email: credentials.email,\n                    password: credentials.password\n                });\n                if (error || !data.session || !data.user) return null;\n                return {\n                    id: data.user.id,\n                    email: data.user.email,\n                    name: data.user.user_metadata?.name ?? null\n                };\n            }\n        }),\n        // ── OAuth providers ─────────────────────────────────\n        (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            clientId: process.env.GITHUB_CLIENT_ID,\n            clientSecret: process.env.GITHUB_CLIENT_SECRET\n        }),\n        (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n            clientId: process.env.GOOGLE_CLIENT_ID,\n            clientSecret: process.env.GOOGLE_CLIENT_SECRET\n        })\n    ],\n    session: {\n        strategy: 'jwt'\n    },\n    callbacks: {\n        /**\n     * Inject the Supabase user id so the client can call\n     * `session.user.id` (used in ProjectUploader, etc.)\n     */ async session ({ session, token }) {\n            if (token.sub) session.user.id = token.sub;\n            return session;\n        }\n    }\n};\n// The App Router expects the handler to be exported as GET and POST\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQTJEO0FBQ0g7QUFDQTtBQUNVO0FBQ2I7QUFDUztBQUU5RCxnREFBZ0Q7QUFDaEQscURBQXFEO0FBQ3JELCtCQUErQjtBQUMvQixnREFBZ0Q7QUFDaEQsU0FBU007SUFDUCxPQUFPRixtRUFBWUEsQ0FDakJHLDBDQUFvQyxFQUNwQ0EsUUFBUUMsR0FBRyxDQUFDRSx5QkFBeUI7QUFFekM7QUFFQSxNQUFNQyxjQUFlSiwwQ0FBb0M7QUFDekQsTUFBTUssY0FDSkwsUUFBUUMsR0FBRyxDQUFDRSx5QkFBeUIsQ0FBSyw4QkFBOEI7SUFDckVILGtOQUF5QyxFQUFFLGVBQWU7QUFFL0QsaUVBQWlFLEdBQzFELE1BQU1PLGNBQStCO0lBQzFDLCtDQUErQyxHQUMvQ0MsU0FDRUosZUFBZUMsY0FDWFAsNEVBQWVBLENBQUM7UUFBRVcsS0FBS0w7UUFBYU0sUUFBUUw7SUFBWSxLQUN4RE07SUFDTkQsUUFBUVYsUUFBUUMsR0FBRyxDQUFDVyxlQUFlO0lBQ25DQyxXQUFXO1FBQ1Qsd0RBQXdEO1FBQ3hEakIsMkVBQW1CQSxDQUFDO1lBQ2xCa0IsTUFBTTtZQUNOQyxhQUFhO2dCQUNYQyxPQUFVO29CQUFFQyxPQUFPO29CQUFZQyxNQUFNO2dCQUFXO2dCQUNoREMsVUFBVTtvQkFBRUYsT0FBTztvQkFBWUMsTUFBTTtnQkFBVztZQUNsRDtZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxZQUFZSSxRQUFRLEVBQUUsT0FBTztnQkFFekQsTUFBTUUsV0FBV3hCLG1FQUFZQSxDQUMzQkcsMENBQW9DLEVBQ3BDQSxrTkFBeUM7Z0JBRzNDLE1BQU0sRUFBRXNCLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQUcsTUFBTUYsU0FBU0csSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQztvQkFDN0RULE9BQU9ELFlBQVlDLEtBQUs7b0JBQ3hCRyxVQUFVSixZQUFZSSxRQUFRO2dCQUNoQztnQkFDQSxJQUFJSSxTQUFTLENBQUNELEtBQUtJLE9BQU8sSUFBSSxDQUFDSixLQUFLSyxJQUFJLEVBQUUsT0FBTztnQkFFakQsT0FBTztvQkFDTEMsSUFBSU4sS0FBS0ssSUFBSSxDQUFDQyxFQUFFO29CQUNoQlosT0FBT00sS0FBS0ssSUFBSSxDQUFDWCxLQUFLO29CQUN0QkYsTUFBTVEsS0FBS0ssSUFBSSxDQUFDRSxhQUFhLEVBQUVmLFFBQVE7Z0JBQ3pDO1lBQ0Y7UUFDRjtRQUVBLHVEQUF1RDtRQUN2RHBCLHNFQUFjQSxDQUFDO1lBQ2JvQyxVQUFjOUIsUUFBUUMsR0FBRyxDQUFDOEIsZ0JBQWdCO1lBQzFDQyxjQUFjaEMsUUFBUUMsR0FBRyxDQUFDZ0Msb0JBQW9CO1FBQ2hEO1FBQ0F0QyxzRUFBY0EsQ0FBQztZQUNibUMsVUFBYzlCLFFBQVFDLEdBQUcsQ0FBQ2lDLGdCQUFnQjtZQUMxQ0YsY0FBY2hDLFFBQVFDLEdBQUcsQ0FBQ2tDLG9CQUFvQjtRQUNoRDtLQUNEO0lBQ0RULFNBQVM7UUFBRVUsVUFBVTtJQUFNO0lBQzNCQyxXQUFXO1FBQ1Q7OztLQUdDLEdBQ0QsTUFBTVgsU0FBUSxFQUFFQSxPQUFPLEVBQUVZLEtBQUssRUFBRTtZQUM5QixJQUFJQSxNQUFNQyxHQUFHLEVBQUUsUUFBU1osSUFBSSxDQUFTQyxFQUFFLEdBQUdVLE1BQU1DLEdBQUc7WUFDbkQsT0FBT2I7UUFDVDtJQUNGO0FBS0YsRUFBRTtBQUVGLG9FQUFvRTtBQUNwRSxNQUFNYyxVQUFVL0MsZ0RBQVFBLENBQUNjO0FBQ2tCIiwic291cmNlcyI6WyIvVXNlcnMvZHlsYW5uZWFsL0RvY3VtZW50cy9Eb2N1bWVudHMgLSBEeWxhbuKAmXMgTWFjQm9vayBBaXIvUHJvZmVzc2lvbmFsL1RlY2hub2xvZ3kvV2ViRGV2L2VuZy9lbmcuY29tL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCwgeyB0eXBlIE5leHRBdXRoT3B0aW9ucyB9IGZyb20gJ25leHQtYXV0aCc7XG5pbXBvcnQgR2l0SHViUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9naXRodWInO1xuaW1wb3J0IEdvb2dsZVByb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvZ29vZ2xlJztcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcbmltcG9ydCB7IFN1cGFiYXNlQWRhcHRlciB9IGZyb20gJ0BuZXh0LWF1dGgvc3VwYWJhc2UtYWRhcHRlcic7XG5cbi8vIOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlFxuLy8gSGVscGVyIHRoYXQgcmV0dXJucyBhIHNlcnZpY2Utcm9sZSBTdXBhYmFzZSBjbGllbnRcbi8vIChuZXZlciB1c2VkIGluIHRoZSBicm93c2VyISlcbi8vIOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlFxuZnVuY3Rpb24gc3VwYWJhc2VBZG1pbigpIHtcbiAgcmV0dXJuIGNyZWF0ZUNsaWVudChcbiAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwhLFxuICAgIHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkhLCAvLyBzZXJ2aWNlLXJvbGUga2V5XG4gICk7XG59XG5cbmNvbnN0IHN1cGFiYXNlVXJsICA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCE7XG5jb25zdCBzdXBhYmFzZUtleSAgPVxuICBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZICAgICAvLyA84pSA4pSAIHByZWZlcnJlZCAoc2VydmVyLXNpZGUpXG4gID8/IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZOyAvLyBkZXYgZmFsbGJhY2tcblxuLyoqIOKUgOKUgCBBdXRoLmpzIC8gTmV4dC1BdXRoIGNvbmZpZ3VyYXRpb24g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAICovXG5leHBvcnQgY29uc3QgYXV0aE9wdGlvbnM6IE5leHRBdXRoT3B0aW9ucyA9IHtcbiAgLyogYnVpbGQgdGhlIGFkYXB0ZXIgb25seSBpZiBib3RoIHBpZWNlcyBleGlzdCAqL1xuICBhZGFwdGVyOlxuICAgIHN1cGFiYXNlVXJsICYmIHN1cGFiYXNlS2V5XG4gICAgICA/IFN1cGFiYXNlQWRhcHRlcih7IHVybDogc3VwYWJhc2VVcmwsIHNlY3JldDogc3VwYWJhc2VLZXkgfSlcbiAgICAgIDogdW5kZWZpbmVkLFxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCEsXG4gIHByb3ZpZGVyczogW1xuICAgIC8vIOKUgOKUgCBFbWFpbCArIHBhc3N3b3JkIGxvZ2luIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogJ0VtYWlsJyxcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiAgICB7IGxhYmVsOiAnRW1haWwnLCAgICB0eXBlOiAnZW1haWwnICAgIH0sXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiAnUGFzc3dvcmQnLCB0eXBlOiAncGFzc3dvcmQnIH0sXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscy5wYXNzd29yZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoXG4gICAgICAgICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMISxcbiAgICAgICAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSEsICAgLy8gcHVibGljIGFub24ga2V5IGlzIGZpbmUgZm9yIHNpZ24taW5cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhQYXNzd29yZCh7XG4gICAgICAgICAgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChlcnJvciB8fCAhZGF0YS5zZXNzaW9uIHx8ICFkYXRhLnVzZXIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGRhdGEudXNlci5pZCxcbiAgICAgICAgICBlbWFpbDogZGF0YS51c2VyLmVtYWlsLFxuICAgICAgICAgIG5hbWU6IGRhdGEudXNlci51c2VyX21ldGFkYXRhPy5uYW1lID8/IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pLFxuXG4gICAgLy8g4pSA4pSAIE9BdXRoIHByb3ZpZGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgICBHaXRIdWJQcm92aWRlcih7XG4gICAgICBjbGllbnRJZDogICAgIHByb2Nlc3MuZW52LkdJVEhVQl9DTElFTlRfSUQhLFxuICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HSVRIVUJfQ0xJRU5UX1NFQ1JFVCEsXG4gICAgfSksXG4gICAgR29vZ2xlUHJvdmlkZXIoe1xuICAgICAgY2xpZW50SWQ6ICAgICBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEISxcbiAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR09PR0xFX0NMSUVOVF9TRUNSRVQhLFxuICAgIH0pLFxuICBdLFxuICBzZXNzaW9uOiB7IHN0cmF0ZWd5OiAnand0JyB9LFxuICBjYWxsYmFja3M6IHtcbiAgICAvKipcbiAgICAgKiBJbmplY3QgdGhlIFN1cGFiYXNlIHVzZXIgaWQgc28gdGhlIGNsaWVudCBjYW4gY2FsbFxuICAgICAqIGBzZXNzaW9uLnVzZXIuaWRgICh1c2VkIGluIFByb2plY3RVcGxvYWRlciwgZXRjLilcbiAgICAgKi9cbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHRva2VuLnN1YikgKHNlc3Npb24udXNlciBhcyBhbnkpLmlkID0gdG9rZW4uc3ViO1xuICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgfSxcbiAgfSxcbiAgLyoqXG4gICAqIFlvdSBjYW4gdW5jb21tZW50IGRlYnVnIGluIGxvY2FsIGRldiBpZiBuZWVkZWRcbiAgICogZGVidWc6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxuICAgKi9cbn07XG5cbi8vIFRoZSBBcHAgUm91dGVyIGV4cGVjdHMgdGhlIGhhbmRsZXIgdG8gYmUgZXhwb3J0ZWQgYXMgR0VUIGFuZCBQT1NUXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9OyAiXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJHaXRIdWJQcm92aWRlciIsIkdvb2dsZVByb3ZpZGVyIiwiQ3JlZGVudGlhbHNQcm92aWRlciIsImNyZWF0ZUNsaWVudCIsIlN1cGFiYXNlQWRhcHRlciIsInN1cGFiYXNlQWRtaW4iLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsInN1cGFiYXNlVXJsIiwic3VwYWJhc2VLZXkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsImF1dGhPcHRpb25zIiwiYWRhcHRlciIsInVybCIsInNlY3JldCIsInVuZGVmaW5lZCIsIk5FWFRBVVRIX1NFQ1JFVCIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJzdXBhYmFzZSIsImRhdGEiLCJlcnJvciIsImF1dGgiLCJzaWduSW5XaXRoUGFzc3dvcmQiLCJzZXNzaW9uIiwidXNlciIsImlkIiwidXNlcl9tZXRhZGF0YSIsImNsaWVudElkIiwiR0lUSFVCX0NMSUVOVF9JRCIsImNsaWVudFNlY3JldCIsIkdJVEhVQl9DTElFTlRfU0VDUkVUIiwiR09PR0xFX0NMSUVOVF9JRCIsIkdPT0dMRV9DTElFTlRfU0VDUkVUIiwic3RyYXRlZ3kiLCJjYWxsYmFja3MiLCJ0b2tlbiIsInN1YiIsImhhbmRsZXIiLCJHRVQiLCJQT1NUIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_dylanneal_Documents_Documents_Dylan_s_MacBook_Air_Professional_Technology_WebDev_eng_eng_com_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/dylanneal/Documents/Documents - Dylan’s MacBook Air/Professional/Technology/WebDev/eng/eng.com/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_dylanneal_Documents_Documents_Dylan_s_MacBook_Air_Professional_Technology_WebDev_eng_eng_com_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmR5bGFubmVhbCUyRkRvY3VtZW50cyUyRkRvY3VtZW50cyUyMC0lMjBEeWxhbiVFMiU4MCU5OXMlMjBNYWNCb29rJTIwQWlyJTJGUHJvZmVzc2lvbmFsJTJGVGVjaG5vbG9neSUyRldlYkRldiUyRmVuZyUyRmVuZy5jb20lMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGZHlsYW5uZWFsJTJGRG9jdW1lbnRzJTJGRG9jdW1lbnRzJTIwLSUyMER5bGFuJUUyJTgwJTk5cyUyME1hY0Jvb2slMjBBaXIlMkZQcm9mZXNzaW9uYWwlMkZUZWNobm9sb2d5JTJGV2ViRGV2JTJGZW5nJTJGZW5nLmNvbSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDeUY7QUFDdEs7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9keWxhbm5lYWwvRG9jdW1lbnRzL0RvY3VtZW50cyAtIER5bGFu4oCZcyBNYWNCb29rIEFpci9Qcm9mZXNzaW9uYWwvVGVjaG5vbG9neS9XZWJEZXYvZW5nL2VuZy5jb20vYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2R5bGFubmVhbC9Eb2N1bWVudHMvRG9jdW1lbnRzIC0gRHlsYW7igJlzIE1hY0Jvb2sgQWlyL1Byb2Zlc3Npb25hbC9UZWNobm9sb2d5L1dlYkRldi9lbmcvZW5nLmNvbS9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

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

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

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

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

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

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

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
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions","vendor-chunks/jose","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/@next-auth","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();