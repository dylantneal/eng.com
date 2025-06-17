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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _lib_authOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/authOptions */ \"(rsc)/./lib/authOptions.ts\");\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()(_lib_authOptions__WEBPACK_IMPORTED_MODULE_1__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFpQztBQUNlO0FBRWhELE1BQU1FLFVBQVVGLGdEQUFRQSxDQUFDQyx5REFBV0E7QUFFTyIsInNvdXJjZXMiOlsiL1VzZXJzL2R5bGFubmVhbC9Eb2N1bWVudHMvRG9jdW1lbnRzIC0gRHlsYW7igJlzIE1hY0Jvb2sgQWlyL1Byb2Zlc3Npb25hbC9UZWNobm9sb2d5L1dlYkRldi9lbmcvZW5nLmNvbS9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTmV4dEF1dGggZnJvbSAnbmV4dC1hdXRoJztcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnQC9saWIvYXV0aE9wdGlvbnMnO1xuXG5jb25zdCBoYW5kbGVyID0gTmV4dEF1dGgoYXV0aE9wdGlvbnMpO1xuXG5leHBvcnQgeyBoYW5kbGVyIGFzIEdFVCwgaGFuZGxlciBhcyBQT1NUIH07ICJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsImF1dGhPcHRpb25zIiwiaGFuZGxlciIsIkdFVCIsIlBPU1QiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/authOptions.ts":
/*!****************************!*\
  !*** ./lib/authOptions.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var _next_auth_supabase_adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @next-auth/supabase-adapter */ \"(rsc)/./node_modules/@next-auth/supabase-adapter/dist/index.js\");\n/* harmony import */ var next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/google */ \"(rsc)/./node_modules/next-auth/providers/google.js\");\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./env */ \"(rsc)/./lib/env.ts\");\n\n\n\n\n\n\n\n// Create Supabase client for auth operations\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_6__.createClient)(_env__WEBPACK_IMPORTED_MODULE_5__.env.NEXT_PUBLIC_SUPABASE_URL, _env__WEBPACK_IMPORTED_MODULE_5__.env.SUPABASE_SERVICE_ROLE_KEY, {\n    auth: {\n        autoRefreshToken: false,\n        persistSession: false\n    }\n});\nconst authOptions = {\n    adapter: (0,_next_auth_supabase_adapter__WEBPACK_IMPORTED_MODULE_0__.SupabaseAdapter)({\n        url: _env__WEBPACK_IMPORTED_MODULE_5__.env.NEXT_PUBLIC_SUPABASE_URL,\n        secret: _env__WEBPACK_IMPORTED_MODULE_5__.env.SUPABASE_SERVICE_ROLE_KEY\n    }),\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_3__[\"default\"])({\n            name: 'credentials',\n            credentials: {\n                email: {\n                    label: 'Email',\n                    type: 'email',\n                    placeholder: 'engineer@example.com'\n                },\n                password: {\n                    label: 'Password',\n                    type: 'password'\n                },\n                action: {\n                    label: 'Action',\n                    type: 'text'\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error('Email and password are required');\n                }\n                const email = credentials.email.toLowerCase().trim();\n                const { password, action } = credentials;\n                try {\n                    if (action === 'signup') {\n                        // Handle signup\n                        return await handleSignup(email, password);\n                    } else {\n                        // Handle signin\n                        return await handleSignin(email, password);\n                    }\n                } catch (error) {\n                    console.error('Auth error:', error);\n                    throw error;\n                }\n            }\n        }),\n        ...process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && !process.env.GOOGLE_CLIENT_ID.includes('your_google') ? [\n            (0,next_auth_providers_google__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n                clientId: process.env.GOOGLE_CLIENT_ID,\n                clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n                profile (profile) {\n                    return {\n                        id: profile.sub,\n                        name: profile.name,\n                        email: profile.email,\n                        image: profile.picture,\n                        username: profile.email.split('@')[0],\n                        email_verified: profile.email_verified\n                    };\n                }\n            })\n        ] : [],\n        ...process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && !process.env.GITHUB_CLIENT_ID.includes('your_github') ? [\n            (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_2__[\"default\"])({\n                clientId: process.env.GITHUB_CLIENT_ID,\n                clientSecret: process.env.GITHUB_CLIENT_SECRET,\n                profile (profile) {\n                    return {\n                        id: profile.id.toString(),\n                        name: profile.name || profile.login,\n                        email: profile.email,\n                        image: profile.avatar_url,\n                        username: profile.login,\n                        email_verified: true\n                    };\n                }\n            })\n        ] : []\n    ],\n    pages: {\n        signIn: '/signin',\n        error: '/auth/error',\n        newUser: '/auth/welcome'\n    },\n    callbacks: {\n        async signIn ({ user, account, profile }) {\n            // For OAuth providers, ensure we have required data\n            if (account?.provider === 'google') {\n                return profile?.email_verified === true;\n            }\n            if (account?.provider === 'github') {\n                return true; // GitHub emails are considered verified\n            }\n            // For credentials, user has already been validated in authorize\n            return true;\n        },\n        async jwt ({ token, user, account, trigger }) {\n            // On signin, fetch fresh user data from database\n            if (user) {\n                token.id = user.id;\n                token.email = user.email;\n                token.username = user.username;\n                token.email_verified = user.email_verified || false;\n            }\n            // On session update, refresh user data\n            if (trigger === 'update' && token.id) {\n                const { data: profile } = await supabase.from('profiles').select('username, display_name, plan, is_verified, profile_complete').eq('id', token.id).single();\n                if (profile) {\n                    token.username = profile.username;\n                    token.display_name = profile.display_name;\n                    token.plan = profile.plan;\n                    token.is_verified = profile.is_verified;\n                    token.profile_complete = profile.profile_complete;\n                }\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            // Send properties to the client\n            if (token && session.user) {\n                session.user.id = token.id;\n                session.user.username = token.username;\n                session.user.display_name = token.display_name;\n                session.user.plan = token.plan || 'FREE';\n                session.user.is_verified = token.is_verified || false;\n                session.user.email_verified = token.email_verified || false;\n                session.user.profile_complete = token.profile_complete || false;\n            }\n            return session;\n        }\n    },\n    events: {\n        async signIn ({ user, account, profile, isNewUser }) {\n            console.log(`User ${user.email} signed in via ${account?.provider}`);\n            // Update last_active timestamp\n            if (user.id) {\n                await supabase.from('profiles').update({\n                    last_active: new Date().toISOString()\n                }).eq('id', user.id);\n            }\n        },\n        async createUser ({ user }) {\n            console.log(`New user created: ${user.email}`);\n        // Profile creation is handled by the database trigger\n        }\n    },\n    debug: \"development\" === 'development',\n    secret: _env__WEBPACK_IMPORTED_MODULE_5__.env.NEXTAUTH_SECRET,\n    session: {\n        strategy: 'jwt',\n        maxAge: 24 * 60 * 60\n    }\n};\n// Helper function for signup\nasync function handleSignup(email, password) {\n    // Check if user already exists\n    const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single();\n    if (existingUser) {\n        throw new Error('User already exists with this email');\n    }\n    // Hash the password\n    const hashedPassword = await bcryptjs__WEBPACK_IMPORTED_MODULE_4__[\"default\"].hash(password, 12);\n    // Create user in Supabase Auth\n    const { data: authData, error: authError } = await supabase.auth.admin.createUser({\n        email,\n        password,\n        email_confirm: true,\n        user_metadata: {\n            username: email.split('@')[0],\n            display_name: email.split('@')[0]\n        }\n    });\n    if (authError) {\n        throw new Error(authError.message);\n    }\n    if (!authData.user) {\n        throw new Error('Failed to create user');\n    }\n    // The profile will be created automatically by the database trigger\n    // Return user object for NextAuth\n    return {\n        id: authData.user.id,\n        email: authData.user.email,\n        name: email.split('@')[0],\n        username: email.split('@')[0],\n        email_verified: true\n    };\n}\n// Helper function for signin\nasync function handleSignin(email, password) {\n    // Try to sign in with Supabase Auth\n    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({\n        email,\n        password\n    });\n    if (authError) {\n        throw new Error('Invalid email or password');\n    }\n    if (!authData.user) {\n        throw new Error('Authentication failed');\n    }\n    // Get user profile data\n    const { data: profile } = await supabase.from('profiles').select('username, display_name, plan, is_verified, profile_complete').eq('id', authData.user.id).single();\n    // Return user object for NextAuth\n    return {\n        id: authData.user.id,\n        email: authData.user.email,\n        name: profile?.display_name || profile?.username || email.split('@')[0],\n        username: profile?.username || email.split('@')[0],\n        plan: profile?.plan || 'FREE',\n        is_verified: profile?.is_verified || false,\n        email_verified: true,\n        profile_complete: profile?.profile_complete || false\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aE9wdGlvbnMudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDOEQ7QUFDTjtBQUNBO0FBQ1U7QUFDYjtBQUN2QjtBQUNGO0FBRTVCLDZDQUE2QztBQUM3QyxNQUFNTyxXQUFXSCxtRUFBWUEsQ0FDM0JFLHFDQUFHQSxDQUFDRSx3QkFBd0IsRUFDNUJGLHFDQUFHQSxDQUFDRyx5QkFBeUIsRUFDN0I7SUFDRUMsTUFBTTtRQUNKQyxrQkFBa0I7UUFDbEJDLGdCQUFnQjtJQUNsQjtBQUNGO0FBR0ssTUFBTUMsY0FBMkI7SUFDdENDLFNBQVNkLDRFQUFlQSxDQUFDO1FBQ3ZCZSxLQUFLVCxxQ0FBR0EsQ0FBQ0Usd0JBQXdCO1FBQ2pDUSxRQUFRVixxQ0FBR0EsQ0FBQ0cseUJBQXlCO0lBQ3ZDO0lBQ0FRLFdBQVc7UUFDVGQsMkVBQW1CQSxDQUFDO1lBQ2xCZSxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07b0JBQVNDLGFBQWE7Z0JBQXVCO2dCQUM1RUMsVUFBVTtvQkFBRUgsT0FBTztvQkFBWUMsTUFBTTtnQkFBVztnQkFDaERHLFFBQVE7b0JBQUVKLE9BQU87b0JBQVVDLE1BQU07Z0JBQU87WUFDMUM7WUFDQSxNQUFNSSxXQUFVUCxXQUFXO2dCQUN6QixJQUFJLENBQUNBLGFBQWFDLFNBQVMsQ0FBQ0QsYUFBYUssVUFBVTtvQkFDakQsTUFBTSxJQUFJRyxNQUFNO2dCQUNsQjtnQkFFQSxNQUFNUCxRQUFRRCxZQUFZQyxLQUFLLENBQUNRLFdBQVcsR0FBR0MsSUFBSTtnQkFDbEQsTUFBTSxFQUFFTCxRQUFRLEVBQUVDLE1BQU0sRUFBRSxHQUFHTjtnQkFFN0IsSUFBSTtvQkFDRixJQUFJTSxXQUFXLFVBQVU7d0JBQ3ZCLGdCQUFnQjt3QkFDaEIsT0FBTyxNQUFNSyxhQUFhVixPQUFPSTtvQkFDbkMsT0FBTzt3QkFDTCxnQkFBZ0I7d0JBQ2hCLE9BQU8sTUFBTU8sYUFBYVgsT0FBT0k7b0JBQ25DO2dCQUNGLEVBQUUsT0FBT1EsT0FBTztvQkFDZEMsUUFBUUQsS0FBSyxDQUFDLGVBQWVBO29CQUM3QixNQUFNQTtnQkFDUjtZQUNGO1FBQ0Y7V0FDSUUsUUFBUTVCLEdBQUcsQ0FBQzZCLGdCQUFnQixJQUM1QkQsUUFBUTVCLEdBQUcsQ0FBQzhCLG9CQUFvQixJQUNoQyxDQUFDRixRQUFRNUIsR0FBRyxDQUFDNkIsZ0JBQWdCLENBQUNFLFFBQVEsQ0FBQyxpQkFBaUI7WUFDMURwQyxzRUFBY0EsQ0FBQztnQkFDYnFDLFVBQVVKLFFBQVE1QixHQUFHLENBQUM2QixnQkFBZ0I7Z0JBQ3RDSSxjQUFjTCxRQUFRNUIsR0FBRyxDQUFDOEIsb0JBQW9CO2dCQUM5Q0ksU0FBUUEsT0FBTztvQkFDYixPQUFPO3dCQUNMQyxJQUFJRCxRQUFRRSxHQUFHO3dCQUNmeEIsTUFBTXNCLFFBQVF0QixJQUFJO3dCQUNsQkUsT0FBT29CLFFBQVFwQixLQUFLO3dCQUNwQnVCLE9BQU9ILFFBQVFJLE9BQU87d0JBQ3RCQyxVQUFVTCxRQUFRcEIsS0FBSyxDQUFDMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNyQ0MsZ0JBQWdCUCxRQUFRTyxjQUFjO29CQUN4QztnQkFDRjtZQUNGO1NBQ0QsR0FBRyxFQUFFO1dBQ0ZiLFFBQVE1QixHQUFHLENBQUMwQyxnQkFBZ0IsSUFDNUJkLFFBQVE1QixHQUFHLENBQUMyQyxvQkFBb0IsSUFDaEMsQ0FBQ2YsUUFBUTVCLEdBQUcsQ0FBQzBDLGdCQUFnQixDQUFDWCxRQUFRLENBQUMsaUJBQWlCO1lBQzFEbkMsc0VBQWNBLENBQUM7Z0JBQ2JvQyxVQUFVSixRQUFRNUIsR0FBRyxDQUFDMEMsZ0JBQWdCO2dCQUN0Q1QsY0FBY0wsUUFBUTVCLEdBQUcsQ0FBQzJDLG9CQUFvQjtnQkFDOUNULFNBQVFBLE9BQU87b0JBQ2IsT0FBTzt3QkFDTEMsSUFBSUQsUUFBUUMsRUFBRSxDQUFDUyxRQUFRO3dCQUN2QmhDLE1BQU1zQixRQUFRdEIsSUFBSSxJQUFJc0IsUUFBUVcsS0FBSzt3QkFDbkMvQixPQUFPb0IsUUFBUXBCLEtBQUs7d0JBQ3BCdUIsT0FBT0gsUUFBUVksVUFBVTt3QkFDekJQLFVBQVVMLFFBQVFXLEtBQUs7d0JBQ3ZCSixnQkFBZ0I7b0JBQ2xCO2dCQUNGO1lBQ0Y7U0FDRCxHQUFHLEVBQUU7S0FDUDtJQUNETSxPQUFPO1FBQ0xDLFFBQVE7UUFDUnRCLE9BQU87UUFDUHVCLFNBQVM7SUFDWDtJQUNBQyxXQUFXO1FBQ1QsTUFBTUYsUUFBTyxFQUFFRyxJQUFJLEVBQUVDLE9BQU8sRUFBRWxCLE9BQU8sRUFBRTtZQUNyQyxvREFBb0Q7WUFDcEQsSUFBSWtCLFNBQVNDLGFBQWEsVUFBVTtnQkFDbEMsT0FBTyxTQUFrQlosbUJBQW1CO1lBQzlDO1lBRUEsSUFBSVcsU0FBU0MsYUFBYSxVQUFVO2dCQUNsQyxPQUFPLE1BQU0sd0NBQXdDO1lBQ3ZEO1lBRUEsZ0VBQWdFO1lBQ2hFLE9BQU87UUFDVDtRQUVBLE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFSixJQUFJLEVBQUVDLE9BQU8sRUFBRUksT0FBTyxFQUFFO1lBQ3pDLGlEQUFpRDtZQUNqRCxJQUFJTCxNQUFNO2dCQUNSSSxNQUFNcEIsRUFBRSxHQUFHZ0IsS0FBS2hCLEVBQUU7Z0JBQ2xCb0IsTUFBTXpDLEtBQUssR0FBR3FDLEtBQUtyQyxLQUFLO2dCQUN4QnlDLE1BQU1oQixRQUFRLEdBQUcsS0FBY0EsUUFBUTtnQkFDdkNnQixNQUFNZCxjQUFjLEdBQUcsS0FBY0EsY0FBYyxJQUFJO1lBQ3pEO1lBRUEsdUNBQXVDO1lBQ3ZDLElBQUllLFlBQVksWUFBWUQsTUFBTXBCLEVBQUUsRUFBRTtnQkFDcEMsTUFBTSxFQUFFc0IsTUFBTXZCLE9BQU8sRUFBRSxHQUFHLE1BQU1qQyxTQUM3QnlELElBQUksQ0FBQyxZQUNMQyxNQUFNLENBQUMsK0RBQ1BDLEVBQUUsQ0FBQyxNQUFNTCxNQUFNcEIsRUFBRSxFQUNqQjBCLE1BQU07Z0JBRVQsSUFBSTNCLFNBQVM7b0JBQ1hxQixNQUFNaEIsUUFBUSxHQUFHTCxRQUFRSyxRQUFRO29CQUNqQ2dCLE1BQU1PLFlBQVksR0FBRzVCLFFBQVE0QixZQUFZO29CQUN6Q1AsTUFBTVEsSUFBSSxHQUFHN0IsUUFBUTZCLElBQUk7b0JBQ3pCUixNQUFNUyxXQUFXLEdBQUc5QixRQUFROEIsV0FBVztvQkFDdkNULE1BQU1VLGdCQUFnQixHQUFHL0IsUUFBUStCLGdCQUFnQjtnQkFDbkQ7WUFDRjtZQUVBLE9BQU9WO1FBQ1Q7UUFFQSxNQUFNVyxTQUFRLEVBQUVBLE9BQU8sRUFBRVgsS0FBSyxFQUFFO1lBQzlCLGdDQUFnQztZQUNoQyxJQUFJQSxTQUFTVyxRQUFRZixJQUFJLEVBQUU7Z0JBQ3hCZSxRQUFRZixJQUFJLENBQVNoQixFQUFFLEdBQUdvQixNQUFNcEIsRUFBRTtnQkFDbEMrQixRQUFRZixJQUFJLENBQVNaLFFBQVEsR0FBR2dCLE1BQU1oQixRQUFRO2dCQUM5QzJCLFFBQVFmLElBQUksQ0FBU1csWUFBWSxHQUFHUCxNQUFNTyxZQUFZO2dCQUN0REksUUFBUWYsSUFBSSxDQUFTWSxJQUFJLEdBQUdSLE1BQU1RLElBQUksSUFBSTtnQkFDMUNHLFFBQVFmLElBQUksQ0FBU2EsV0FBVyxHQUFHVCxNQUFNUyxXQUFXLElBQUk7Z0JBQ3hERSxRQUFRZixJQUFJLENBQVNWLGNBQWMsR0FBR2MsTUFBTWQsY0FBYyxJQUFJO2dCQUM5RHlCLFFBQVFmLElBQUksQ0FBU2MsZ0JBQWdCLEdBQUdWLE1BQU1VLGdCQUFnQixJQUFJO1lBQ3JFO1lBRUEsT0FBT0M7UUFDVDtJQUNGO0lBQ0FDLFFBQVE7UUFDTixNQUFNbkIsUUFBTyxFQUFFRyxJQUFJLEVBQUVDLE9BQU8sRUFBRWxCLE9BQU8sRUFBRWtDLFNBQVMsRUFBRTtZQUNoRHpDLFFBQVEwQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUVsQixLQUFLckMsS0FBSyxDQUFDLGVBQWUsRUFBRXNDLFNBQVNDLFVBQVU7WUFFbkUsK0JBQStCO1lBQy9CLElBQUlGLEtBQUtoQixFQUFFLEVBQUU7Z0JBQ1gsTUFBTWxDLFNBQ0h5RCxJQUFJLENBQUMsWUFDTFksTUFBTSxDQUFDO29CQUFFQyxhQUFhLElBQUlDLE9BQU9DLFdBQVc7Z0JBQUcsR0FDL0NiLEVBQUUsQ0FBQyxNQUFNVCxLQUFLaEIsRUFBRTtZQUNyQjtRQUNGO1FBRUEsTUFBTXVDLFlBQVcsRUFBRXZCLElBQUksRUFBRTtZQUN2QnhCLFFBQVEwQyxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsRUFBRWxCLEtBQUtyQyxLQUFLLEVBQUU7UUFDN0Msc0RBQXNEO1FBQ3hEO0lBQ0Y7SUFDQTZELE9BQU8vQyxrQkFBeUI7SUFDaENsQixRQUFRVixxQ0FBR0EsQ0FBQzRFLGVBQWU7SUFDM0JWLFNBQVM7UUFDUFcsVUFBVTtRQUNWQyxRQUFRLEtBQUssS0FBSztJQUNwQjtBQUNGLEVBQUU7QUFFRiw2QkFBNkI7QUFDN0IsZUFBZXRELGFBQWFWLEtBQWEsRUFBRUksUUFBZ0I7SUFDekQsK0JBQStCO0lBQy9CLE1BQU0sRUFBRXVDLE1BQU1zQixZQUFZLEVBQUUsR0FBRyxNQUFNOUUsU0FDbEN5RCxJQUFJLENBQUMsWUFDTEMsTUFBTSxDQUFDLE1BQ1BDLEVBQUUsQ0FBQyxTQUFTOUMsT0FDWitDLE1BQU07SUFFVCxJQUFJa0IsY0FBYztRQUNoQixNQUFNLElBQUkxRCxNQUFNO0lBQ2xCO0lBRUEsb0JBQW9CO0lBQ3BCLE1BQU0yRCxpQkFBaUIsTUFBTWpGLHFEQUFXLENBQUNtQixVQUFVO0lBRW5ELCtCQUErQjtJQUMvQixNQUFNLEVBQUV1QyxNQUFNeUIsUUFBUSxFQUFFeEQsT0FBT3lELFNBQVMsRUFBRSxHQUFHLE1BQU1sRixTQUFTRyxJQUFJLENBQUNnRixLQUFLLENBQUNWLFVBQVUsQ0FBQztRQUNoRjVEO1FBQ0FJO1FBQ0FtRSxlQUFlO1FBQ2ZDLGVBQWU7WUFDYi9DLFVBQVV6QixNQUFNMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdCc0IsY0FBY2hELE1BQU0wQixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkM7SUFDRjtJQUVBLElBQUkyQyxXQUFXO1FBQ2IsTUFBTSxJQUFJOUQsTUFBTThELFVBQVVJLE9BQU87SUFDbkM7SUFFQSxJQUFJLENBQUNMLFNBQVMvQixJQUFJLEVBQUU7UUFDbEIsTUFBTSxJQUFJOUIsTUFBTTtJQUNsQjtJQUVBLG9FQUFvRTtJQUNwRSxrQ0FBa0M7SUFDbEMsT0FBTztRQUNMYyxJQUFJK0MsU0FBUy9CLElBQUksQ0FBQ2hCLEVBQUU7UUFDcEJyQixPQUFPb0UsU0FBUy9CLElBQUksQ0FBQ3JDLEtBQUs7UUFDMUJGLE1BQU1FLE1BQU0wQixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDekJELFVBQVV6QixNQUFNMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzdCQyxnQkFBZ0I7SUFDbEI7QUFDRjtBQUVBLDZCQUE2QjtBQUM3QixlQUFlaEIsYUFBYVgsS0FBYSxFQUFFSSxRQUFnQjtJQUN6RCxvQ0FBb0M7SUFDcEMsTUFBTSxFQUFFdUMsTUFBTXlCLFFBQVEsRUFBRXhELE9BQU95RCxTQUFTLEVBQUUsR0FBRyxNQUFNbEYsU0FBU0csSUFBSSxDQUFDb0Ysa0JBQWtCLENBQUM7UUFDbEYxRTtRQUNBSTtJQUNGO0lBRUEsSUFBSWlFLFdBQVc7UUFDYixNQUFNLElBQUk5RCxNQUFNO0lBQ2xCO0lBRUEsSUFBSSxDQUFDNkQsU0FBUy9CLElBQUksRUFBRTtRQUNsQixNQUFNLElBQUk5QixNQUFNO0lBQ2xCO0lBRUEsd0JBQXdCO0lBQ3hCLE1BQU0sRUFBRW9DLE1BQU12QixPQUFPLEVBQUUsR0FBRyxNQUFNakMsU0FDN0J5RCxJQUFJLENBQUMsWUFDTEMsTUFBTSxDQUFDLCtEQUNQQyxFQUFFLENBQUMsTUFBTXNCLFNBQVMvQixJQUFJLENBQUNoQixFQUFFLEVBQ3pCMEIsTUFBTTtJQUVULGtDQUFrQztJQUNsQyxPQUFPO1FBQ0wxQixJQUFJK0MsU0FBUy9CLElBQUksQ0FBQ2hCLEVBQUU7UUFDcEJyQixPQUFPb0UsU0FBUy9CLElBQUksQ0FBQ3JDLEtBQUs7UUFDMUJGLE1BQU1zQixTQUFTNEIsZ0JBQWdCNUIsU0FBU0ssWUFBWXpCLE1BQU0wQixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDdkVELFVBQVVMLFNBQVNLLFlBQVl6QixNQUFNMEIsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2xEdUIsTUFBTTdCLFNBQVM2QixRQUFRO1FBQ3ZCQyxhQUFhOUIsU0FBUzhCLGVBQWU7UUFDckN2QixnQkFBZ0I7UUFDaEJ3QixrQkFBa0IvQixTQUFTK0Isb0JBQW9CO0lBQ2pEO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9keWxhbm5lYWwvRG9jdW1lbnRzL0RvY3VtZW50cyAtIER5bGFu4oCZcyBNYWNCb29rIEFpci9Qcm9mZXNzaW9uYWwvVGVjaG5vbG9neS9XZWJEZXYvZW5nL2VuZy5jb20vbGliL2F1dGhPcHRpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF1dGhPcHRpb25zIH0gZnJvbSAnbmV4dC1hdXRoJztcbmltcG9ydCB7IFN1cGFiYXNlQWRhcHRlciB9IGZyb20gJ0BuZXh0LWF1dGgvc3VwYWJhc2UtYWRhcHRlcic7XG5pbXBvcnQgR29vZ2xlUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9nb29nbGUnO1xuaW1wb3J0IEdpdEh1YlByb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvZ2l0aHViJztcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgZW52IH0gZnJvbSAnLi9lbnYnO1xuXG4vLyBDcmVhdGUgU3VwYWJhc2UgY2xpZW50IGZvciBhdXRoIG9wZXJhdGlvbnNcbmNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KFxuICBlbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMLFxuICBlbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSxcbiAge1xuICAgIGF1dGg6IHtcbiAgICAgIGF1dG9SZWZyZXNoVG9rZW46IGZhbHNlLFxuICAgICAgcGVyc2lzdFNlc3Npb246IGZhbHNlLFxuICAgIH0sXG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogQXV0aE9wdGlvbnMgPSB7XG4gIGFkYXB0ZXI6IFN1cGFiYXNlQWRhcHRlcih7XG4gICAgdXJsOiBlbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMLFxuICAgIHNlY3JldDogZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVksXG4gIH0pLFxuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6ICdjcmVkZW50aWFscycsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogJ0VtYWlsJywgdHlwZTogJ2VtYWlsJywgcGxhY2Vob2xkZXI6ICdlbmdpbmVlckBleGFtcGxlLmNvbScgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6ICdQYXNzd29yZCcsIHR5cGU6ICdwYXNzd29yZCcgfSxcbiAgICAgICAgYWN0aW9uOiB7IGxhYmVsOiAnQWN0aW9uJywgdHlwZTogJ3RleHQnIH0sIC8vICdzaWduaW4nIG9yICdzaWdudXAnXG4gICAgICB9LFxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VtYWlsIGFuZCBwYXNzd29yZCBhcmUgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVtYWlsID0gY3JlZGVudGlhbHMuZW1haWwudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICAgIGNvbnN0IHsgcGFzc3dvcmQsIGFjdGlvbiB9ID0gY3JlZGVudGlhbHM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoYWN0aW9uID09PSAnc2lnbnVwJykge1xuICAgICAgICAgICAgLy8gSGFuZGxlIHNpZ251cFxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZVNpZ251cChlbWFpbCwgcGFzc3dvcmQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgc2lnbmluXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlU2lnbmluKGVtYWlsLCBwYXNzd29yZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dGggZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICAgIC4uLihwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lEICYmIFxuICAgICAgICBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX1NFQ1JFVCAmJiBcbiAgICAgICAgIXByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfSUQuaW5jbHVkZXMoJ3lvdXJfZ29vZ2xlJykgPyBbXG4gICAgICBHb29nbGVQcm92aWRlcih7XG4gICAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0lELFxuICAgICAgICBjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfU0VDUkVULFxuICAgICAgICBwcm9maWxlKHByb2ZpbGUpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHByb2ZpbGUuc3ViLFxuICAgICAgICAgICAgbmFtZTogcHJvZmlsZS5uYW1lLFxuICAgICAgICAgICAgZW1haWw6IHByb2ZpbGUuZW1haWwsXG4gICAgICAgICAgICBpbWFnZTogcHJvZmlsZS5waWN0dXJlLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHByb2ZpbGUuZW1haWwuc3BsaXQoJ0AnKVswXSxcbiAgICAgICAgICAgIGVtYWlsX3ZlcmlmaWVkOiBwcm9maWxlLmVtYWlsX3ZlcmlmaWVkLFxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIF0gOiBbXSksXG4gICAgLi4uKHByb2Nlc3MuZW52LkdJVEhVQl9DTElFTlRfSUQgJiYgXG4gICAgICAgIHByb2Nlc3MuZW52LkdJVEhVQl9DTElFTlRfU0VDUkVUICYmXG4gICAgICAgICFwcm9jZXNzLmVudi5HSVRIVUJfQ0xJRU5UX0lELmluY2x1ZGVzKCd5b3VyX2dpdGh1YicpID8gW1xuICAgICAgR2l0SHViUHJvdmlkZXIoe1xuICAgICAgICBjbGllbnRJZDogcHJvY2Vzcy5lbnYuR0lUSFVCX0NMSUVOVF9JRCxcbiAgICAgICAgY2xpZW50U2VjcmV0OiBwcm9jZXNzLmVudi5HSVRIVUJfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgcHJvZmlsZShwcm9maWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBwcm9maWxlLmlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBuYW1lOiBwcm9maWxlLm5hbWUgfHwgcHJvZmlsZS5sb2dpbixcbiAgICAgICAgICAgIGVtYWlsOiBwcm9maWxlLmVtYWlsLFxuICAgICAgICAgICAgaW1hZ2U6IHByb2ZpbGUuYXZhdGFyX3VybCxcbiAgICAgICAgICAgIHVzZXJuYW1lOiBwcm9maWxlLmxvZ2luLFxuICAgICAgICAgICAgZW1haWxfdmVyaWZpZWQ6IHRydWUsIC8vIEdpdEh1YiBlbWFpbHMgYXJlIGNvbnNpZGVyZWQgdmVyaWZpZWRcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICBdIDogW10pLFxuICBdLFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9zaWduaW4nLFxuICAgIGVycm9yOiAnL2F1dGgvZXJyb3InLFxuICAgIG5ld1VzZXI6ICcvYXV0aC93ZWxjb21lJyxcbiAgfSxcbiAgY2FsbGJhY2tzOiB7XG4gICAgYXN5bmMgc2lnbkluKHsgdXNlciwgYWNjb3VudCwgcHJvZmlsZSB9KSB7XG4gICAgICAvLyBGb3IgT0F1dGggcHJvdmlkZXJzLCBlbnN1cmUgd2UgaGF2ZSByZXF1aXJlZCBkYXRhXG4gICAgICBpZiAoYWNjb3VudD8ucHJvdmlkZXIgPT09ICdnb29nbGUnKSB7XG4gICAgICAgIHJldHVybiAocHJvZmlsZSBhcyBhbnkpPy5lbWFpbF92ZXJpZmllZCA9PT0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGFjY291bnQ/LnByb3ZpZGVyID09PSAnZ2l0aHViJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gR2l0SHViIGVtYWlscyBhcmUgY29uc2lkZXJlZCB2ZXJpZmllZFxuICAgICAgfVxuXG4gICAgICAvLyBGb3IgY3JlZGVudGlhbHMsIHVzZXIgaGFzIGFscmVhZHkgYmVlbiB2YWxpZGF0ZWQgaW4gYXV0aG9yaXplXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIsIGFjY291bnQsIHRyaWdnZXIgfSkge1xuICAgICAgLy8gT24gc2lnbmluLCBmZXRjaCBmcmVzaCB1c2VyIGRhdGEgZnJvbSBkYXRhYmFzZVxuICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgdG9rZW4uaWQgPSB1c2VyLmlkO1xuICAgICAgICB0b2tlbi5lbWFpbCA9IHVzZXIuZW1haWw7XG4gICAgICAgIHRva2VuLnVzZXJuYW1lID0gKHVzZXIgYXMgYW55KS51c2VybmFtZTtcbiAgICAgICAgdG9rZW4uZW1haWxfdmVyaWZpZWQgPSAodXNlciBhcyBhbnkpLmVtYWlsX3ZlcmlmaWVkIHx8IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBPbiBzZXNzaW9uIHVwZGF0ZSwgcmVmcmVzaCB1c2VyIGRhdGFcbiAgICAgIGlmICh0cmlnZ2VyID09PSAndXBkYXRlJyAmJiB0b2tlbi5pZCkge1xuICAgICAgICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcbiAgICAgICAgICAuc2VsZWN0KCd1c2VybmFtZSwgZGlzcGxheV9uYW1lLCBwbGFuLCBpc192ZXJpZmllZCwgcHJvZmlsZV9jb21wbGV0ZScpXG4gICAgICAgICAgLmVxKCdpZCcsIHRva2VuLmlkKVxuICAgICAgICAgIC5zaW5nbGUoKTtcblxuICAgICAgICBpZiAocHJvZmlsZSkge1xuICAgICAgICAgIHRva2VuLnVzZXJuYW1lID0gcHJvZmlsZS51c2VybmFtZTtcbiAgICAgICAgICB0b2tlbi5kaXNwbGF5X25hbWUgPSBwcm9maWxlLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgICB0b2tlbi5wbGFuID0gcHJvZmlsZS5wbGFuO1xuICAgICAgICAgIHRva2VuLmlzX3ZlcmlmaWVkID0gcHJvZmlsZS5pc192ZXJpZmllZDtcbiAgICAgICAgICB0b2tlbi5wcm9maWxlX2NvbXBsZXRlID0gcHJvZmlsZS5wcm9maWxlX2NvbXBsZXRlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9LFxuXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIC8vIFNlbmQgcHJvcGVydGllcyB0byB0aGUgY2xpZW50XG4gICAgICBpZiAodG9rZW4gJiYgc2Vzc2lvbi51c2VyKSB7XG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5pZCA9IHRva2VuLmlkO1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkudXNlcm5hbWUgPSB0b2tlbi51c2VybmFtZTtcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLmRpc3BsYXlfbmFtZSA9IHRva2VuLmRpc3BsYXlfbmFtZTtcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLnBsYW4gPSB0b2tlbi5wbGFuIHx8ICdGUkVFJztcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLmlzX3ZlcmlmaWVkID0gdG9rZW4uaXNfdmVyaWZpZWQgfHwgZmFsc2U7XG4gICAgICAgIChzZXNzaW9uLnVzZXIgYXMgYW55KS5lbWFpbF92ZXJpZmllZCA9IHRva2VuLmVtYWlsX3ZlcmlmaWVkIHx8IGZhbHNlO1xuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkucHJvZmlsZV9jb21wbGV0ZSA9IHRva2VuLnByb2ZpbGVfY29tcGxldGUgfHwgZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXNzaW9uO1xuICAgIH0sXG4gIH0sXG4gIGV2ZW50czoge1xuICAgIGFzeW5jIHNpZ25Jbih7IHVzZXIsIGFjY291bnQsIHByb2ZpbGUsIGlzTmV3VXNlciB9KSB7XG4gICAgICBjb25zb2xlLmxvZyhgVXNlciAke3VzZXIuZW1haWx9IHNpZ25lZCBpbiB2aWEgJHthY2NvdW50Py5wcm92aWRlcn1gKTtcbiAgICAgIFxuICAgICAgLy8gVXBkYXRlIGxhc3RfYWN0aXZlIHRpbWVzdGFtcFxuICAgICAgaWYgKHVzZXIuaWQpIHtcbiAgICAgICAgYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxuICAgICAgICAgIC51cGRhdGUoeyBsYXN0X2FjdGl2ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pXG4gICAgICAgICAgLmVxKCdpZCcsIHVzZXIuaWQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBhc3luYyBjcmVhdGVVc2VyKHsgdXNlciB9KSB7XG4gICAgICBjb25zb2xlLmxvZyhgTmV3IHVzZXIgY3JlYXRlZDogJHt1c2VyLmVtYWlsfWApO1xuICAgICAgLy8gUHJvZmlsZSBjcmVhdGlvbiBpcyBoYW5kbGVkIGJ5IHRoZSBkYXRhYmFzZSB0cmlnZ2VyXG4gICAgfSxcbiAgfSxcbiAgZGVidWc6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxuICBzZWNyZXQ6IGVudi5ORVhUQVVUSF9TRUNSRVQsXG4gIHNlc3Npb246IHtcbiAgICBzdHJhdGVneTogJ2p3dCcsXG4gICAgbWF4QWdlOiAyNCAqIDYwICogNjAsIC8vIDI0IGhvdXJzXG4gIH0sXG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gZm9yIHNpZ251cFxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbnVwKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgLy8gQ2hlY2sgaWYgdXNlciBhbHJlYWR5IGV4aXN0c1xuICBjb25zdCB7IGRhdGE6IGV4aXN0aW5nVXNlciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAuZnJvbSgncHJvZmlsZXMnKVxuICAgIC5zZWxlY3QoJ2lkJylcbiAgICAuZXEoJ2VtYWlsJywgZW1haWwpXG4gICAgLnNpbmdsZSgpO1xuXG4gIGlmIChleGlzdGluZ1VzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgYWxyZWFkeSBleGlzdHMgd2l0aCB0aGlzIGVtYWlsJyk7XG4gIH1cblxuICAvLyBIYXNoIHRoZSBwYXNzd29yZFxuICBjb25zdCBoYXNoZWRQYXNzd29yZCA9IGF3YWl0IGJjcnlwdC5oYXNoKHBhc3N3b3JkLCAxMik7XG5cbiAgLy8gQ3JlYXRlIHVzZXIgaW4gU3VwYWJhc2UgQXV0aFxuICBjb25zdCB7IGRhdGE6IGF1dGhEYXRhLCBlcnJvcjogYXV0aEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmFkbWluLmNyZWF0ZVVzZXIoe1xuICAgIGVtYWlsLFxuICAgIHBhc3N3b3JkLFxuICAgIGVtYWlsX2NvbmZpcm06IHRydWUsIC8vIFNraXAgZW1haWwgY29uZmlybWF0aW9uIGluIGRldmVsb3BtZW50XG4gICAgdXNlcl9tZXRhZGF0YToge1xuICAgICAgdXNlcm5hbWU6IGVtYWlsLnNwbGl0KCdAJylbMF0sXG4gICAgICBkaXNwbGF5X25hbWU6IGVtYWlsLnNwbGl0KCdAJylbMF0sXG4gICAgfSxcbiAgfSk7XG5cbiAgaWYgKGF1dGhFcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihhdXRoRXJyb3IubWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIWF1dGhEYXRhLnVzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgdXNlcicpO1xuICB9XG5cbiAgLy8gVGhlIHByb2ZpbGUgd2lsbCBiZSBjcmVhdGVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGRhdGFiYXNlIHRyaWdnZXJcbiAgLy8gUmV0dXJuIHVzZXIgb2JqZWN0IGZvciBOZXh0QXV0aFxuICByZXR1cm4ge1xuICAgIGlkOiBhdXRoRGF0YS51c2VyLmlkLFxuICAgIGVtYWlsOiBhdXRoRGF0YS51c2VyLmVtYWlsISxcbiAgICBuYW1lOiBlbWFpbC5zcGxpdCgnQCcpWzBdLFxuICAgIHVzZXJuYW1lOiBlbWFpbC5zcGxpdCgnQCcpWzBdLFxuICAgIGVtYWlsX3ZlcmlmaWVkOiB0cnVlLFxuICB9O1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gZm9yIHNpZ25pblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2lnbmluKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpIHtcbiAgLy8gVHJ5IHRvIHNpZ24gaW4gd2l0aCBTdXBhYmFzZSBBdXRoXG4gIGNvbnN0IHsgZGF0YTogYXV0aERhdGEsIGVycm9yOiBhdXRoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHtcbiAgICBlbWFpbCxcbiAgICBwYXNzd29yZCxcbiAgfSk7XG5cbiAgaWYgKGF1dGhFcnJvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBlbWFpbCBvciBwYXNzd29yZCcpO1xuICB9XG5cbiAgaWYgKCFhdXRoRGF0YS51c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGlvbiBmYWlsZWQnKTtcbiAgfVxuXG4gIC8vIEdldCB1c2VyIHByb2ZpbGUgZGF0YVxuICBjb25zdCB7IGRhdGE6IHByb2ZpbGUgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgLmZyb20oJ3Byb2ZpbGVzJylcbiAgICAuc2VsZWN0KCd1c2VybmFtZSwgZGlzcGxheV9uYW1lLCBwbGFuLCBpc192ZXJpZmllZCwgcHJvZmlsZV9jb21wbGV0ZScpXG4gICAgLmVxKCdpZCcsIGF1dGhEYXRhLnVzZXIuaWQpXG4gICAgLnNpbmdsZSgpO1xuXG4gIC8vIFJldHVybiB1c2VyIG9iamVjdCBmb3IgTmV4dEF1dGhcbiAgcmV0dXJuIHtcbiAgICBpZDogYXV0aERhdGEudXNlci5pZCxcbiAgICBlbWFpbDogYXV0aERhdGEudXNlci5lbWFpbCEsXG4gICAgbmFtZTogcHJvZmlsZT8uZGlzcGxheV9uYW1lIHx8IHByb2ZpbGU/LnVzZXJuYW1lIHx8IGVtYWlsLnNwbGl0KCdAJylbMF0sXG4gICAgdXNlcm5hbWU6IHByb2ZpbGU/LnVzZXJuYW1lIHx8IGVtYWlsLnNwbGl0KCdAJylbMF0sXG4gICAgcGxhbjogcHJvZmlsZT8ucGxhbiB8fCAnRlJFRScsXG4gICAgaXNfdmVyaWZpZWQ6IHByb2ZpbGU/LmlzX3ZlcmlmaWVkIHx8IGZhbHNlLFxuICAgIGVtYWlsX3ZlcmlmaWVkOiB0cnVlLFxuICAgIHByb2ZpbGVfY29tcGxldGU6IHByb2ZpbGU/LnByb2ZpbGVfY29tcGxldGUgfHwgZmFsc2UsXG4gIH07XG59ICJdLCJuYW1lcyI6WyJTdXBhYmFzZUFkYXB0ZXIiLCJHb29nbGVQcm92aWRlciIsIkdpdEh1YlByb3ZpZGVyIiwiQ3JlZGVudGlhbHNQcm92aWRlciIsImNyZWF0ZUNsaWVudCIsImJjcnlwdCIsImVudiIsInN1cGFiYXNlIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iLCJhdXRoT3B0aW9ucyIsImFkYXB0ZXIiLCJ1cmwiLCJzZWNyZXQiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBsYWNlaG9sZGVyIiwicGFzc3dvcmQiLCJhY3Rpb24iLCJhdXRob3JpemUiLCJFcnJvciIsInRvTG93ZXJDYXNlIiwidHJpbSIsImhhbmRsZVNpZ251cCIsImhhbmRsZVNpZ25pbiIsImVycm9yIiwiY29uc29sZSIsInByb2Nlc3MiLCJHT09HTEVfQ0xJRU5UX0lEIiwiR09PR0xFX0NMSUVOVF9TRUNSRVQiLCJpbmNsdWRlcyIsImNsaWVudElkIiwiY2xpZW50U2VjcmV0IiwicHJvZmlsZSIsImlkIiwic3ViIiwiaW1hZ2UiLCJwaWN0dXJlIiwidXNlcm5hbWUiLCJzcGxpdCIsImVtYWlsX3ZlcmlmaWVkIiwiR0lUSFVCX0NMSUVOVF9JRCIsIkdJVEhVQl9DTElFTlRfU0VDUkVUIiwidG9TdHJpbmciLCJsb2dpbiIsImF2YXRhcl91cmwiLCJwYWdlcyIsInNpZ25JbiIsIm5ld1VzZXIiLCJjYWxsYmFja3MiLCJ1c2VyIiwiYWNjb3VudCIsInByb3ZpZGVyIiwiand0IiwidG9rZW4iLCJ0cmlnZ2VyIiwiZGF0YSIsImZyb20iLCJzZWxlY3QiLCJlcSIsInNpbmdsZSIsImRpc3BsYXlfbmFtZSIsInBsYW4iLCJpc192ZXJpZmllZCIsInByb2ZpbGVfY29tcGxldGUiLCJzZXNzaW9uIiwiZXZlbnRzIiwiaXNOZXdVc2VyIiwibG9nIiwidXBkYXRlIiwibGFzdF9hY3RpdmUiLCJEYXRlIiwidG9JU09TdHJpbmciLCJjcmVhdGVVc2VyIiwiZGVidWciLCJORVhUQVVUSF9TRUNSRVQiLCJzdHJhdGVneSIsIm1heEFnZSIsImV4aXN0aW5nVXNlciIsImhhc2hlZFBhc3N3b3JkIiwiaGFzaCIsImF1dGhEYXRhIiwiYXV0aEVycm9yIiwiYWRtaW4iLCJlbWFpbF9jb25maXJtIiwidXNlcl9tZXRhZGF0YSIsIm1lc3NhZ2UiLCJzaWduSW5XaXRoUGFzc3dvcmQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/authOptions.ts\n");

