# Project Gorgon Tools — Features

## Favor Item Finder

Load items export and optionally character sheet, pick map and NPC, then see which of your stored items you can give to that NPC for favor (Love vs Like). Results show current favor with the NPC (if character sheet loaded) and giftable items grouped by city and storage vault. Already implemented.

---

## Storage Saver

Find duplicate item types across storage vaults so you can consolidate stacks in-game and free slots. Example: 5 mushrooms in Vault A and 6 in Vault B → combine into one stack to save a slot.

**Implementation:** Group user items by `TypeID`. For each TypeID that appears in more than one `StorageVault`, list vaults and stack sizes and show "slots you could save" (e.g. N stacks → 1 stack). Stack limits from CDN `MaxStackSize` when available; else a sensible default. Sort by slots saveable (desc) or item name.

---

## Full Inventory

Break out everything the character has into categories (Equipment, Consumables, Potions, Gardening, Ingredients, Cooking, Ability ingredients, Nature, Brewing, Other). Categories are derived from CDN **Keywords**; each item is assigned to one category by keyword priority. Equipment and other items show the game export **Name** so mod info (e.g. "Sword: Decapitate 5") is visible. Table layout with Icon, Name, Qty, and Location(s) per category; on narrow viewports the table becomes a stacked card-like layout so there is no horizontal scroll.

---

## Mod finder (by skill)

Find mods based on a specific skill. Details TBD.

*Stub: placeholder + "Coming soon" in UI.*
