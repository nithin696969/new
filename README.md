# AMFI Portfolio Value Tracker

Static frontend for calculating mutual fund holding value from AMFI NAV data.

## What it does

- Loads AMFI `NAVAll.txt` data through a browser fetch when available
- Supports manual paste of the AMFI text if the source blocks direct browser access
- Lets you search by fund name and enter units
- Calculates portfolio value instantly using the latest NAV in the loaded data

## Files

- `index.html`
- `styles.css`
- `app.js`

## How to use locally

1. Open `index.html` in a browser, or publish the folder to GitHub Pages.
2. Click `Fetch live AMFI data`.
3. If live fetch fails, open the AMFI NAV text file, copy its contents, paste into the text area, and click `Parse pasted data`.
4. Search the scheme name and enter units.

## AMFI source

- `https://portal.amfiindia.com/spages/NAVAll.txt`
- Fallback: `https://www.amfiindia.com/spages/NAVAll.txt`

## Notes

- This app is frontend-only, so there is no backend or database.
- Some browsers or hosting setups may block direct cross-origin fetches from AMFI. The paste option is included for reliability on GitHub Pages.
