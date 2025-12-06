# Convex Generated Files

This directory contains generated files from Convex.

## Build-time Stub

The `api.js` file in this directory is a **stub** used during Vercel builds when the real generated files don't exist yet.

## Generating Real Files

To generate the real API files, run:

```bash
npx convex dev
```

This will:
1. Connect to your Convex project
2. Generate the real `api.js` and TypeScript definition files
3. Replace the stub with actual function references

## Important Notes

- The stub file allows the build to succeed even without running `npx convex dev`
- At runtime, if Convex is not configured (no `CONVEX_DEPLOY_KEY`), the app will gracefully handle missing Convex functionality
- The stub will be overwritten when you run `npx convex dev` locally
- For production, ensure you've run `npx convex dev` at least once to generate the real files, or the stub will be used

