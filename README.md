# AMFI Portfolio Value Tracker

Frontend app for calculating mutual fund holding value from AMFI NAV data, bundled with a lightweight Node server for deployment platforms like Railway.

## What it does

- Loads AMFI `NAVAll.txt` data through a browser fetch when available
- Supports manual paste of the AMFI text if the source blocks direct browser access
- Lets you search by fund name and enter units
- Calculates portfolio value instantly using the latest NAV in the loaded data
- Keeps search responsive by showing top matching scheme suggestions instead of rendering all schemes at once

## Files

- `index.html`
- `styles.css`
- `app.js`
- `server.js`
- `package.json`

## How to use locally

1. Run `npm start`.
2. Open `http://localhost:3000` in a browser.
3. Click `Fetch live AMFI data`.
4. If live fetch fails, open the AMFI NAV text file, copy its contents, paste into the text area, and click `Parse pasted data`.
5. Search the scheme name and enter units.

## Deploy on Railway

1. Push this repository to GitHub.
2. In Railway, create a new project and choose **Deploy from GitHub repo**.
3. Select this repository and branch.
4. Railway uses `railway.toml` + `Dockerfile` to build and run the app consistently (`node server.js`).
5. After deployment, open the generated Railway URL.

### Railway runtime notes

- The app listens on `process.env.PORT` (required for Railway), with local fallback to `3000`.
- A health endpoint is available at `/health`.
- Static assets (`index.html`, `app.js`, `styles.css`) are served by `server.js`.

## AMFI source

- `https://portal.amfiindia.com/spages/NAVAll.txt`
- Fallback: `https://www.amfiindia.com/spages/NAVAll.txt`

## Notes

- This app is frontend-only, so there is no backend or database.
- Some browsers or hosting setups may block direct cross-origin fetches from AMFI. The paste option is included for reliability on GitHub Pages.
