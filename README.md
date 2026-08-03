# Reader

Reader is a small prototype for paginated book reading with chunk-based content.

Runtime responsibilities, progress calculation, and progress synchronization are documented in [docs/reader-runtime.md](./docs/reader-runtime.md).

## Architecture rules

The project follows Feature-Sliced Design principles.

- Keep domain and runtime logic framework-agnostic. Core modules must not depend on React, Vite, browser rendering details, or any other UI/framework runtime.
- Dependencies must point inward. App and UI layers may depend on widgets, features, entities, shared code, and core reader modules; core reader modules must not depend on app, UI, widgets, or framework-specific code.
- Put framework-specific integration at the edges. React components, hooks, DOM measurement, `localStorage`, routing, and platform APIs belong in integration/UI layers or explicit adapters.
- If core logic needs a capability provided by a framework or platform, define a small interface at the core boundary and implement it with an adapter outside the core.
- Prefer FSD public APIs for cross-slice imports. Import from slice/index entrypoints where they exist instead of reaching into another slice's internal files.
- Avoid cross-slice shortcuts that couple implementation details. Shared behavior should move to an appropriate lower layer or be exposed through a narrow public API.
