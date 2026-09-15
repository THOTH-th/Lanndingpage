# Landing Page

A clean, responsive landing page starter built with plain **HTML, CSS, and JavaScript** — no build step and no dependencies.

## Features

- ⚡ Fast by default (static files, zero dependencies)
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Easy to theme via CSS variables
- 🌗 Automatic light/dark mode (`prefers-color-scheme`)

## Structure

```
.
├── index.html    # Page markup and sections
├── styles.css    # Styles and theme variables
├── script.js     # Mobile nav, form handling, footer year
└── README.md
```

## Getting started

Just open `index.html` in your browser:

```bash
# from the project folder
open index.html      # macOS
# or serve locally
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Customize

- **Brand & colors:** edit the CSS variables at the top of `styles.css` (`--brand`, `--bg`, `--text`, ...).
- **Content:** update the text and sections in `index.html`.
- **Contact form:** `script.js` currently validates the email client-side only. Connect it to your own backend or a form service to collect submissions.

## Deploy with GitHub Pages

1. Push this repository to GitHub (already done if you're reading this here).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then **Save**.
5. Your site will be published at `https://<owner>.github.io/<repo>/`.

## License

Released under the [MIT License](LICENSE).