/***/ }),

/***/ "(rsc)/./lib/env.ts":
/*!********************!*\
  !*** ./lib/env.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   env: () => (/* binding */ env)\n/* harmony export */ });\n// Environment configuration with safe defaults for development\nconst env = {\n    NEXT_PUBLIC_SUPABASE_URL: \"https://ewbopfohuxlhhddtptka.supabase.co\" || 0,\n    NEXT_PUBLIC_SUPABASE_ANON_KEY: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ym9wZm9odXhsaGhkZHRwdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NTQ4NzAsImV4cCI6MjA2MzQzMDg3MH0.EhOaVCSP7upbI-j8H8Yjp4cPsuyoYU9cOhDaHPkNM-s\" || 0,\n    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',\n    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',\n    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:4000'\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZW52LnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQSwrREFBK0Q7QUFDeEQsTUFBTUEsTUFBTTtJQUNqQkMsMEJBQTBCQywwQ0FBb0MsSUFBSSxDQUF3QjtJQUMxRkMsK0JBQStCRCxrTkFBeUMsSUFBSSxDQUEySjtJQUN2T0UsMkJBQTJCRixRQUFRRixHQUFHLENBQUNJLHlCQUF5QixJQUFJO0lBQ3BFQyxpQkFBaUJILFFBQVFGLEdBQUcsQ0FBQ0ssZUFBZSxJQUFJO0lBQ2hEQyxjQUFjSixRQUFRRixHQUFHLENBQUNNLFlBQVksSUFBSTtBQUM1QyxFQUFXIiwic291cmNlcyI6WyIvVXNlcnMvZHlsYW5uZWFsL0RvY3VtZW50cy9Eb2N1bWVudHMgLSBEeWxhbuKAmXMgTWFjQm9vayBBaXIvUHJvZmVzc2lvbmFsL1RlY2hub2xvZ3kvV2ViRGV2L2VuZy9lbmcuY29tL2xpYi9lbnYudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gRW52aXJvbm1lbnQgY29uZmlndXJhdGlvbiB3aXRoIHNhZmUgZGVmYXVsdHMgZm9yIGRldmVsb3BtZW50XG5leHBvcnQgY29uc3QgZW52ID0ge1xuICBORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkw6IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCB8fCAnaHR0cDovLzEyNy4wLjAuMTo1NDMyMScsXG4gIE5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZOiBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSB8fCAnZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlMxa1pXMXZJaXdpY205c1pTSTZJbUZ1YjI0aUxDSmxlSEFpT2pFNU9ETTRNVEk1T1RaOS5DUlhQMUE3V091b0p5LXlKZ2dJd2tOWk5MUEVBTDdUWXktTTR4UVBHMUxZJyxcbiAgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWTogcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSB8fCAnZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlMxa1pXMXZJaXdpY205c1pTSTZJbk5sY25acFkyVmZjbTlzWlNJc0ltVjRjQ0k2TVRrNE16Z3hNams1Tm4wLkVHSU05NlJBWngzNWxKemRKc3lILXFRd3Y4SGRwN2ZzbjNXMFlwTjgxSVUnLFxuICBORVhUQVVUSF9TRUNSRVQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCB8fCAnZGV2LXNlY3JldC1rZXktY2hhbmdlLWluLXByb2R1Y3Rpb24nLFxuICBORVhUQVVUSF9VUkw6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo0MDAwJyxcbn0gYXMgY29uc3Q7ICJdLCJuYW1lcyI6WyJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJwcm9jZXNzIiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIiwiTkVYVEFVVEhfU0VDUkVUIiwiTkVYVEFVVEhfVVJMIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/env.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/@supabase/realtime-js/dist/main sync recursive":
/*!************************************************************!*\
  !*** ./node_modules/@supabase/realtime-js/dist/main/ sync ***!
  \************************************************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "(rsc)/./node_modules/@supabase/realtime-js/dist/main sync recursive";
module.exports = webpackEmptyContext;

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

/***/ "?32c4":
/*!****************************!*\
  !*** bufferutil (ignored) ***!
  \****************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?66e9":
/*!********************************!*\
  !*** utf-8-validate (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/jose","vendor-chunks/ws","vendor-chunks/openid-client","vendor-chunks/whatwg-url","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/@next-auth","vendor-chunks/webidl-conversions","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fdylanneal%2FDocuments%2FDocuments%20-%20Dylan%E2%80%99s%20MacBook%20Air%2FProfessional%2FTechnology%2FWebDev%2Feng%2Feng.com&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();