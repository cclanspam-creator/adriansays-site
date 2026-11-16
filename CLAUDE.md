# adriansays.com site

Static site built with Eleventy. Source is on `main`; the built site is on the `live` branch, which Hostinger deploys automatically.

## Layout
- `src/posts/`: one markdown file per article. Personal writing. Set `permalink` in the front matter (for example "/my-post/").
- `src/pages/`: standing pages. Files starting with `_` are reference copies of old pages and are not published.
- `src/drafts/` (if present): unpublished drafts. Never published by the build.
- `src/_settings/site.json`: site name, navigation, footer, contact email.
- `src/_includes/`, `src/assets/style.css`: templates and styling.

## Adding an article
Create a markdown file in `src/posts/` with this front matter:

    ---
    title: "Title"
    date: 2026-11-15
    topics: ["Leadership"]
    ---

## Themes and lists
- Each article keeps detailed `topics`. `eleventy.config.js` groups them into the site's seven themes (the `THEMES` map); a new topic must be added to that map or it will not appear under any theme.
- Optional front matter: `description` (the summary shown in lists; otherwise one is taken from the opening text), `image` (list thumbnail; otherwise the first image), `featured: 1` (order in "Start here" on the home page).
- `src/_settings/site.json` holds the home-page bio, portrait path and reply email. `"preview": true` tells search engines not to list the site: set it to `false` at the domain cutover.

## Publishing rules
- New articles are drafted on a branch and opened as a pull request for Adrian to approve. Do not publish new writing straight to `main`.
- No double spaces. Avoid contrastive-reframe constructions, heavy em-dash use and mirrored closing sentences in Adrian's writing.
- acerpacer.com is work; adriansays.com is everything else. Faith-framed or personal-voice pieces stay on adriansays.com.
- The domain is not switched to Hostinger until Adrian says so.

## Build
`npm ci && npm run build` writes the site to `_site/`. The GitHub Action in `.github/workflows/build.yml` does this on every push to `main` and force-pushes the result to `live`.
