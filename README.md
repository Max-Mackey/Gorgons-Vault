# Favor Item Finder

A small browser tool for **Project Gorgon** that shows which of your stored items you can give to an NPC for favor, and whether they count as **Love** or **Like**.

## What it does

- Load your **items export** (and optionally your **character sheet**) from the game.
- Pick a **map** and **NPC**.
- See your **current favor** with that NPC (if you loaded a character sheet for the same character).
- See a list of **giftable items** from your storage: grouped by **city**, then by **storage vault**, with Love vs Like and item icons.

All processing runs in your browser; your files never leave your machine.

## How to run it

1. **Serve the folder over HTTP** (required so the app can load CDN data and your JSON files).
   - From this folder, run for example:
     - `npx serve`
     - or `python -m http.server 8000`
   - Open the URL in your browser (e.g. `http://localhost:3000` or `http://localhost:8000`).

2. **Your data**
   - **Items export** (required): Choose the JSON from the game’s storage/items export. Must include an `Items` array and can include a `Character` name.
   - **Character sheet** (optional): Choose the character sheet JSON if you want to see “Current favor with &lt;NPC&gt;” for the selected NPC. The sheet’s `Character` value should match the character from your items export.

3. **Select NPC**
   - Choose **Map**, then **NPC**, then click **Show my giftable items**.

4. **Results**
   - Your current favor with that NPC (if a matching character sheet was loaded).
   - Giftable items grouped by city and storage, with Love/Like and icons.

## Where the game data comes from

The app loads NPCs, items, storage vaults, and areas from the Project Gorgon CDN:

- `https://cdn.projectgorgon.com/v457/data/`

If the CDN is unreachable (e.g. offline or blocked), you can use local copies:

1. Download `npcs.json`, `items.json`, `storagevaults.json`, and `areas.json` from the [CDN data](https://cdn.projectgorgon.com/v457/data/).
2. Put them in a `data/` folder next to `index.html`.
3. Serve the project with a local server as above.

Icons are loaded from `https://cdn.projectgorgon.com/v457/icons/`.

## Files in this project

| File            | Purpose                          |
|-----------------|----------------------------------|
| `index.html`    | Main page and structure          |
| `app.js`        | Logic, CDN load, matching, UI    |
| `style.css`     | Layout and styling               |
| `README.md`     | This file                        |

The `Character_*.json` and `*_items_*.json` files are example exports from the game; use your own via the file pickers.

## Tech notes

- No build step; plain HTML, CSS, and JavaScript.
- Uses the browser `FileReader` API for your JSON; no upload to any server.
- Requires a local HTTP server to avoid CORS/file-access issues with the CDN and `fetch`.

---

Some portions of the game data are copyright Elder Game, LLC.
