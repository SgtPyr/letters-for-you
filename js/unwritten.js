(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const DB_NAME = "lettersForYouUnwritten";
  const DB_VERSION = 1;
  const STORE_NAME = "vault";
  const META_KEY = "vault-meta";
  const ITERATIONS = 310000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let db = null;
  let activeKey = null;
  let entries = [];
  let activeId = null;
  let saveTimer = null;
  let openTimer = null;
  let longPressTarget = null;
  let stage = 0;
  let patternIndex = 0;

  // Puzzle is a curiosity gate, not a security boundary. Encryption is the protection.
  const pattern = ["brand", "footer", "mobile", "signature", "reader", "bottom"];
  const targetSelectors = [
    [".brand", "brand"],
    [".footer-heart", "footer"],
    [".mobile-heart", "mobile"],
    [".signature-heart", "signature"],
    [".reader-decoration", "reader"],
    [".bottom-heart", "bottom"]
  ];

  function message(text) {
    const node = $("#unwrittenMessage");
    if (node) node.textContent = text || "";
  }

  function bytesToBase64(bytes) {
    let binary = "";
    new Uint8Array(bytes).forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }
  function base64ToBytes(value) {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }
  function randomBytes(length) {
    return crypto.getRandomValues(new Uint8Array(length));
  }
  async function deriveKey(passphrase, salt) {
    const material = await crypto.subtle.importKey(
      "raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
      material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
  }
  async function encryptObject(value, key) {
    const iv = randomBytes(12);
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(value))
    );
    return { iv: bytesToBase64(iv), data: bytesToBase64(cipher) };
  }
  async function decryptObject(record, key) {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(record.iv) },
      key, base64ToBytes(record.data)
    );
    return JSON.parse(decoder.decode(plain));
  }
  function openDB() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onerror = () => reject(request.error || new Error("Storage unavailable."));
    });
  }
  async function getRecord(key) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }
  async function putRecord(key, value) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Could not save encrypted data."));
      tx.onabort = () => reject(tx.error || new Error("Save cancelled."));
    });
  }
  async function deleteRecord(key) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  function showAuth() {
    $("#unwrittenSetup").hidden = true;
    $("#unwrittenUnlock").hidden = true;
    $("#unwrittenWorkspace").hidden = true;
    $("#unwrittenPass").value = "";
    $("#unwrittenNewPass").value = "";
    $("#unwrittenConfirmPass").value = "";
    message("");
  }
  async function openVault() {
    const overlay = $("#unwrittenOverlay");
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    showAuth();
    try {
      const meta = await getRecord(META_KEY);
      if (meta) $("#unwrittenUnlock").hidden = false;
      else $("#unwrittenSetup").hidden = false;
    } catch (error) {
      message("Private storage is unavailable in this browser. Use a current browser on HTTPS.");
    }
  }
  function closeVault() {
    clearTimeout(saveTimer);
    clearTimeout(openTimer);
    activeKey = null;
    entries = [];
    activeId = null;
    $("#unwrittenOverlay").hidden = true;
    document.body.style.overflow = "";
    showAuth();
    $("#unwrittenEntryList").replaceChildren();
    $("#unwrittenTitle").value = "";
    $("#unwrittenBody").value = "";
    $("#unwrittenSaveStatus").textContent = "Locked.";
  }
  function showWorkspace() {
    $("#unwrittenSetup").hidden = true;
    $("#unwrittenUnlock").hidden = true;
    $("#unwrittenWorkspace").hidden = false;
    renderEntries();
    if (!entries.length) newEntry();
    message("");
  }
  async function createVault() {
    const first = $("#unwrittenNewPass").value;
    const second = $("#unwrittenConfirmPass").value;
    if (first.length < 8) return message("Use at least 8 characters.");
    if (first !== second) return message("Those passphrases do not match.");
    try {
      const salt = randomBytes(16);
      const key = await deriveKey(first, salt);
      const verifier = await encryptObject({ check: "unwritten-v1" }, key);
      await putRecord(META_KEY, { version: 1, salt: bytesToBase64(salt), verifier });
      activeKey = key;
      entries = [];
      await putRecord("entries", await encryptObject([], activeKey));
      showWorkspace();
    } catch (error) {
      message("Could not create the private space: " + error.message);
    }
  }
  async function unlockVault() {
    const pass = $("#unwrittenPass").value;
    if (!pass) return message("Enter your passphrase first.");
    try {
      const meta = await getRecord(META_KEY);
      if (!meta) {
        $("#unwrittenUnlock").hidden = true;
        $("#unwrittenSetup").hidden = false;
        return;
      }
      const key = await deriveKey(pass, base64ToBytes(meta.salt));
      const verification = await decryptObject(meta.verifier, key);
      if (verification.check !== "unwritten-v1") throw new Error("Incorrect passphrase.");
      const encryptedEntries = await getRecord("entries");
      entries = encryptedEntries ? await decryptObject(encryptedEntries, key) : [];
      if (!Array.isArray(entries)) throw new Error("Vault data is invalid.");
      activeKey = key;
      showWorkspace();
    } catch {
      activeKey = null;
      entries = [];
      message("Could not unlock. Check the passphrase and try again.");
    }
  }
  function safeDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  }
  function renderEntries() {
    const list = $("#unwrittenEntryList");
    const query = ($("#unwrittenSearch").value || "").trim().toLowerCase();
    list.replaceChildren();
    entries
      .filter(entry => `${entry.title} ${entry.body}`.toLowerCase().includes(query))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .forEach(entry => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "unwritten-entry-button";
        button.setAttribute("aria-current", String(entry.id === activeId));
        const title = document.createElement("strong");
        title.textContent = entry.title || "Untitled page";
        const date = document.createElement("small");
        date.textContent = safeDate(entry.updatedAt);
        button.append(title, date);
        button.addEventListener("click", () => selectEntry(entry.id));
        list.appendChild(button);
      });
  }
  function selectEntry(id) {
    const entry = entries.find(item => item.id === id);
    if (!entry) return;
    activeId = id;
    $("#unwrittenTitle").value = entry.title;
    $("#unwrittenBody").value = entry.body;
    $("#unwrittenSaveStatus").textContent = "Saved " + safeDate(entry.updatedAt);
    $("#unwrittenDelete").disabled = false;
    renderEntries();
  }
  function newEntry() {
    const entry = { id: crypto.randomUUID(), title: "", body: "", createdAt: Date.now(), updatedAt: Date.now() };
    entries.unshift(entry);
    activeId = entry.id;
    $("#unwrittenTitle").value = "";
    $("#unwrittenBody").value = "";
    $("#unwrittenSaveStatus").textContent = "New page. Save when ready.";
    $("#unwrittenDelete").disabled = true;
    renderEntries();
    $("#unwrittenTitle").focus();
  }
  async function persistEntries() {
    if (!activeKey) return;
    const entry = entries.find(item => item.id === activeId);
    if (!entry) return;
    entry.title = $("#unwrittenTitle").value;
    entry.body = $("#unwrittenBody").value;
    entry.updatedAt = Date.now();
    try {
      await putRecord("entries", await encryptObject(entries, activeKey));
      $("#unwrittenSaveStatus").textContent = "Encrypted and saved just now.";
      renderEntries();
    } catch (error) {
      $("#unwrittenSaveStatus").textContent = "Save failed: " + error.message;
    }
  }
  function scheduleSave() {
    $("#unwrittenSaveStatus").textContent = "Unsaved changes…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistEntries, 500);
  }
  async function deleteEntry() {
    if (!activeKey || !activeId) return;
    const id = activeId;
    entries = entries.filter(entry => entry.id !== id);
    activeId = null;
    await putRecord("entries", await encryptObject(entries, activeKey));
    if (entries.length) selectEntry(entries[0].id);
    else newEntry();
    message("Page deleted.");
  }
  async function exportBackup() {
    if (!activeKey) return;
    await persistEntries();
    const meta = await getRecord(META_KEY);
    const encryptedEntries = await getRecord("entries");
    const backup = {
      format: "letters-for-you-unwritten-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      meta,
      encryptedEntries
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unwritten-encrypted-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message("Encrypted backup exported. Store it somewhere private.");
  }
  async function importBackup(file) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (backup.format !== "letters-for-you-unwritten-backup" ||
          backup.version !== 1 || !backup.meta?.salt || !backup.meta?.verifier ||
          !backup.encryptedEntries?.iv || !backup.encryptedEntries?.data) {
        throw new Error("That file is not a supported Unwritten backup.");
      }
      // Verify the backup against the passphrase for the currently unlocked vault.
      await decryptObject(backup.meta.verifier, activeKey);
      await decryptObject(backup.encryptedEntries, activeKey);
      await putRecord(META_KEY, backup.meta);
      await putRecord("entries", backup.encryptedEntries);
      entries = await decryptObject(backup.encryptedEntries, activeKey);
      activeId = null;
      showWorkspace();
      message("Backup restored.");
    } catch {
      message("Could not restore this backup. It may belong to a different passphrase.");
    } finally {
      $("#unwrittenImport").value = "";
    }
  }
  function startStageOne() {
    if (stage !== 0) return;
    stage = 1;
    patternIndex = 0;
    message("");
  }
  function patternHit(name) {
    if (stage !== 1) return;
    if (name !== pattern[patternIndex]) {
      // Wrong interactions quietly reset the sequence, without revealing a hint.
      patternIndex = 0;
      return;
    }
    patternIndex += 1;
    if (patternIndex === pattern.length) {
      stage = 2;
      const crescent = document.createElement("button");
      crescent.type = "button";
      crescent.className = "unwritten-crescent";
      crescent.setAttribute("aria-label", "A small crescent");
      crescent.textContent = "☾";
      crescent.title = "";
      document.body.appendChild(crescent);
      crescent.addEventListener("pointerdown", () => {
        clearTimeout(openTimer);
        openTimer = setTimeout(() => {
          stage = 0;
          crescent.remove();
          openVault();
        }, 3000);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(type =>
        crescent.addEventListener(type, () => clearTimeout(openTimer))
      );
      message("");
    }
  }
  function bindPuzzle() {
    const brand = $(".brand");
    if (brand) {
      brand.addEventListener("pointerdown", () => {
        clearTimeout(openTimer);
        openTimer = setTimeout(startStageOne, 3000);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(type =>
        brand.addEventListener(type, () => clearTimeout(openTimer))
      );
    }
    targetSelectors.forEach(([selector, name]) => {
      document.querySelectorAll(selector).forEach(node => {
        node.addEventListener("click", event => {
          if (stage === 1) {
            event.preventDefault();
            event.stopPropagation();
            patternHit(name);
          }
        }, true);
      });
    });
  }
  function bindUI() {
    $("#unwrittenClose").addEventListener("click", closeVault);
    $("#unwrittenCreateVault").addEventListener("click", createVault);
    $("#unwrittenUnlockBtn").addEventListener("click", unlockVault);
    $("#unwrittenNewEntry").addEventListener("click", newEntry);
    $("#unwrittenLock").addEventListener("click", closeVault);
    $("#unwrittenExport").addEventListener("click", exportBackup);
    $("#unwrittenDelete").addEventListener("click", deleteEntry);
    $("#unwrittenSearch").addEventListener("input", renderEntries);
    $("#unwrittenTitle").addEventListener("input", scheduleSave);
    $("#unwrittenBody").addEventListener("input", scheduleSave);
    $("#unwrittenEditor").addEventListener("submit", event => {
      event.preventDefault();
      clearTimeout(saveTimer);
      persistEntries();
    });
    $("#unwrittenImport").addEventListener("change", event => importBackup(event.target.files?.[0]));
    ["unwrittenPass", "unwrittenNewPass", "unwrittenConfirmPass"].forEach(id => {
      $("#" + id).addEventListener("keydown", event => {
        if (event.key === "Enter") {
          if (id === "unwrittenPass") unlockVault();
          else if (id === "unwrittenConfirmPass") createVault();
        }
      });
    });
    $("#unwrittenOverlay").addEventListener("keydown", event => {
      if (event.key === "Escape") closeVault();
    });
  }
  function init() {
    bindUI();
    bindPuzzle();
    $("#unwrittenDelete").disabled = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
