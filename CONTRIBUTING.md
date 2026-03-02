# Contributing

## Getting Started

1. Fork the repo
2. Create a Google Service Account (see [docs/setup.md](docs/setup.md))
3. Copy the Sheet template
4. Set up `.env.local`
5. `npm install && npm run dev`

## Pull Request Guidelines

- One PR per feature/fix
- Must pass CI (lint + type-check + build + gitleaks)
- Update `schema.ts` if changing Sheet structure
- Update docs if changing user-facing behavior

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling
- shadcn/ui for components
