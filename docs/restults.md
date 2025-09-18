15:45:32.387 Running build in Washington, D.C., USA (East) – iad1
15:45:32.388 Build machine configuration: 2 cores, 8 GB
15:45:32.405 Cloning github.com/alaamjaish/sept_levant (Branch: flashcards3, Commit: ebe1c60)
15:45:32.413 Skipping build cache, deployment was triggered without cache.
15:45:32.828 Cloning completed: 423.000ms
15:45:33.154 Running "vercel build"
15:45:33.574 Vercel CLI 48.0.2
15:45:33.924 Running "install" command: `npm ci`...
15:45:47.159 
15:45:47.160 added 363 packages, and audited 364 packages in 13s
15:45:47.160 
15:45:47.161 140 packages are looking for funding
15:45:47.161   run `npm fund` for details
15:45:47.161 
15:45:47.161 found 0 vulnerabilities
15:45:47.217 Detected Next.js version: 15.5.2
15:45:47.218 Running "npm run build"
15:45:47.619 
15:45:47.620 > web@0.1.0 build
15:45:47.620 > next build --turbopack
15:45:47.620 
15:45:48.223 Attention: Next.js now collects completely anonymous telemetry regarding usage.
15:45:48.223 This information is used to shape Next.js' roadmap and prioritize features.
15:45:48.224 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
15:45:48.224 https://nextjs.org/telemetry
15:45:48.224 
15:45:48.289    ▲ Next.js 15.5.2 (Turbopack)
15:45:48.290 
15:45:48.379    Creating an optimized production build ...
15:46:02.216  ✓ Finished writing to disk in 38ms
15:46:02.233 
15:46:02.234 > Build error occurred
15:46:02.238 Error: Turbopack build failed with 14 errors:
15:46:02.241 ./web/src/app/api/attempts/route.ts:3:1
15:46:02.241 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.241 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.241  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.241 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.242  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.242  [90m 4 |[39m
15:46:02.242  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mPOST[39m(req[33m:[39m [33mNextRequest[39m) {
15:46:02.242  [90m 6 |[39m   [36mconst[39m { exercise_id[33m,[39m score[33m,[39m passed } [33m=[39m [36mawait[39m req[33m.[39mjson()[33m;[39m[0m
15:46:02.242 
15:46:02.242 
15:46:02.242 
15:46:02.242 https://nextjs.org/docs/messages/module-not-found
15:46:02.242 
15:46:02.242 
15:46:02.242 ./web/src/app/api/attempts/route.ts:3:1
15:46:02.242 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.242 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.243  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.243 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.244  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.246  [90m 4 |[39m
15:46:02.246  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mPOST[39m(req[33m:[39m [33mNextRequest[39m) {
15:46:02.246  [90m 6 |[39m   [36mconst[39m { exercise_id[33m,[39m score[33m,[39m passed } [33m=[39m [36mawait[39m req[33m.[39mjson()[33m;[39m[0m
15:46:02.246 
15:46:02.246 
15:46:02.246 
15:46:02.246 https://nextjs.org/docs/messages/module-not-found
15:46:02.246 
15:46:02.246 
15:46:02.247 ./web/src/app/api/debug/policy-check/route.ts:3:1
15:46:02.247 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.247 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.247  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.247 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.247  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.247  [90m 4 |[39m
15:46:02.247  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mGET[39m(_req[33m:[39m [33mNextRequest[39m) {
15:46:02.247  [90m 6 |[39m   [36mconst[39m cookieStore [33m=[39m cookies()[33m;[39m[0m
15:46:02.247 
15:46:02.247 
15:46:02.247 
15:46:02.247 https://nextjs.org/docs/messages/module-not-found
15:46:02.247 
15:46:02.247 
15:46:02.247 ./web/src/app/api/debug/policy-check/route.ts:3:1
15:46:02.247 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.247 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.247  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.247 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.247  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.247  [90m 4 |[39m
15:46:02.247  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mGET[39m(_req[33m:[39m [33mNextRequest[39m) {
15:46:02.247  [90m 6 |[39m   [36mconst[39m cookieStore [33m=[39m cookies()[33m;[39m[0m
15:46:02.247 
15:46:02.247 
15:46:02.247 
15:46:02.247 https://nextjs.org/docs/messages/module-not-found
15:46:02.248 
15:46:02.248 
15:46:02.248 ./web/src/app/api/exercises/audio/remove/route.ts:3:1
15:46:02.248 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.248 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.248  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.248 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.248  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.248  [90m 4 |[39m
15:46:02.248  [90m 5 |[39m [36mfunction[39m isUuid(value[33m:[39m string)[33m:[39m boolean {
15:46:02.248  [90m 6 |[39m   [36mreturn[39m [35m/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i[39m[33m.[39mtest(value)[33m;[39m[0m
15:46:02.248 
15:46:02.248 
15:46:02.248 
15:46:02.248 https://nextjs.org/docs/messages/module-not-found
15:46:02.248 
15:46:02.248 
15:46:02.248 ./web/src/app/api/exercises/audio/remove/route.ts:3:1
15:46:02.248 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.248 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.248  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.248 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.248  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.248  [90m 4 |[39m
15:46:02.248  [90m 5 |[39m [36mfunction[39m isUuid(value[33m:[39m string)[33m:[39m boolean {
15:46:02.248  [90m 6 |[39m   [36mreturn[39m [35m/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i[39m[33m.[39mtest(value)[33m;[39m[0m
15:46:02.249 
15:46:02.249 
15:46:02.249 
15:46:02.249 https://nextjs.org/docs/messages/module-not-found
15:46:02.249 
15:46:02.249 
15:46:02.249 ./web/src/app/api/exercises/create/route.ts:3:1
15:46:02.249 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.249 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.249  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.249 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.249  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.249  [90m 4 |[39m
15:46:02.249  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mPOST[39m(req[33m:[39m [33mNextRequest[39m) {
15:46:02.249  [90m 6 |[39m   [36mconst[39m { arabic_text[33m,[39m audio_url[33m,[39m exercise_type[33m,[39m level[33m,[39m title[33m,[39m short_description } [33m=[39m [36mawait[39m req[33m.[39mjson()[33m;[39m[0m
15:46:02.249 
15:46:02.249 
15:46:02.249 
15:46:02.249 https://nextjs.org/docs/messages/module-not-found
15:46:02.249 
15:46:02.249 
15:46:02.249 ./web/src/app/api/exercises/create/route.ts:3:1
15:46:02.250 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.250 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.250  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.250 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.250  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.250  [90m 4 |[39m
15:46:02.250  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mPOST[39m(req[33m:[39m [33mNextRequest[39m) {
15:46:02.250  [90m 6 |[39m   [36mconst[39m { arabic_text[33m,[39m audio_url[33m,[39m exercise_type[33m,[39m level[33m,[39m title[33m,[39m short_description } [33m=[39m [36mawait[39m req[33m.[39mjson()[33m;[39m[0m
15:46:02.250 
15:46:02.250 
15:46:02.250 
15:46:02.250 https://nextjs.org/docs/messages/module-not-found
15:46:02.250 
15:46:02.250 
15:46:02.250 ./web/src/app/api/exercises/delete/route.ts:3:1
15:46:02.250 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.250 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.250  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.250 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.250  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.250  [90m 4 |[39m
15:46:02.250  [90m 5 |[39m [36mfunction[39m isUuid(value[33m:[39m string)[33m:[39m boolean {
15:46:02.250  [90m 6 |[39m   [36mreturn[39m [35m/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i[39m[33m.[39mtest(value)[33m;[39m[0m
15:46:02.250 
15:46:02.250 
15:46:02.251 
15:46:02.251 https://nextjs.org/docs/messages/module-not-found
15:46:02.251 
15:46:02.251 
15:46:02.251 ./web/src/app/api/exercises/delete/route.ts:3:1
15:46:02.251 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.251 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.251  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.251 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.251  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.251  [90m 4 |[39m
15:46:02.251  [90m 5 |[39m [36mfunction[39m isUuid(value[33m:[39m string)[33m:[39m boolean {
15:46:02.251  [90m 6 |[39m   [36mreturn[39m [35m/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i[39m[33m.[39mtest(value)[33m;[39m[0m
15:46:02.251 
15:46:02.251 
15:46:02.251 
15:46:02.251 https://nextjs.org/docs/messages/module-not-found
15:46:02.251 
15:46:02.251 
15:46:02.251 ./web/src/app/api/exercises/update/route.ts:3:1
15:46:02.251 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.251 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.251  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.251 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.251  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.251  [90m 4 |[39m
15:46:02.257  [90m 5 |[39m [90m// Minimal update endpoint: teachers can update text/audio_url of an exercise[39m
15:46:02.257  [90m 6 |[39m [36mfunction[39m isUuid(value[33m:[39m string)[33m:[39m boolean {[0m
15:46:02.257 
15:46:02.257 
15:46:02.257 
15:46:02.257 https://nextjs.org/docs/messages/module-not-found
15:46:02.258 
15:46:02.258 
15:46:02.258 ./web/src/app/api/exercises/update/route.ts:3:1
15:46:02.258 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.258 [0m [90m 1 |[39m [36mimport[39m { [33mNextRequest[39m[33m,[39m [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.258  [90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.258 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.258  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.258  [90m 4 |[39m
15:46:02.258  [90m 5 |[39m [90m// Minimal update endpoint: teachers can update text/audio_url of an exercise[39m
15:46:02.258  [90m 6 |[39m [36mfunction[39m isUuid(value[33m:[39m string)[33m:[39m boolean {[0m
15:46:02.258 
15:46:02.258 
15:46:02.258 
15:46:02.258 https://nextjs.org/docs/messages/module-not-found
15:46:02.258 
15:46:02.258 
15:46:02.258 ./web/src/app/api/flashcards/cards/[id]/route.ts:3:1
15:46:02.259 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.259 [0m [90m 1 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.259  [90m 2 |[39m [36mimport[39m { [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.259 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.259  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.259  [90m 4 |[39m
15:46:02.259  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mDELETE[39m(
15:46:02.259  [90m 6 |[39m   _request[33m:[39m [33mRequest[39m[33m,[39m[0m
15:46:02.259 
15:46:02.260 
15:46:02.260 
15:46:02.260 https://nextjs.org/docs/messages/module-not-found
15:46:02.260 
15:46:02.260 
15:46:02.260 ./web/src/app/api/flashcards/cards/[id]/route.ts:3:1
15:46:02.260 Module not found: Can't resolve '@supabase/auth-helpers-nextjs'
15:46:02.260 [0m [90m 1 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m"next/headers"[39m[33m;[39m
15:46:02.260  [90m 2 |[39m [36mimport[39m { [33mNextResponse[39m } [36mfrom[39m [32m"next/server"[39m[33m;[39m
15:46:02.260 [31m[1m>[22m[39m[90m 3 |[39m [36mimport[39m { createRouteHandlerClient } [36mfrom[39m [32m"@supabase/auth-helpers-nextjs"[39m[33m;[39m
15:46:02.260  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
15:46:02.260  [90m 4 |[39m
15:46:02.260  [90m 5 |[39m [36mexport[39m [36masync[39m [36mfunction[39m [33mDELETE[39m(
15:46:02.260  [90m 6 |[39m   _request[33m:[39m [33mRequest[39m[33m,[39m[0m
15:46:02.260 
15:46:02.260 
15:46:02.260 
15:46:02.260 https://nextjs.org/docs/messages/module-not-found
15:46:02.260 
15:46:02.260 
15:46:02.260     at <unknown> (./web/src/app/api/attempts/route.ts:3:1)
15:46:02.260     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.260     at <unknown> (./web/src/app/api/attempts/route.ts:3:1)
15:46:02.260     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.260     at <unknown> (./web/src/app/api/debug/policy-check/route.ts:3:1)
15:46:02.260     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.260     at <unknown> (./web/src/app/api/debug/policy-check/route.ts:3:1)
15:46:02.260     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.260     at <unknown> (./web/src/app/api/exercises/audio/remove/route.ts:3:1)
15:46:02.260     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/audio/remove/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/create/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/create/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/delete/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/delete/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/update/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/exercises/update/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/flashcards/cards/[id]/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.261     at <unknown> (./web/src/app/api/flashcards/cards/[id]/route.ts:3:1)
15:46:02.261     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
15:46:02.297 Error: Command "npm run build" exited with 1