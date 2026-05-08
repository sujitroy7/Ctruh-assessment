# Server — Claude Instructions

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript 5 (strict mode) |
| Framework | Express 4 |
| Database | MongoDB 7 via Mongoose 8 |
| Validation | Zod 4 |
| OpenAPI | `@asteasolutions/zod-to-openapi` |
| Dev server | `tsc-watch` → `node dist/index` |

---

## Folder structure

The server uses a **feature-based folder structure** — all code for a given domain (schemas, model, service, controller, routes) lives together under `src/features/<name>/` rather than being split across global `controllers/`, `services/`, etc. directories.

```
server/
├── src/
│   ├── index.ts                       # App bootstrap: Express setup, DB connect, route mount
│   ├── config/
│   │   └── env.ts                     # Typed + validated env vars via Zod — import `env` from here
│   ├── openapi/
│   │   └── index.ts                   # Merges feature registries → generates OpenAPI 3.0 spec
│   └── features/
│       └── <feature>/
│           ├── index.ts               # Router definition + mounts controllers to routes
│           ├── <feature>.schema.ts    # Zod schemas + OpenAPIRegistry (the CDD contract)
│           ├── <feature>.controller.ts # Request/response handling — calls service, sends response
│           ├── <feature>.service.ts   # Business logic + DB queries — no req/res here
│           └── <feature>.model.ts     # Mongoose model + TypeScript interface
├── dist/                              # Compiled output — never edit by hand
├── .env                               # Local env (not committed)
├── .env.example                       # Committed template
├── tsconfig.json
└── package.json
```

---

## Feature module pattern

Every feature lives under `src/features/<name>/` with a clear separation of responsibilities across files:

| File | Responsibility |
|---|---|
| `<feature>.schema.ts` | Zod schemas + `OpenAPIRegistry` — the CDD contract |
| `<feature>.model.ts` | Mongoose schema + `IModel` interface |
| `<feature>.service.ts` | Business logic + DB queries — never touches `req`/`res` |
| `<feature>.controller.ts` | Reads from `req`, calls service, sends `res` |
| `index.ts` | Creates the `Router`, wires controllers to paths |

**Schema file** (`<feature>.schema.ts`):
```ts
export const productsRegistry = new OpenAPIRegistry();

export const ProductSchema = productsRegistry.register("Product", z.object({ ... }));
```

**Service file** (`<feature>.service.ts`):
```ts
export async function getProducts(page: number, limit: number) {
  const [data, total] = await Promise.all([
    Product.find({ is_deleted: false }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments({ is_deleted: false }),
  ]);
  return { data, total, page, limit };
}
```

**Controller file** (`<feature>.controller.ts`):
```ts
export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    res.json(await getProducts(page, limit));
  } catch (err) {
    next(err);
  }
}
```

**Router index** (`index.ts`):
```ts
const router = Router();

productsRegistry.registerPath({ method: "get", path: "/products", ... });
router.get("/", listProducts);

export default router;
```

Rules:
- `registerPath` calls live in `index.ts`, directly above the route they document — keeps the contract and the wiring co-located.
- Schemas (Zod definitions + registry) live in `<feature>.schema.ts` — `index.ts` imports them.
- Call `extendZodWithOpenApi(z)` **before** importing any feature file (see `src/index.ts`).
- `src/openapi/index.ts` imports registries directly from `<feature>.schema.ts`, not from the feature's `index.ts`.
- Services must be pure functions of their arguments — no `req`, no `res`, no Express coupling.
- Soft deletes only — never hard-delete documents. All queries filter `{ is_deleted: false }`.

---

## Adding a new feature

1. Create `src/features/<name>/` with these five files: `<name>.schema.ts`, `<name>.model.ts`, `<name>.service.ts`, `<name>.controller.ts`, `index.ts`.
2. Export `<name>Registry` from `<name>.schema.ts`.
3. Add the registry to the `registries` array in `src/openapi/index.ts`.
4. Mount the router in `src/index.ts` under `/api/<name>`.

That's the full checklist — four external touch points, five internal files.

---

## Environment variables

Defined and validated in `src/config/env.ts` using Zod. The server exits on startup if any required variable is missing or malformed.

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP port | `8000` |
| `MONGO_URI` | MongoDB connection string | required |
| `NODE_ENV` | `development` / `production` / `test` | `development` |

Always import `env` from `src/config/env.ts` — never read from `process.env` directly.

---

## OpenAPI / Contract-driven development

The server generates an OpenAPI 3.0 spec at runtime from the feature registries. This spec is the contract between server and client.

- **`GET /openapi.json`** — raw spec (consumed by Postman, code generators, client SDKs)
- **`GET /docs`** — Swagger UI (interactive docs during development)

Every route must have a corresponding `registerPath` call. Undocumented routes are a bug.

The client should generate its API types/client from `/openapi.json`, not write them by hand.

---

## Development workflow

```bash
npm run dev    # tsc-watch: recompiles on save, restarts node
npm run build  # one-off tsc compile
npm start      # run compiled dist/ (production)
```

TypeScript errors block the build — fix them, don't suppress with `any` or `@ts-ignore`.

---

## Mongoose conventions

- Every model has a TypeScript interface `I<Model>` extending `Document`.
- All schemas use `{ timestamps: true }` — `createdAt` / `updatedAt` are always present.
- Use `.lean()` on read queries that don't need Mongoose document methods.
- Parallel reads use `Promise.all` — don't await them sequentially.
- Soft delete via `is_deleted: Boolean` field — all queries must filter it.

---

## Error handling

Express error handler is registered last in `src/index.ts`. Pass errors to `next(err)` from async handlers — never `res.status(500).send(...)` directly in a route.

For client errors (bad ID, not found), respond inline and `return` early — don't call `next`.

```ts
// Inline client error — return so handler stops
res.status(404).json({ message: "Not found" });
return;

// Unexpected error — delegate to error handler
next(err);
```
