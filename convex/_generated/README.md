# Convex Generated Files

This directory contains generated files from Convex.

## Generating Real Files

To generate the real API files, run:

```bash
npx convex dev
```

This will:
1. Connect to your Convex project
2. Generate the real `api.js` and TypeScript definition files
3. Automatically push `CONVEX_DEPLOY_KEY` to Vercel environment variables
4. Replace any stub files with actual function references

## Important Notes

- **Commit the generated files**: The `_generated` folder should be committed to git so Vercel builds can use the real API files
- **After running `npx convex dev`**: The real generated files will replace the stub
- **Vercel Integration**: When you run `npx convex dev`, it automatically sets `CONVEX_DEPLOY_KEY` in your Vercel project
- **Build Process**: Vercel will use the committed generated files during build, so the app works correctly

## Stub File

The `api.js` file starts as a stub for initial builds. Once you run `npx convex dev`, it will be replaced with the real generated API.

