# Figma Make preview import

This branch is a separate Figma Make import/preview branch for the existing Kredo application. The default production branch is unchanged.

- Existing application routes and UI are kept; only the public landing-page session redirect is skipped when `FIGMA_PREVIEW=1` so the UI can render without production authentication.
- Placeholder database/auth settings are only fallback defaults for this Figma preview workflow. They do not contain production credentials and cannot connect to the production database.
- Logged-in screens, database-backed data and server actions still require the application's real environment variables to function. No secrets were copied into this branch.
- Next.js standalone output is enabled only for a Figma production build (`FIGMA=1` and `NODE_ENV=production`). Normal builds without these flags keep their original configuration.

Figma Make lifecycle scripts are under `.figma/make/`.
