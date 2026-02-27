# Agent Instructions for Time Zone Converter

This project is a frontend-only time zone converter built with UI5 Web Components, TypeScript, and Vite.

## Tech Stack
- **Framework:** [UI5 Web Components](https://ui5.github.io/webcomponents/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Linting/Formatting:** [oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)

## Project Structure
- `index.html`: Entry HTML file.
- `src/main.ts`: Entry TypeScript file.
- `src/`: Contains all source code.
- `vite.config.ts`: Vite and Vitest configuration.
- `tsconfig.json`: TypeScript configuration.

## Development Commands
- `pnpm dev`: Start the local development server.
- `pnpm build`: Build the project for production.
- `pnpm test`: Run tests using Vitest.
- `pnpm run lint`: Lint the codebase using oxlint.
- `pnpm run format`: Format the codebase using oxfmt.

## Coding Guidelines
- Use UI5 Web Components for UI elements.
- Ensure all new components are tested with Vitest.
- Run `pnpm run lint` and `pnpm run format` before submitting changes.
- Avoid adding backend or database dependencies.
