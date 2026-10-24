# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **YouTrack App** using the Enhanced DX template with TypeScript support. It consists of:
- **Frontend widgets**: React components rendered in YouTrack UI
- **Backend HTTP handlers**: File-based API routes with type-safe endpoints and Zod validation
- **Workflows & automation**: YouTrack issue actions and background tasks
- **Type generation**: API types auto-generated from handler exports

## Common Development Commands

### Build & Validation
```bash
npm run build              # Full production build (clean → backend → lint → frontend → validate)
npm run build:backend      # Backend only (generates API type definitions)
npm run build:frontend     # Frontend only (requires backend types already present)
npm run build:nolint       # Full build without linting (faster for testing)
npm run clean              # Remove generated API files
npm run pack               # Create distributable ZIP file
```

### Development & Testing
```bash
npm run watch              # Watch mode with auto-upload (recommended for development)
npm run dev                # Watch + hot reload on port 9000 (fastest frontend development)
npm run hmr                # Vite dev server only on port 9000
npm run lint               # Run ESLint (run automatically in npm run build)
npm run lint:fix           # Auto-fix ESLint violations
```

### Deployment
```bash
npm run update             # Quick build + upload (requires .env)
npm run upload-local       # Upload using .env credentials
npm run dev:upload         # Build dev-mode bundle and upload (for HMR setup)
npm run upload -- --host <url> --token <token>  # Upload with explicit credentials
```

### Code Generation
```bash
npm run g -- http-handler add --scope <scope> --path <path>
npm run g -- extension-property add --entity <Entity> --name <field>
npm run g -- settings add --name <key> --type <type>
```

## Project Structure & Architecture

### Frontend: src/widgets/

React components rendered in YouTrack. Widgets:
- Live in `src/widgets/{widget-name}/`
- Entry point: `index.tsx` (React component)
- HTML template: `index.html`
- Assets: `*.svg`, `*.css`, widget config
- Use `createApi()` from `src/api` to call backend handlers
- Use `createComponentLogger()` for browser console logging
- Use Ring UI (`@jetbrains/ring-ui-built`) for YouTrack-native components

Frontend build artifacts go to `dist/widgets/`.

### Backend: src/backend/

#### File-based Routing (src/backend/router/)
Handlers are discovered and registered automatically via file naming:
- `src/backend/router/{scope}/{path}/{METHOD}.ts`
- Scope: `global`, `project`, or `issue`
- Method: `GET`, `POST`, `PUT`, `DELETE`, etc.

Each handler exports:
```typescript
export type XyzReq = { /* input validation */ };  // @zod-to-schema comment
export type XyzRes = { /* output validation */ };  // @zod-to-schema comment
export default function handle(ctx: CtxMethod<XyzRes, XyzReq, "scope">): void { ... }
export type Handle = typeof handle;  // Required export
```

Handler context provides:
- `ctx.request.json()` / `ctx.request.getParameter()` — request data
- `ctx.response.json()` — send JSON response
- `ctx.project` / `ctx.issue` — YouTrack entity context (project/issue scope only)
- Standard `console.log()` for backend logging (appears in YouTrack app admin panel)

**Zod validation**: Types with `@zod-to-schema` comment are auto-converted to Zod schemas by `ts-to-zod`. Client-side POST/PUT requests are validated at runtime.

#### API Generation
- Backend build (`vite -c vite.config.backend.ts build`) generates:
  - `src/api/api.d.ts` — Type definitions from handler exports
  - `src/api/api.zod.ts` — Zod schemas for validation
- Frontend can then import `ApiRouter` type and call `api.{scope}.{path}.{METHOD}(params)`
- Queries are type-safe and validated before sending

#### Requirements & Fields (src/backend/requirements.ts)
Define YouTrack fields and enum values your app needs. Currently empty—add custom fields here if workflows or handlers require specific issue/project fields.

#### Workflows & Automation
- `src/workflows/` — YouTrack issue actions (rules triggered by user commands)
- `src/backend/ai-tools/` — Backend bundles for AI assistant integrations
- `src/backend/sla/` — SLA calculations and helpers
- Non-route code here is bundled separately by Vite (`youtrackBackendBundles` plugin)

### Type System & API Client

#### Generated API (src/api/)
- `api/index.ts` — Create type-safe API client: `const api = createApi<ApiRouter>(host)`
- `api/youtrack-types.d.ts` — YouTrack entity shortcuts
- `api/api.d.ts` — Auto-generated from handlers (DO NOT EDIT)
- `api/api.zod.ts` — Auto-generated Zod schemas (DO NOT EDIT)
- `api/app.d.ts` — Auto-generated app settings types
- `api/extended-*.d.ts` — Auto-generated extension property types

#### TypeScript Config
- `@/` — Alias to `src/`
- `@backend/` — Alias to `src/backend/`
- Two separate TSConfigs:
  - `tsconfig.app.json` — Frontend (React, DOM, browser)
  - `tsconfig.node.json` — Backend/Node (CommonJS, Vite plugins)

