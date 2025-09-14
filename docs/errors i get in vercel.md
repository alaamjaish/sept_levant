[17:26:04.068] Running build in Washington, D.C., USA (East) – iad1
[17:26:04.070] Build machine configuration: 2 cores, 8 GB
[17:26:04.145] Cloning github.com/alaamjaish/sept_levant (Branch: main, Commit: 2229904)
[17:26:04.465] Previous build caches not available
[17:26:05.093] Cloning completed: 947.000ms
[17:26:06.027] Running "vercel build"
[17:26:06.444] Vercel CLI 47.1.1
[17:26:06.785] Running "install" command: `npm ci`...
[17:26:10.768] npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
[17:26:11.186] npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
[17:26:19.032] 
[17:26:19.033] added 365 packages, and audited 366 packages in 12s
[17:26:19.034] 
[17:26:19.034] 141 packages are looking for funding
[17:26:19.034]   run `npm fund` for details
[17:26:19.034] 
[17:26:19.035] found 0 vulnerabilities
[17:26:19.075] Detected Next.js version: 15.5.2
[17:26:19.076] Running "npm run build"
[17:26:19.185] 
[17:26:19.186] > web@0.1.0 build
[17:26:19.186] > next build --turbopack
[17:26:19.186] 
[17:26:19.801] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[17:26:19.802] This information is used to shape Next.js' roadmap and prioritize features.
[17:26:19.802] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[17:26:19.802] https://nextjs.org/telemetry
[17:26:19.802] 
[17:26:19.853]    ▲ Next.js 15.5.2 (Turbopack)
[17:26:19.854] 
[17:26:19.943]    Creating an optimized production build ...
[17:26:33.515]  ✓ Finished writing to disk in 30ms
[17:26:33.543]  ✓ Compiled successfully in 13.1s
[17:26:33.548]    Skipping linting
[17:26:33.549]    Checking validity of types ...
[17:26:40.285] Failed to compile.
[17:26:40.286] 
[17:26:40.287] ./src/app/speaking/stitch/lesson/[id]/page.tsx:316:87
[17:26:40.287] Type error: Type 'RefObject<HTMLAudioElement | null>' is not assignable to type 'RefObject<HTMLAudioElement>'.
[17:26:40.287]   Type 'HTMLAudioElement | null' is not assignable to type 'HTMLAudioElement'.
[17:26:40.287]     Type 'null' is not assignable to type 'HTMLAudioElement'.
[17:26:40.287] 
[17:26:40.287] [0m [90m 314 |[39m
[17:26:40.287]  [90m 315 |[39m                   {(role [33m===[39m [32m"teacher"[39m [33m||[39m role [33m===[39m [32m"admin"[39m) [33m&&[39m (
[17:26:40.288] [31m[1m>[22m[39m[90m 316 |[39m                     [33m<[39m[33mAdminAudioControls[39m exercise[33m=[39m{exercise} setExercise[33m=[39m{setExercise} audioRef[33m=[39m{audioRef} [33m/[39m[33m>[39m
[17:26:40.288]  [90m     |[39m                                                                                       [31m[1m^[22m[39m
[17:26:40.288]  [90m 317 |[39m                   )}
[17:26:40.288]  [90m 318 |[39m                 [33m<[39m[33m/[39m[33mdiv[39m[33m>[39m
[17:26:40.288]  [90m 319 |[39m               [33m<[39m[33m/[39m[33mdiv[39m[33m>[39m[0m
[17:26:40.312] Next.js build worker exited with code: 1 and signal: null
[17:26:40.330] Error: Command "npm run build" exited with 1