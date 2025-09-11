[21:50:41.742] Running build in Washington, D.C., USA (East) – iad1
[21:50:41.742] Build machine configuration: 2 cores, 8 GB
[21:50:41.821] Cloning github.com/alaamjaish/sept_levant (Branch: main, Commit: 62ff544)
[21:50:41.835] Skipping build cache, deployment was triggered without cache.
[21:50:42.726] Cloning completed: 905.000ms
[21:50:43.334] Running "vercel build"
[21:50:43.725] Vercel CLI 47.1.1
[21:50:44.335] Running "install" command: `npm ci`...
[21:50:48.189] npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
[21:50:48.531] npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
[21:50:56.528] 
[21:50:56.529] added 365 packages, and audited 366 packages in 12s
[21:50:56.529] 
[21:50:56.529] 141 packages are looking for funding
[21:50:56.529]   run `npm fund` for details
[21:50:56.531] 
[21:50:56.531] found 0 vulnerabilities
[21:50:56.802] 
[21:50:56.803] > web@0.1.0 build
[21:50:56.803] > next build --turbopack
[21:50:56.803] 
[21:50:57.609]  ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
[21:50:57.610]  We detected multiple lockfiles and selected the directory of /vercel/path0/package-lock.json as the root directory.
[21:50:57.611]  To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
[21:50:57.611]    See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
[21:50:57.611]  Detected additional lockfiles: 
[21:50:57.611]    * /vercel/path0/web/package-lock.json
[21:50:57.613] 
[21:50:57.617] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[21:50:57.618] This information is used to shape Next.js' roadmap and prioritize features.
[21:50:57.618] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[21:50:57.618] https://nextjs.org/telemetry
[21:50:57.618] 
[21:50:57.669]    ▲ Next.js 15.5.2 (Turbopack)
[21:50:57.669] 
[21:50:57.761]    Creating an optimized production build ...
[21:51:11.967]  ✓ Finished writing to disk in 37ms
[21:51:12.002]  ✓ Compiled successfully in 13.6s
[21:51:12.008]    Linting and checking validity of types ...
[21:51:19.116] 
[21:51:19.116] Failed to compile.
[21:51:19.116] 
[21:51:19.117] ./src/app/admin/page.tsx
[21:51:19.117] 51:84  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.117] 
[21:51:19.117] ./src/app/api/check-accuracy-enhanced/route.ts
[21:51:19.117] 262:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.117] 299:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.117] 
[21:51:19.117] ./src/app/api/debug/policy-check/route.ts
[21:51:19.117] 5:27  Warning: '_req' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.117] 11:14  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.117] 35:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.117] 
[21:51:19.117] ./src/app/api/exercises/create/route.ts
[21:51:19.117] 37:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 42:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 42:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 44:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 44:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 
[21:51:19.118] ./src/app/api/exercises/delete/route.ts
[21:51:19.118] 37:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 38:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 40:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.118] 55:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.119] 
[21:51:19.119] ./src/app/api/exercises/get-one/route.ts
[21:51:19.119] 63:32  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.119] 68:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.119] 68:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.119] 
[21:51:19.119] ./src/app/api/exercises/list/route.ts
[21:51:19.119] 52:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.119] 61:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.119] 69:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.126] 69:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.126] 
[21:51:19.126] ./src/app/api/exercises/update/route.ts
[21:51:19.126] 47:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.126] 48:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 50:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 62:9  Error: 'u' is never reassigned. Use 'const' instead.  prefer-const
[21:51:19.127] 62:12  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 67:22  Warning: '_omit' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.127] 67:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 69:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 69:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 71:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 71:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.127] 
[21:51:19.128] ./src/app/api/speechmatics/route.ts
[21:51:19.128] 31:10  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.128] 33:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.128] 33:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.128] 
[21:51:19.128] ./src/app/dashboard/page.tsx
[21:51:19.128] 4:6  Warning: 'Exercise' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.128] 18:5  Warning: 'isSignedIn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.136] 25:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.138] 41:9  Warning: 'speakingCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.138] 42:9  Warning: 'listeningCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.138] 
[21:51:19.138] ./src/app/layout.tsx
[21:51:19.139] 46:13  Error: Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[21:51:19.139] 
[21:51:19.139] ./src/app/speaking/experimental/page.tsx
[21:51:19.139] 50:28  Warning: The ref value 'transcriberRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'transcriberRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
[21:51:19.139] 57:6  Warning: React Hook useEffect has a missing dependency: 'micStream'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.139] 218:52  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.139] 218:88  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.139] 220:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.139] 242:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.139] 242:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.139] 243:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.139] 
[21:51:19.139] ./src/app/speaking/lesson/[id]/page.tsx
[21:51:19.139] 33:10  Warning: 'transcribing' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.139] 34:10  Warning: 'lastDurationSec' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.140] 104:6  Warning: React Hook useEffect has a missing dependency: 'exercise.arabic_text'. Either include it or remove the dependency array. You can also replace multiple useState variables with useReducer if 'setExerciseDraft' needs the current value of 'exercise.arabic_text'.  react-hooks/exhaustive-deps
[21:51:19.140] 121:113  Warning: React Hook useMemo has a missing dependency: 'exercise'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.140] 153:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.140] 160:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.140] 229:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.140] 230:7  Warning: A font-display parameter is missing (adding `&display=optional` is recommended). See: https://nextjs.org/docs/messages/google-font-display  @next/next/google-font-display
[21:51:19.140] 230:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.140] 270:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.140] 271:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.140] 271:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.140] 271:152  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 308:196  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 317:77  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 318:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 318:86  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 319:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 353:81  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 354:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 354:90  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 355:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.141] 367:79  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 367:107  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 367:143  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 371:66  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 
[21:51:19.142] ./src/app/speaking/lessons/page.tsx
[21:51:19.142] 18:10  Warning: 'role' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.142] 19:10  Warning: 'isSignedIn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.142] 49:114  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 54:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 84:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.142] 104:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.142] 
[21:51:19.142] ./src/app/speaking/page.tsx
[21:51:19.142] 40:10  Warning: 'transcribing' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.142] 41:10  Warning: 'lastDurationSec' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.143] 111:28  Warning: The ref value 'transcriberRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'transcriberRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
[21:51:19.143] 118:6  Warning: React Hook useEffect has a missing dependency: 'micStream'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.143] 133:6  Warning: React Hook useEffect has missing dependencies: 'exercise.arabic_text', 'exercise.level', 'exercise?.short_description', and 'exercise?.title'. Either include them or remove the dependency array. You can also replace multiple useState variables with useReducer if 'setExerciseDraft' needs the current value of 'exercise.arabic_text'.  react-hooks/exhaustive-deps
[21:51:19.143] 146:113  Warning: React Hook useMemo has a missing dependency: 'exercise'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.143] 178:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.143] 185:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.143] 209:6  Warning: React Hook useCallback has missing dependencies: 'liveFinals', 'livePartial', and 'micStream'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.143] 228:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.143] 229:7  Warning: A font-display parameter is missing (adding `&display=optional` is recommended). See: https://nextjs.org/docs/messages/google-font-display  @next/next/google-font-display
[21:51:19.143] 229:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.143] 272:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.143] 273:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.143] 273:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.143] 273:152  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.143] 313:76  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 332:77  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 333:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 333:86  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 334:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 376:83  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 377:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 377:92  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 378:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 420:81  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 421:57  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 421:90  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 422:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 434:79  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 434:107  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.144] 434:143  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 438:66  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 
[21:51:19.145] ./src/app/speaking/stitch/lesson/[id]/page.tsx
[21:51:19.145] 27:10  Warning: 'feedbackDetail' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.145] 116:113  Warning: React Hook useMemo has a missing dependency: 'exercise'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.145] 185:83  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 246:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.145] 247:7  Warning: A font-display parameter is missing (adding `&display=optional` is recommended). See: https://nextjs.org/docs/messages/google-font-display  @next/next/google-font-display
[21:51:19.145] 247:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.145] 284:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 285:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 285:75  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 285:144  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 436:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.145] 437:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.146] 437:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.151] 438:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.151] 467:67  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.151] 468:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.151] 468:76  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.151] 469:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.152] 481:24  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.152] 494:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.152] 495:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.152] 495:72  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.152] 496:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.152] 
[21:51:19.152] ./src/app/speaking/stitch/lessons/new/page.tsx
[21:51:19.152] 5:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.152] 52:14  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.152] 88:29  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.152] 88:62  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.153] 89:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.153] 127:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.153] 
[21:51:19.153] ./src/app/speaking/stitch/lessons/page.tsx
[21:51:19.153] 16:10  Warning: 'role' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.153] 17:10  Warning: 'isSignedIn' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.153] 69:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.153] 
[21:51:19.153] ./src/app/speaking/stitch/page.tsx
[21:51:19.153] 15:8  Warning: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.154] 36:10  Warning: 'lastStudentBlob' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.154] 87:24  Warning: The ref value 'transcriberRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'transcriberRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
[21:51:19.154] 103:6  Warning: React Hook useEffect has a missing dependency: 'micStream'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.154] 146:6  Warning: React Hook useEffect has an unnecessary dependency: 'audioRef.current'. Either exclude it or remove the dependency array. Mutable values like 'audioRef.current' aren't valid dependencies because mutating them doesn't re-render the component.  react-hooks/exhaustive-deps
[21:51:19.154] 253:11  Warning: 'startedAt' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.154] 559:40  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.154] 
[21:51:19.154] ./src/app/speaking/stitch2/page.tsx
[21:51:19.154] 37:10  Warning: 'lastStudentBlob' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.154] 89:24  Warning: The ref value 'transcriberRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'transcriberRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
[21:51:19.154] 105:6  Warning: React Hook useEffect has a missing dependency: 'micStream'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.155] 149:6  Warning: React Hook useEffect has an unnecessary dependency: 'audioRef.current'. Either exclude it or remove the dependency array. Mutable values like 'audioRef.current' aren't valid dependencies because mutating them doesn't re-render the component.  react-hooks/exhaustive-deps
[21:51:19.155] 278:11  Warning: 'startedAt' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.155] 631:40  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.155] 
[21:51:19.155] ./src/app/speaking/stitch3/page.tsx
[21:51:19.155] 28:10  Warning: 'library' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.155] 29:10  Warning: 'selectedId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.155] 37:10  Warning: 'lastStudentBlob' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.155] 89:24  Warning: The ref value 'transcriberRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'transcriberRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
[21:51:19.155] 105:6  Warning: React Hook useEffect has a missing dependency: 'micStream'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.156] 149:6  Warning: React Hook useEffect has an unnecessary dependency: 'audioRef.current'. Either exclude it or remove the dependency array. Mutable values like 'audioRef.current' aren't valid dependencies because mutating them doesn't re-render the component.  react-hooks/exhaustive-deps
[21:51:19.156] 288:11  Warning: 'startedAt' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.156] 586:38  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.156] 
[21:51:19.157] ./src/app/speaking/stitch4/page.tsx
[21:51:19.157] 17:10  Warning: 'library' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.157] 18:10  Warning: 'selectedId' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.157] 24:10  Warning: 'feedbackDetail' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.158] 26:10  Warning: 'lastStudentBlob' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.158] 77:24  Warning: The ref value 'transcriberRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'transcriberRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps
[21:51:19.158] 93:6  Warning: React Hook useEffect has a missing dependency: 'micStream'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[21:51:19.158] 265:11  Warning: 'startedAt' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.158] 343:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.158] 344:7  Warning: A font-display parameter is missing (adding `&display=optional` is recommended). See: https://nextjs.org/docs/messages/google-font-display  @next/next/google-font-display
[21:51:19.158] 344:7  Warning: Custom fonts not added in `pages/_document.js` will only load for a single page. This is discouraged. See: https://nextjs.org/docs/messages/no-page-custom-font  @next/next/no-page-custom-font
[21:51:19.158] 523:30  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.158] 632:38  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.158] 
[21:51:19.158] ./src/components/LevelMeter.tsx
[21:51:19.158] 20:61  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.158] 
[21:51:19.159] ./src/components/LiveTranscriber.tsx
[21:51:19.159] 2:8  Warning: 'React' is defined but never used.  @typescript-eslint/no-unused-vars
[21:51:19.159] 19:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.159] 20:25  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.159] 26:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.159] 27:12  Warning: 'supported' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[21:51:19.159] 53:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[21:51:19.159] 
[21:51:19.160] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[21:51:19.172] Error: Command "npm run build" exited with 1