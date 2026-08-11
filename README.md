# OFFLOOP — GitHub Pages + Decap CMS

## Structure

- `index.html` — public website
- `assets/css/style.css` — design
- `assets/js/app.js` — archive/exhibition loading and routing
- `admin/` — Decap CMS
- `content/archive/` — archive entries
- `content/exhibitions/` — exhibition entries
- `assets/images/` — uploaded images

## Important

This version uses Netlify Identity + Git Gateway for Decap CMS authentication.
The public site itself is intended to remain on GitHub Pages.

After replacing the files, enable GitHub Pages from:
Settings → Pages → Deploy from a branch → main / root.

Then configure a Netlify site for authentication. See the instructions supplied with this package.
