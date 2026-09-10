# Resume

![Release](https://img.shields.io/github/v/release/Fenriz1349/resume?label=release)
![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Personal one-page resume, built with plain HTML/CSS/JS - no framework, no build step.

**Status:** v1.0.0 - first stable release.

Live site: _add your GitHub Pages URL here once published_

## Features

- **Bilingual (FR/EN)** - a toolbar toggle switches every piece of text instantly, powered by a small translation dictionary (`i18n.js`) and persisted in `localStorage`
- **One-click PDF download** - generates a real, text-based PDF client-side with [jsPDF](https://github.com/parallax/jsPDF), matching the on-screen design (cards, badges, accent colors). No browser print dialog, no OS print header, works the same on Windows and Mac. Text stays selectable, so ATS/recruitment software can still parse it.
- **Single-page print layout** - `print.css` keeps the resume to one A4 page when printed via `Ctrl+P`/`Cmd+P`, in line with French CV conventions
- **Responsive** - two-column layout (sidebar + main content) on desktop, stacks to one column on narrow screens

## Tech stack

Vanilla HTML, CSS and JavaScript. No dependencies to install, no bundler - jsPDF is the only external library, loaded from a CDN.

## Project structure

```
index.html    Page structure and content (semantic HTML, data-i18n attributes for translated text)
style.css     Screen styles
print.css     Print-only overrides (Ctrl+P / Cmd+P), targets a single A4 page
script.js     Language switch behavior, PDF button wiring
pdf.js        Builds the downloadable PDF from the current page content
i18n.js       FR/EN translation dictionary
```

## Running locally

No build step required. Open `index.html` directly in a browser, or for the best experience (auto-reload on save):

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code
2. Right-click `index.html` -> "Open with Live Server"

## Versioning

Releases are managed by [release-please](https://github.com/googleapis/release-please), based on [Conventional Commits](https://www.conventionalcommits.org/). Merging to `main` opens an automated release PR with the version bump and changelog.
