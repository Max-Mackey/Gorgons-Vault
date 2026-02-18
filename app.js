(function () {
  'use strict';

  const CDN_BASE = 'https://cdn.projectgorgon.com/v457/data';
  const CDN_ICONS_BASE = 'https://cdn.projectgorgon.com/v457/icons';
  const DATA_BASE = './data';

  let npcs = {};
  let items = {};
  let storageVaults = {};
  let areas = {};
  let charactersItems = {};
  let charactersSheets = {};
  let giftableNpcs = [];
  let maps = [];

  const $ = (id) => document.getElementById(id);
  const itemsFiles = $('itemsFiles');
  const characterFiles = $('characterFiles');
  const mapSelect = $('mapSelect');
  const npcSelect = $('npcSelect');
  const submitBtn = $('submitBtn');
  const dataStatus = $('dataStatus');
  const resultsSection = $('resultsSection');
  const npcFavorEl = $('npcFavor');
  const resultsList = $('resultsList');
  const noMatches = $('noMatches');
  const cdnError = $('cdnError');
  const storageSaverBtn = $('storageSaverBtn');
  const storageSaverStatus = $('storageSaverStatus');
  const storageSaverResults = $('storageSaverResults');
  const PANEL_ID = 'data-panel';

  function setStatus(msg) {
    dataStatus.textContent = msg;
  }

  function normalizeItemKey(typeId) {
    return 'item_' + Number(typeId);
  }

  function itemKeywordBase(kw) {
    if (typeof kw !== 'string') return '';
    const eq = kw.indexOf('=');
    return eq >= 0 ? kw.slice(0, eq) : kw;
  }

  function hasKeywordMatch(itemKeywords, preferenceKeywords) {
    const bases = new Set((itemKeywords || []).map(itemKeywordBase));
    return (preferenceKeywords || []).some((pk) => bases.has(pk));
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    return res.json();
  }

  async function loadCdn() {
    const tryUrl = (base, file) => base + '/' + file;
    try {
      npcs = await fetchJson(tryUrl(CDN_BASE, 'npcs.json'));
    } catch (e) {
      try {
        npcs = await fetchJson(tryUrl(DATA_BASE, 'npcs.json'));
      } catch (e2) {
        throw new Error('Could not load npcs.json');
      }
    }
    try {
      items = await fetchJson(tryUrl(CDN_BASE, 'items.json'));
    } catch (e) {
      try {
        items = await fetchJson(tryUrl(DATA_BASE, 'items.json'));
      } catch (e2) {
        throw new Error('Could not load items.json');
      }
    }
    try {
      storageVaults = await fetchJson(tryUrl(CDN_BASE, 'storagevaults.json'));
    } catch (e) {
      try {
        storageVaults = await fetchJson(tryUrl(DATA_BASE, 'storagevaults.json'));
      } catch (e2) {
        storageVaults = {};
      }
    }
    try {
      areas = await fetchJson(tryUrl(CDN_BASE, 'areas.json'));
    } catch (e) {
      try {
        areas = await fetchJson(tryUrl(DATA_BASE, 'areas.json'));
      } catch (e2) {
        areas = {};
      }
    }
    buildGiftableNpcsAndMaps();
  }

  function buildGiftableNpcsAndMaps() {
    const areaNames = new Set();
    giftableNpcs = [];
    for (const [key, data] of Object.entries(npcs)) {
      if (!key.startsWith('NPC_') || !Array.isArray(data.Preferences) || data.Preferences.length === 0) continue;
      if (data.AreaFriendlyName) areaNames.add(data.AreaFriendlyName);
      giftableNpcs.push({ key, ...data });
    }
    maps = Array.from(areaNames).sort((a, b) => a.localeCompare(b));
  }

  function populateMapDropdown() {
    mapSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '— Select map —';
    mapSelect.appendChild(opt);
    maps.forEach((m) => {
      const o = document.createElement('option');
      o.value = m;
      o.textContent = m;
      mapSelect.appendChild(o);
    });
    mapSelect.disabled = false;
  }

  function populateNpcDropdown(areaFriendlyName) {
    npcSelect.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = areaFriendlyName ? '— Select NPC —' : '— Choose a map first —';
    npcSelect.appendChild(opt);
    if (!areaFriendlyName) {
      npcSelect.disabled = true;
      return;
    }
    const filtered = giftableNpcs.filter((n) => n.AreaFriendlyName === areaFriendlyName);
    filtered.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
    filtered.forEach((n) => {
      const o = document.createElement('option');
      o.value = n.key;
      o.textContent = n.Name || n.key;
      npcSelect.appendChild(o);
    });
    npcSelect.disabled = false;
  }

  function onItemsFilesChange() {
    const file = itemsFiles.files && itemsFiles.files[0];
    charactersItems = {};
    if (!file) {
      setStatus('');
      return;
    }
    setStatus('Reading items file…');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const name = (data.Character || file.name || 'Unknown').trim() || file.name;
        if (!data.Items || !Array.isArray(data.Items)) {
          setStatus('File has no Items array.');
          return;
        }
        charactersItems[name] = data.Items;
        setStatus('Loaded items from ' + file.name + '.');
      } catch (e) {
        setStatus('Invalid JSON: ' + e.message);
      }
    };
    reader.readAsText(file);
  }

  function onCharacterFilesChange() {
    const file = characterFiles.files && characterFiles.files[0];
    charactersSheets = {};
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const name = (data.Character || file.name || 'Unknown').trim() || file.name;
        charactersSheets[name] = data;
        const prev = dataStatus.textContent || '';
        setStatus(prev ? prev + ' Character sheet loaded.' : 'Character sheet loaded.');
      } catch (_) {
        setStatus('Invalid character sheet JSON.');
      }
    };
    reader.readAsText(file);
  }

  function getCdnItem(typeId) {
    const key = normalizeItemKey(typeId);
    return items[key] || null;
  }

  function runMatch() {
    const npcKey = npcSelect.value;
    if (!npcKey) {
      resultsSection.hidden = false;
      npcFavorEl.innerHTML = '';
      resultsList.innerHTML = '';
      noMatches.hidden = false;
      noMatches.textContent = 'Please select a map and an NPC.';
      return;
    }
    const characterNames = Object.keys(charactersItems);
    const userItems = characterNames.length ? charactersItems[characterNames[0]] : null;
    if (!userItems || !userItems.length) {
      resultsSection.hidden = false;
      npcFavorEl.innerHTML = '';
      resultsList.innerHTML = '';
      noMatches.hidden = false;
      noMatches.textContent = 'No items loaded.';
      return;
    }
    const npc = npcs[npcKey];
    if (!npc || !npc.Preferences) {
      resultsSection.hidden = false;
      npcFavorEl.innerHTML = '';
      resultsList.innerHTML = '';
      noMatches.hidden = false;
      noMatches.textContent = 'No preferences for this NPC.';
      return;
    }
    const loveLike = npc.Preferences.filter((p) => p.Desire === 'Love' || p.Desire === 'Like');
    const matches = [];
    for (const row of userItems) {
      const typeId = row.TypeID;
      const cdnItem = getCdnItem(typeId);
      if (!cdnItem || !Array.isArray(cdnItem.Keywords)) continue;
      const itemKeywordBases = (cdnItem.Keywords || []).map(itemKeywordBase);
      let bestDesire = null;
      let bestPrefName = null;
      for (const pref of loveLike) {
        if (!hasKeywordMatch(cdnItem.Keywords, pref.Keywords)) continue;
        if (pref.Desire === 'Love') {
          bestDesire = 'Love';
          bestPrefName = pref.Name;
          break;
        }
        if (pref.Desire === 'Like' && bestDesire !== 'Love') {
          bestDesire = 'Like';
          bestPrefName = pref.Name;
        }
      }
      if (bestDesire) {
        matches.push({
          name: row.Name || cdnItem.Name || 'Unknown',
          stackSize: row.StackSize ?? 1,
          value: row.Value ?? cdnItem.Value ?? 0,
          storageVault: row.StorageVault || 'Unknown',
          desire: bestDesire,
          preferenceName: bestPrefName,
          iconId: cdnItem.IconId != null ? cdnItem.IconId : null,
        });
      }
    }
    const characterName = characterNames[0];
    const sheet = charactersSheets[characterName];
    const npcFavorLevel = sheet && sheet.NPCs && sheet.NPCs[npcKey] ? (sheet.NPCs[npcKey].FavorLevel || null) : null;
    renderResults(npc.Name || npcKey, npcFavorLevel, matches);
  }

  function vaultFriendlyName(vaultId) {
    if (!vaultId) return vaultId;
    const v = storageVaults[vaultId];
    return (v && v.NpcFriendlyName) ? v.NpcFriendlyName : vaultId;
  }

  function vaultCityHeading(vaultId) {
    if (!vaultId) return null;
    const v = storageVaults[vaultId];
    if (!v) return null;
    const areaKey = v.Grouping || v.Area;
    if (!areaKey || areaKey === '*') return 'Any city';
    const a = areas[areaKey];
    return (a && a.FriendlyName) ? a.FriendlyName : areaKey;
  }

  function renderItemLi(m) {
    const li = document.createElement('li');
    li.className = 'item-row';
    if (m.iconId != null) {
      const img = document.createElement('img');
      img.src = CDN_ICONS_BASE + '/icon_' + m.iconId + '.png';
      img.alt = '';
      img.className = 'item-icon';
      li.appendChild(img);
    }
    const text = document.createElement('span');
    text.className = 'item-text';
    text.textContent = m.name + ' × ' + m.stackSize + (m.value ? ' (value ' + m.value + ')' : '') + (m.preferenceName ? ' — ' + m.preferenceName : '');
    li.appendChild(text);
    return li;
  }

  function renderResults(npcDisplayName, favorLevel, matches) {
    resultsSection.hidden = false;
    noMatches.hidden = matches.length > 0;
    if (matches.length === 0) {
      noMatches.textContent = 'No items in your inventory match this NPC\'s likes or loves.';
    }
    npcFavorEl.innerHTML = '';
    if (favorLevel) {
      const favorP = document.createElement('p');
      favorP.className = 'favor-level';
      favorP.textContent = 'Current favor with ' + npcDisplayName + ': ' + favorLevel;
      npcFavorEl.appendChild(favorP);
    } else {
      const favorP = document.createElement('p');
      favorP.className = 'favor-level favor-unknown';
      favorP.textContent = 'Current favor with ' + npcDisplayName + ': load character sheet to see';
      npcFavorEl.appendChild(favorP);
    }
    resultsList.innerHTML = '';
    const byVault = {};
    for (const m of matches) {
      const v = m.storageVault;
      if (!byVault[v]) byVault[v] = { Love: [], Like: [] };
      byVault[v][m.desire].push(m);
    }
    const vaultIds = Object.keys(byVault);
    const byCity = {};
    for (const vaultId of vaultIds) {
      const city = vaultCityHeading(vaultId) || 'Other';
      if (!byCity[city]) byCity[city] = [];
      byCity[city].push(vaultId);
    }
    const cityOrder = Object.keys(byCity).sort((a, b) => {
      if (a === 'Any city') return 1;
      if (b === 'Any city') return -1;
      return a.localeCompare(b);
    });
    resultsList.innerHTML = '';
    cityOrder.forEach((cityLabel) => {
      const citySection = document.createElement('div');
      citySection.className = 'city-group';
      const cityHeading = document.createElement('h2');
      cityHeading.className = 'city-heading';
      cityHeading.textContent = cityLabel;
      citySection.appendChild(cityHeading);
      const vaultsInCity = byCity[cityLabel].sort((a, b) => vaultFriendlyName(a).localeCompare(vaultFriendlyName(b)));
      vaultsInCity.forEach((vaultId) => {
        const block = document.createElement('div');
        block.className = 'vault-block';
        const title = document.createElement('h3');
        title.className = 'vault-name';
        title.textContent = vaultFriendlyName(vaultId);
        block.appendChild(title);
        const loveList = byVault[vaultId].Love;
        const likeList = byVault[vaultId].Like;
        if (loveList.length) {
          const loveSection = document.createElement('div');
          loveSection.className = 'desire-section love';
          const loveTitle = document.createElement('h4');
          loveTitle.textContent = 'Love';
          loveSection.appendChild(loveTitle);
          const ul = document.createElement('ul');
          loveList.forEach((m) => ul.appendChild(renderItemLi(m)));
          loveSection.appendChild(ul);
          block.appendChild(loveSection);
        }
        if (likeList.length) {
          const likeSection = document.createElement('div');
          likeSection.className = 'desire-section like';
          const likeTitle = document.createElement('h4');
          likeTitle.textContent = 'Like';
          likeSection.appendChild(likeTitle);
          const ul = document.createElement('ul');
          likeList.forEach((m) => ul.appendChild(renderItemLi(m)));
          likeSection.appendChild(ul);
          block.appendChild(likeSection);
        }
        citySection.appendChild(block);
      });
      resultsList.appendChild(citySection);
    });
  }

  function init() {
    document.getElementById('copyrightYear').textContent = new Date().getFullYear();
    mapSelect.innerHTML = '<option value="">— Loading CDN… —</option>';
    loadCdn()
      .then(() => {
        populateMapDropdown();
        npcSelect.innerHTML = '<option value="">— Choose a map first —</option>';
        npcSelect.disabled = true;
        cdnError.hidden = true;
        enableSubmit();
      })
      .catch((err) => {
        mapSelect.innerHTML = '<option value="">— CDN failed —</option>';
        mapSelect.disabled = true;
        cdnError.hidden = false;
        console.error(err);
      });

    mapSelect.addEventListener('change', () => {
      populateNpcDropdown(mapSelect.value);
    });

    submitBtn.addEventListener('click', runMatch);
    itemsFiles.addEventListener('change', onItemsFilesChange);
    characterFiles.addEventListener('change', onCharacterFilesChange);
    initTabs();
  }

  function enableSubmit() {
    submitBtn.disabled = false;
  }

  function switchTab(panelId) {
    document.querySelectorAll('.feature-tabs .tab').forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.feature-panel').forEach((p) => {
      p.classList.add('hidden');
    });
    const tab = document.querySelector('.feature-tabs .tab[data-panel="' + panelId + '"]');
    const panel = $(panelId);
    if (tab) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    }
    if (panel) {
      panel.classList.remove('hidden');
    }
  }

  function getFirstCharacterItems() {
    const names = Object.keys(charactersItems);
    return names.length ? charactersItems[names[0]] : null;
  }

  function runStorageSaver() {
    const userItems = getFirstCharacterItems();
    storageSaverResults.hidden = true;
    storageSaverResults.innerHTML = '';
    if (!userItems || !userItems.length) {
      storageSaverStatus.textContent = 'Load an items export above first.';
      return;
    }
    storageSaverStatus.textContent = 'Finding duplicate stacks…';
    const byTypeId = {};
    for (const row of userItems) {
      const id = row.TypeID;
      if (!byTypeId[id]) byTypeId[id] = { name: row.Name || 'Unknown', vaults: [] };
      byTypeId[id].vaults.push({
        vault: row.StorageVault || 'Unknown',
        stack: row.StackSize ?? 1,
      });
    }
    const duplicates = [];
    for (const [typeId, data] of Object.entries(byTypeId)) {
      if (data.vaults.length < 2) continue;
      const cdnItem = getCdnItem(Number(typeId));
      const name = (cdnItem && cdnItem.Name) ? cdnItem.Name : data.name;
      const maxStack = (cdnItem && cdnItem.MaxStackSize != null) ? cdnItem.MaxStackSize : 100;
      let total = 0;
      const slotsUsed = data.vaults.length;
      for (const v of data.vaults) total += v.stack;
      const slotsNeeded = Math.ceil(total / maxStack);
      const slotsSaveable = Math.max(0, slotsUsed - slotsNeeded);
      if (slotsSaveable === 0) continue;
      const iconId = (cdnItem && cdnItem.IconId != null) ? cdnItem.IconId : null;
      duplicates.push({
        typeId,
        name,
        iconId,
        vaults: data.vaults,
        total,
        maxStack,
        slotsSaveable,
      });
    }
    duplicates.sort((a, b) => b.slotsSaveable - a.slotsSaveable || a.name.localeCompare(b.name));
    storageSaverStatus.textContent = '';
    if (duplicates.length === 0) {
      storageSaverResults.hidden = false;
      const p = document.createElement('p');
      p.className = 'no-duplicates';
      p.textContent = 'No consolidatable duplicate stacks found. Items that could save slots when merged are not split across multiple vaults.';
      storageSaverResults.appendChild(p);
      return;
    }
    storageSaverResults.hidden = false;
    for (const d of duplicates) {
      const block = document.createElement('div');
      block.className = 'storage-saver-item';
      const header = document.createElement('div');
      header.className = 'storage-saver-item-header';
      if (d.iconId != null) {
        const img = document.createElement('img');
        img.src = CDN_ICONS_BASE + '/icon_' + d.iconId + '.png';
        img.alt = '';
        img.className = 'item-icon';
        header.appendChild(img);
      }
      const h3 = document.createElement('h3');
      h3.textContent = d.name;
      header.appendChild(h3);
      block.appendChild(header);
      const saveP = document.createElement('p');
      saveP.className = 'save-count';
      saveP.textContent = 'You could save ' + d.slotsSaveable + ' slot(s) by consolidating.';
      block.appendChild(saveP);
      const ul = document.createElement('ul');
      for (const v of d.vaults) {
        const li = document.createElement('li');
        const mapName = vaultCityHeading(v.vault) || 'Other';
        li.textContent = mapName + ': ' + vaultFriendlyName(v.vault) + ' — ' + v.stack;
        ul.appendChild(li);
      }
      block.appendChild(ul);
      storageSaverResults.appendChild(block);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function initTabs() {
    document.querySelectorAll('.feature-tabs .tab').forEach((t) => {
      t.addEventListener('click', () => {
        const panelId = t.getAttribute(PANEL_ID);
        if (panelId) switchTab(panelId);
      });
    });
    if (storageSaverBtn) storageSaverBtn.addEventListener('click', runStorageSaver);
  }
})();
