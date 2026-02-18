# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project does not use semantic versioning (no version numbers yet).

---

## [Unreleased]

### Added

- **Multi-feature UI** — Tabs for Favor Finder, Storage Saver, Full Inventory, and Mod Finder. Load items and character sheet once; data is shared across all features (no re-upload when switching).
- **Storage Saver** — Find duplicate item types across storage vaults. Shows only items where consolidating stacks would actually save slots. For each item: icon, name, “You could save N slot(s) by consolidating,” and a list of locations as *Map: Vault — count* (e.g. *Serbule: Council Vault — 5*). Uses CDN `MaxStackSize` when available for slot math.
- **Full Inventory** and **Mod Finder** — Stub panels with “Coming soon” copy.
- **FEATURES.md** — Documented all four features and implementation notes for later.
- **CHANGELOG.md** — This file.
- **.gitignore** — Game export patterns (`Character_*.json`, `*_items_*.json`) and plan artifacts (`.cursor/`, `*.plan.md`).
- Mobile-friendly touch targets (44px+ height) on tabs and primary buttons.

### Changed

- App title and scope: “Favor Item Finder” → “Project Gorgon Tools” with a shared data section and feature tabs.
- README updated to describe the multi-feature app, shared data, and file list including FEATURES.md and CHANGELOG.md.

---

## Initial release (Favor Item Finder)

- Favor Item Finder: load items export and optional character sheet, pick map/NPC, see giftable items (Love/Like) and current favor, grouped by city and vault with item icons.
- Plain HTML, CSS, and JavaScript; no build step; CDN fallback to local `data/` folder.
