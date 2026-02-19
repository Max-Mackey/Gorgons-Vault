# Project Gorgon Tools — Features

## Favor Item Finder

Load items export and optionally character sheet, pick map and NPC, then see which of your stored items you can give to that NPC for favor (Love vs Like). Results show current favor with the NPC (if character sheet loaded) and giftable items grouped by city and storage vault. NPC names link to the Project Gorgon Wiki for more info. Already implemented.

---

## Storage Saver

Find duplicate item types across storage vaults so you can consolidate stacks in-game and free slots. Example: 5 mushrooms in Vault A and 6 in Vault B → combine into one stack to save a slot.

**Implementation:** Group user items by `TypeID`. For each TypeID that appears in more than one `StorageVault`, list vaults and stack sizes and show "slots you could save" (e.g. N stacks → 1 stack). Stack limits from CDN `MaxStackSize` when available; else a sensible default. Sort by slots saveable (desc) or item name. Total slots saveable is shown at the top.

**Planned (for later):** A "plan" to help users maximize time when consolidating: e.g. items are listed by how many slots each consolidation saves (most first). Tip: consolidate by destination—when you're at a map, move all listed stacks for that item into one vault there so you only visit each map once. Could be surfaced in the UI as a short guidance block or kept as doc-only.

---

## Full Inventory

Break out everything the character has into categories (Equipment, Skill Book, Recipe, Work Order, Consumables, Potions, Gardening, Ingredients, Cooking, Ability ingredients, Nature, Brewing, Other). Categories are derived from CDN **Keywords** and icon (Skill Book / Recipe / Work Order). Equipment has a dedicated Mods column with treasure mods from export + `tsysclientinfo.json`; other categories do not. Table layout with Icon, Name, Qty, Location(s) (and Mods for Equipment); responsive stacked layout on narrow viewports. Mod filtering (e.g. “show only items with mod X”) is **not** planned here—that belongs in **Mod Finder**.

---

## Mod finder (by skill)


**Implemented:** Pick one or two combat skills via dropdowns; optionally fill the 2×6 ability bar for reference. The list shows all mods for the chosen skill(s) from CDN tsysclientinfo.json, grouped by equipment slot in a three-column layout. Abilities are normalized by name (one entry per ability name, e.g. one Ice Spear). Mods are keyed by skill in the data, not by specific ability, so the list shows all mods for your chosen combat skill(s) regardless of which abilities you put on the bar.

**Loadouts / autopopulate:** Current exports (items report and character sheet) do not include the current skill bar or saved loadouts. The character sheet only provides NPC favor levels. If the game adds an export that includes active skill bar or saved loadout names/slots, we could autopopulate the two combat skills and the 12 ability slots and add a Loadout dropdown. Until then, users choose skills and abilities manually.

**Planned (for later):** Filter mods by your inventory to complement Full Inventory.

---

## Item “used for” (non-equipment)

**Idea:** For non-equipment items (consumables, ingredients, etc.), show what they’re used for—e.g. which recipes use this item, or notes from CDN `itemuses.json` (when that file carries more than recipe overlap). Would help answer “why do I have this?” and “what can I make with it?” Implementation TBD (recipes.json, itemuses.json, or wiki links).

---

## Build in-app vs link to wiki

| In-app | Prefer wiki link |
|--------|-------------------|
| Your data (favor, storage, inventory, mods from your export) | Deep lore, full NPC bios, quest walkthroughs |
| Quick lookups from CDN (item names, effects, categories) | Long-form guides, community strategies |
| NPC names as links to wiki | Duplicating large wiki content |
| “Used in” / recipe hints (short list or “see wiki”) | Full recipe tables or step-by-step guides |

**Principle:** The app stays focused on *your* exports and CDN-backed lists/tables. When “more story, more context, or full guide” is needed, link to the wiki (e.g. NPC name → wiki page). New features (e.g. item “used for”) can show a short in-app summary and optionally “More on wiki” where the wiki has a dedicated item/recipe page.
