<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/banner-dark.png" />
  <img src="brand/banner-light.png" alt="The Whirl mark" width="100%" />
</picture>

<h1 align="center">Whirl</h1>

<p align="center">
  The AI chat app that sweats the details. Every top model, real memory,<br />
  living documents, and your own tools, in one fast and friendly place.
</p>

<p align="center">
  <a href="https://whirl.chat">whirl.chat</a> ·
  <a href="docs/self-hosting.md">Self-hosting</a> ·
  <a href="docs/architecture.md">Architecture</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

Whirl is a full-stack AI chat app built on Next.js and Convex. It's the code
behind [whirl.chat](https://whirl.chat), published in full under the MIT
license. Read it, run your own, or help make it better.

## Features

- **Every top model** in one conversation, routed through
  [OpenRouter](https://openrouter.ai), with adjustable thinking levels.
- **Living artifacts:** documents, charts, and full interactive pages that
  stay editable in a side panel and can be shared by link.
- **Integrations** with your own tools over MCP (OAuth included), plus
  installable skills that teach Whirl new tricks.
- **Long-term memory** that carries preferences and projects across chats.
- **Live web search** and page reading for answers grounded in today's web.
- **Locked chats**, encrypted on your device with a password the server never
  sees, answered only by zero-retention models.
- **Incognito mode**, message queueing, voice input, image generation, file
  attachments, folders, sharing, and a lot of care around motion and polish.
- **Light and dark mode**, accent colors, and an installable mobile web app.

## Tech stack

| Layer     | What it uses                                                         |
| --------- | -------------------------------------------------------------------- |
| Web app   | [Next.js 16](https://nextjs.org), React 19, Tailwind CSS v4, Motion  |
| Backend   | [Convex](https://convex.dev): database, functions, streaming, crons  |
| Auth      | [Clerk](https://clerk.com)                                           |
| Models    | [OpenRouter](https://openrouter.ai) via the [AI SDK](https://ai-sdk.dev) |
| Tooling   | [Bun](https://bun.sh) workspaces, TypeScript                         |

Everything beyond Convex, Clerk, and OpenRouter is **optional** and switches
on with its own keys: billing (Autumn), web search (Exa), memory
(Supermemory), analytics (PostHog, Axiom), tracing (Braintrust), email
(Resend), and the support agent (Median). Leave them out and Whirl hides the
features they power. See [docs/configuration.md](docs/configuration.md).

## Quick start

You'll need [Bun](https://bun.sh), a free [Convex](https://convex.dev)
account, a [Clerk](https://clerk.com) application, and an
[OpenRouter](https://openrouter.ai) API key.

```sh
git clone https://github.com/whirlchat/whirl.git
cd whirl
bun install

# 1. Create a Convex dev deployment and push the backend.
cd packages/backend
bunx convex dev            # first run walks you through creating a project

# 2. In another terminal, give the backend its secrets.
bunx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-instance.clerk.accounts.dev
bunx convex env set OPENROUTER_API_KEY sk-or-v1-...

# 3. Point the web app at Convex and Clerk.
cd ../../apps/v2
cp .env.example .env.local  # then fill in the four required values

# 4. Run everything from the repo root.
cd ../..
bun run dev
```

Open [localhost:3000](http://localhost:3000) and say hi. The
[self-hosting guide](docs/self-hosting.md) covers each step in detail,
including the Clerk JWT template Convex needs and how to deploy to
production.

## One-Click Deploy

[![Deploy on RepoCloud](https://d16t0pc4846x52.cloudfront.net/deploylobe.svg)](https://repocloud.io/details/Whirl/)

## Repository layout

```
apps/
  v2/         The web app (Next.js). This is the one in production.
  console/    Admin console for models, integrations, and skills (Vite)
  mobile/     Native app (Expo)
  waitlist/   Standalone waitlist page
  remotion/   Promo video compositions
  legacy/     The previous web app, kept for reference. Not maintained.
packages/
  backend/    Convex backend: schema, functions, and the AI pipeline
docs/         Guides for self-hosting, configuration, and architecture
brand/        Logo, colors, banners, and app icons
```

## Documentation

- [Self-hosting](docs/self-hosting.md): run Whirl locally and in production
- [Configuration](docs/configuration.md): every environment variable and
  what it switches on
- [Architecture](docs/architecture.md): how a message travels from the
  composer to the model and back
- [Contributing](CONTRIBUTING.md): conventions, checks, and pull requests

## Contributing

Bug reports, ideas, and pull requests are all welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md), and please follow the
[code of conduct](CODE_OF_CONDUCT.md). Found a security issue? See
[SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Anterra
