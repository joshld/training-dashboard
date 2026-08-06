# GitHub Sign-In Persistence Setup

Training Log uses a small Vercel API to keep GitHub credentials out of the public GitHub Pages site.

## 1. Create a GitHub App

In GitHub, open **Settings → Developer settings → GitHub Apps → New GitHub App**.

Use:

- Homepage URL: `https://joshld.github.io/training-dashboard/`
- Callback URL: `https://<your-vercel-project>.vercel.app/api/auth/callback`
- Webhook: disabled
- Repository permission: **Contents — Read and write**
- Installation: only this account

Create the app, generate a client secret, and install it only on `joshld/training-dashboard`.

## 2. Deploy the repository to Vercel

Import this repository as a Vercel project. The GitHub Pages site remains the frontend; Vercel hosts only `/api/*`.

Set these environment variables:

| Variable | Value |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `GITHUB_CALLBACK_URL` | `https://<project>.vercel.app/api/auth/callback` |
| `PUBLIC_SITE_ORIGIN` | `https://joshld.github.io/training-dashboard/` |
| `ALLOWED_GITHUB_LOGIN` | `joshld` |
| `GITHUB_REPOSITORY` | `joshld/training-dashboard` |
| `SESSION_SECRET` | A random string of at least 32 characters |

Deploy the Vercel project.

## 3. Connect the public dashboard

Edit `docs/runtime-config.js`:

```js
window.TRAINING_LOG_CONFIG = {
  apiBaseUrl: 'https://<project>.vercel.app'
};
```

Commit that change to `main`. The Plan page will then show **Sign in with GitHub**.

## Behaviour

After sign-in, **Apply**, **Modify**, and **Keep original** send the decision to the private API. The API verifies that the GitHub login is `joshld`, updates `plans/current-plan.md` when applicable, records the decision in `coach/suggestion-decisions.md`, and commits the change to `main`.

The normal Markdown generator and GitHub Pages deployment then make the result visible on every device.

## Security notes

- Never place the GitHub client secret or an access token in `docs/`.
- Install the GitHub App only on this repository.
- Keep the GitHub App permission limited to repository contents.
- Rotate `SESSION_SECRET` to invalidate all browser sessions.