### Configuration Files

**src/settings.json** — App settings schema (JSON Schema). Typed as `AppSettings` at runtime.

**src/entity-extensions.json** — Extends YouTrack issues/projects with custom fields. Auto-generated.

**src/app-id.ts** — Unique app identifier (exported to manifest).

**manifest.json** — YouTrack app manifest (package metadata, widget/workflow registration).

## Setup & Environment

### .env Configuration
Create `.env` in project root:
```
YOUTRACK_HOST=https://your-youtrack.url
YOUTRACK_TOKEN=perm:your-permanent-token
```

Get a permanent token: YouTrack profile → Account Security → New token

### First Run
```bash
npm install
npm run build              # Generate API types
npm run watch              # Start watching and uploading
```

## Development Workflows

### Adding a New API Endpoint
1. Create `src/backend/router/{scope}/{path}/{METHOD}.ts`
2. Export `{Name}Req` and `{Name}Res` types (with `@zod-to-schema` comment)
3. Implement default handler function
4. Save — backend build auto-runs, generates new types
5. Frontend can now call `api.{scope}.{path}.{METHOD}(params)`

### Iterating on Frontend
- Use `npm run watch` for automatic upload on save (no reload needed)
- Use `npm run dev` for hot reload on port 9000 (fastest for UI work)
- Use browser DevTools to inspect React components and network calls

### Debugging Backend
- Backend logs appear in: YouTrack → Administration → Apps → [Your App] → Technical Details → Logs
- Use `console.log()` in handlers for debugging
- Zod validation errors logged to client browser console

### Adding Workflows
1. Create `src/workflows/{workflow-name}.ts`
2. Export a `rule` object from YouTrack Scripting API
3. Define `title`, `command`, and action implementation
4. Backend build bundles it separately via `youtrackBackendBundles`

## Build System & Vite Config

### Vite Frontend (vite.config.ts)
- Auto-discovers widgets from `src/widgets/*/index.html`
- Watches `settings.json` changes
- Plugins: React, static copy (manifest, public files, widget icons), hot reload, auto-upload
- Dev server on port 9000 (CORS enabled for YouTrack iframe)
- Output: `dist/widgets/` (minified, hashed assets)

### Vite Backend (vite.config.backend.ts)
- Generates API routes via `youtrackRouter` plugin
- Generates API types via `youtrackApiGenerator` plugin
- Generates app settings types via `youtrackAppSettings` plugin
- Bundles workflows and utilities via `youtrackBackendBundles` plugin
- Output: `dist/*.js` (NOT minified for workflow editor debugging)
- Manual chunking: route handlers stay separate; shared code in `backend-{dirname}` chunks

### ESLint Config (eslint.config.mjs)
- Ignores generated files: `src/api/api.d.ts`, `src/api/api.zod.ts`, `src/api/app.d.ts`, `src/api/extended-*.d.ts`
- JetBrains config + React hooks recommended rules
- Relaxed rules: allows `console.log`, `@ts-ignore` with description, unused vars prefixed with `_`
- No-magic-numbers warning except: -1, 0, 1, 2, 100, 200, 201, 204, 400, 401, 403, 404, 500

## Logging

**Frontend** (src/common/utils/logger.ts):
```typescript
import { createComponentLogger } from '@/common/utils/logger';
const logger = createComponentLogger('ComponentName');
logger.info('message');
logger.debug('message', {}, metadata);
logger.error('message', {}, error);
```

**Backend**: Use standard `console.log()`, `console.warn()`, `console.error()` in handlers. Logs appear in YouTrack admin panel.

## Common Pitfalls

- **"Cannot find module './api/api'"** → Run `npm run build:backend` to generate types
- **Handler not found** → Check file path matches `src/backend/router/{scope}/{path}/{METHOD}.ts`
- **Zod validation error at runtime** → Type names must END with `Req`/`Res` and have `@zod-to-schema` comment
- **Watch mode not detecting changes** → Save file (Ctrl+S), ensure it's in `src/`, restart if needed
- **Hot reload shows blank** → Check `http://localhost:9000` is reachable, no Vite errors in console

## Key Dependencies

- **Frontend**: React 18, Ring UI (YouTrack components), Zod (runtime validation)
- **Backend**: YouTrack Scripting API, Zod (schema validation)
- **Build**: Vite 6, TypeScript, ESLint, ts-to-zod
- **Utilities**: loglevel (logger), core-js (polyfills)

## Useful Links

- [Enhanced DX Tools Docs](https://github.com/JetBrains/youtrack-apps/tree/main/packages/apps-tools)
- [YouTrack App Dev Guide](https://www.jetbrains.com/help/youtrack/devportal/apps-quick-start-guide.html)
- [YouTrack Scripting API](https://www.jetbrains.com/help/youtrack/devportal/YouTrack-Api-Documentation.html)
- [Ring UI Components](https://jetbrains.org/ring-ui/)