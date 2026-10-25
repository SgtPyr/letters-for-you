
"use strict";

/*
 * A Little Notebook for You
 * Complete JavaScript replacement
 * Keeps the original HTML navigation and story reader.
 */

const STORE = {
  preferences: "littleNotebook.preferences.v1",
  bookmarks: "littleNotebook.bookmarks.v1",
  quote: "littleNotebook.favoriteQuote.v1",
  openingNote: "littleNotebook.openingNote.v1",
  openingEnabled: "littleNotebook.openingNote.enabled",
  openingDate: "littleNotebook.openingNote.lastShown",
  releaseSeen: "littleNotebook.releaseSeen.v1"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

const DEFAULTS = {
  font: "serif",
  fontSize: 18,
  lineSpacing: 1.9,
  width: "comfortable",
  theme: "midnight",
  accent: "cyan"
};

const state = {
  stories: [],
  currentIndex: -1,
  bookmarks: [],
  preferences: { ...DEFAULTS },
  quote: "",
  openingNote: "",
  openingEnabled: true,
  release: null
};

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("Could not save. Check your browser storage.");
    return false;
  }
}

function showToast(message) {
  let toast = $("#notebookToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "notebookToast";
    toast.setAttribute("role", "status");
    toast.style.cssText = [
      "position:fixed",
      "bottom:24px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:9999",
      "max-width:calc(100% - 32px)",
      "padding:12px 18px",
      "border:1px solid rgba(150,170,200,.25)",
      "border-radius:10px",
      "background:#111a29",
      "color:#edf2fa",
      "font:14px/1.5 system-ui,sans-serif",
      "box-shadow:0 8px 30px rgba(0,0,0,.3)"
    ].join(";");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.hidden = false;

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function storyTitle(story, index) {
  return story.title || story.name || story.heading ||
    story.chapterTitle || `Chapter ${String(index + 1).padStart(2, "0")}`;
}

function storyBody(story) {
  const body = story.body ?? story.content ?? story.text ??
    story.message ?? story.paragraphs ?? "";

  if (Array.isArray(body)) return body.join("\n\n");
  return String(body);
}

function storyExcerpt(story, index) {
  const supplied = story.excerpt || story.description || story.preview;
  if (supplied) return String(supplied);

  const body = storyBody(story).replace(/\s+/g, " ").trim();
  return body.length > 110 ? `${body.slice(0, 107)}...` :
    body || `A little chapter, written for you.`;
}

function storyId(story, index) {
  return String(story.id ?? story.slug ?? story.number ?? index + 1);
}


const REMOTE_DATA = {
  stories: "https://sgtpyr.github.io/letters-for-you/stories/stories.json",
  release: "https://sgtpyr.github.io/letters-for-you/releases/releases.json"
};

async function loadRemoteOrCached(remoteUrl, cacheKey, bundledUrl) {
  try {
    const response = await fetch(remoteUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn("Online update unavailable; trying saved data:", error);
  }

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.warn("Saved data could not be read:", error);
  }

  const response = await fetch(bundledUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Bundled data returned HTTP ${response.status}`);
  }
  return response.json();
}

async function loadStories() {
  const grid = $("#chapterGrid");
  if (grid) grid.textContent = "Loading chapters...";

  try {
    const data = await loadRemoteOrCached(
      REMOTE_DATA.stories,
      "littleNotebook.remoteStories.v1",
      "stories/stories.json"
    );

    const list = Array.isArray(data)
      ? data
      : data.stories || data.chapters || data.items || [];

    if (!Array.isArray(list)) {
      throw new Error("The stories file has an unsupported structure.");
    }

    state.stories = list;
    renderChapters();
    renderRecent();
    updateChapterCounts();

    if (!list.length && grid) {
      grid.textContent = "Your chapters will appear here.";
    }
  } catch (error) {
    console.error("Could not load stories:", error);

    if (grid) {
      grid.textContent = "The chapters could not be loaded. Check your connection and try again.";
    }

    const recent = $("#recentGrid");
    if (recent) recent.textContent = "Your chapters could not be loaded.";
  }
}

function createChapterCard(story, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chapter-card";
  button.dataset.storyIndex = String(index);

  const number = document.createElement("span");
  number.className = "chapter-number";
  number.textContent = `CHAPTER ${String(index + 1).padStart(2, "0")}`;

  const title = document.createElement("span");
  title.className = "chapter-title";
  title.textContent = storyTitle(story, index);

  const excerpt = document.createElement("span");
  excerpt.className = "chapter-excerpt";
  excerpt.textContent = storyExcerpt(story, index);

  button.append(number, title, excerpt);

  button.addEventListener("click", () => openStory(index));

  return button;
}

function renderChapters() {
  const grid = $("#chapterGrid");
  if (!grid) return;

  const query = ($("#chapterSearch")?.value || "").trim().toLowerCase();
  grid.replaceChildren();

  let shown = 0;

  state.stories.forEach((story, index) => {
    const searchable = [
      storyTitle(story, index),
      storyExcerpt(story, index),
      storyBody(story)
    ].join(" ").toLowerCase();

    if (query && !searchable.includes(query)) return;

    grid.appendChild(createChapterCard(story, index));
    shown++;
  });

  const empty = $("#emptyState");
  if (empty) empty.hidden = shown !== 0;

  const total = $("#chapterTotal");
  if (total) total.textContent = `${shown} chapter${shown === 1 ? "" : "s"}`;
}

function renderRecent() {
  const grid = $("#recentGrid");
  if (!grid) return;

  grid.replaceChildren();

  state.stories.slice(0, 3).forEach((story, index) => {
    grid.appendChild(createChapterCard(story, index));
  });
}

function updateChapterCounts() {
  const count = state.stories.length;
  const navCount = $("#chapterCount");
  const heading = $("#headingCount");
  const total = $("#chapterTotal");

  if (navCount) navCount.textContent = String(count);
  if (heading) heading.textContent = String(count);
  if (total) total.textContent = `${count} chapters`;
}

function openView(view) {
  const valid = ["home", "chapters", "reader", "about", "settings"];

  if (!valid.includes(view)) view = "home";

  $$(".view").forEach(section => {
    section.classList.toggle("active", section.id === `${view}View`);
  });

  $$("[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
    if (button.dataset.view === view) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  const heading = $("#currentSection");
  if (heading) {
    heading.textContent = {
      home: "Home",
      chapters: "Chapters",
      reader: "Reading",
      about: "About",
      settings: "Settings"
    }[view];
  }

  $("#sidebar")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function openStory(index) {
  if (!Number.isInteger(index) ||
      index < 0 ||
      index >= state.stories.length) {
    return;
  }

  state.currentIndex = index;

  const story = state.stories[index];

  const title = $("#readerTitle");
  const body = $("#readerBody");
  const eyebrow = $("#readerEyebrow");
  const position = $("#readerPosition");
  const pageCount = $("#readerPageCount");

  if (title) title.textContent = storyTitle(story, index);
  if (body) {
    body.replaceChildren();

    storyBody(story).split(/\n\s*\n/).forEach(paragraph => {
      if (!paragraph.trim()) return;

      const p = document.createElement("p");
      p.textContent = paragraph.trim();
      body.appendChild(p);
    });

    if (!body.children.length) {
      body.textContent = "This chapter has no text yet.";
    }
  }

  if (eyebrow) {
    eyebrow.textContent =
      story.eyebrow || story.category || "A NOTE FOR YOU";
  }

  if (position) {
    position.textContent =
      `Chapter ${String(index + 1).padStart(2, "0")}`;
  }

  if (pageCount) {
    pageCount.textContent = `${index + 1} / ${state.stories.length}`;
  }

  const previous = $("#previousChapter");
  const next = $("#nextChapter");

  if (previous) previous.disabled = index === 0;
  if (next) next.disabled = index === state.stories.length - 1;

  updateBookmarkButton();
  openView("reader");
}

function moveStory(direction) {
  const nextIndex = state.currentIndex + direction;

  if (nextIndex >= 0 && nextIndex < state.stories.length) {
    openStory(nextIndex);
  }
}

/* Reading preferences */

function loadPreferences() {
  const saved = readJSON(STORE.preferences, {});
  state.preferences = { ...DEFAULTS, ...saved };

  const controls = {
    readerFont: state.preferences.font,
    readerLineSpacing: String(state.preferences.lineSpacing),
    readerWidth: state.preferences.width,
    themeSelect: state.preferences.theme,
    accentSelect: state.preferences.accent
  };

  Object.entries(controls).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  });

  applyPreferences();
}

function savePreferences() {
  writeJSON(STORE.preferences, state.preferences);
}

function applyPreferences() {
  const p = state.preferences;
  const body = $("#readerBody");
  const paper = $(".reader-paper");

  const fontFamilies = {
    serif: '"Cormorant Garamond", Georgia, serif',
    sans: '"DM Sans", Arial, sans-serif',
    handwritten: '"Caveat", cursive',
    georgia: 'Georgia, "Times New Roman", serif',
    elegant: '"Playfair Display", Georgia, serif',
    classic: '"Lora", Georgia, serif'
  };

  if (body) {
    body.style.fontFamily = fontFamilies[p.font] || fontFamilies.serif;
    body.style.fontSize = `${p.fontSize}px`;
    body.style.lineHeight = String(p.lineSpacing);
  }

  if (paper) {
    paper.dataset.theme = p.theme;
    paper.dataset.width = p.width;
    paper.style.maxWidth = {
      narrow: "560px",
      comfortable: "760px",
      wide: "960px"
    }[p.width] || "760px";
  }

  document.documentElement.dataset.accent = p.accent;

  const sizeLabel = $("#fontSizeValue");
  if (sizeLabel) sizeLabel.textContent = `${p.fontSize}px`;

  const smaller = $("#textSmaller");
  const larger = $("#textLarger");

  if (smaller) smaller.disabled = p.fontSize <= 14;
  if (larger) larger.disabled = p.fontSize >= 28;
}

function handlePreferenceChange(event) {
  const id = event.target.id;
  const value = event.target.value;

  const mapping = {
    readerFont: "font",
    readerLineSpacing: "lineSpacing",
    readerWidth: "width",
    themeSelect: "theme",
    accentSelect: "accent"
  };

  const key = mapping[id];
  if (!key) return;

  state.preferences[key] =
    key === "lineSpacing" ? Number(value) : value;

  applyPreferences();
  savePreferences();
}

function changeFontSize(amount) {
  state.preferences.fontSize = Math.min(
    28,
    Math.max(14, Number(state.preferences.fontSize) + amount)
  );

  applyPreferences();
  savePreferences();
}

/* Bookmarks */

function loadBookmarks() {
  const saved = readJSON(STORE.bookmarks, []);
  state.bookmarks = Array.isArray(saved) ? saved : [];
  renderBookmarks();
}

function isBookmarked(index) {
  return state.bookmarks.includes(storyId(state.stories[index], index));
}

function toggleBookmark() {
  const index = state.currentIndex;
  if (index < 0 || !state.stories[index]) return;

  const id = storyId(state.stories[index], index);

  if (state.bookmarks.includes(id)) {
    state.bookmarks = state.bookmarks.filter(item => item !== id);
    showToast("Bookmark removed.");
  } else {
    state.bookmarks.push(id);
    showToast("Chapter bookmarked.");
  }

  writeJSON(STORE.bookmarks, state.bookmarks);
  renderBookmarks();
  updateBookmarkButton();
}

function updateBookmarkButton() {
  const button = $("#toggleBookmark");
  if (!button || state.currentIndex < 0) return;

  const saved = isBookmarked(state.currentIndex);
  button.textContent = saved ? "Remove bookmark" : "Bookmark chapter";
  button.setAttribute("aria-pressed", String(saved));
}

function renderBookmarks() {
  const list = $("#bookmarkList");
  const empty = $("#bookmarkEmpty");

  if (!list) return;

  list.replaceChildren();

  let count = 0;

  state.bookmarks.forEach(id => {
    const index = state.stories.findIndex((story, i) =>
      storyId(story, i) === id
    );

    if (index < 0) return;

    count++;

    const item = document.createElement("div");
    item.className = "bookmark-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "bookmark-open";
    button.textContent = storyTitle(state.stories[index], index);
    button.addEventListener("click", () => openStory(index));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "setting-button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      state.bookmarks = state.bookmarks.filter(value => value !== id);
      writeJSON(STORE.bookmarks, state.bookmarks);
      renderBookmarks();
      updateBookmarkButton();
    });

    item.append(button, remove);
    list.appendChild(item);
  });

  if (empty) empty.hidden = count > 0;

  if (empty && count === 0) {
    empty.textContent = "No bookmarked chapters yet.";
  }
}

/* Favorite quote */

function loadQuote() {
  state.quote = readJSON(STORE.quote, "");
  const field = $("#favoriteQuote");
  const saved = $("#savedQuote");

  if (field) field.value = state.quote;
  if (saved) saved.textContent = state.quote || "No saved quote yet.";
}

function saveQuote() {
  const field = $("#favoriteQuote");
  if (!field) return;

  state.quote = field.value.trim();

  if (writeJSON(STORE.quote, state.quote)) {
    const saved = $("#savedQuote");
    if (saved) saved.textContent = state.quote || "No saved quote yet.";
    showToast("Favorite quote saved.");
  }
}

/* Opening note */

function loadOpeningNote() {
  state.openingNote = readJSON(STORE.openingNote, "");
  state.openingEnabled =
    readJSON(STORE.openingEnabled, true) !== false;

  const field = $("#openingNote");
  const checkbox = $("#showOpeningNote");

  if (field) field.value = state.openingNote;
  if (checkbox) checkbox.checked = state.openingEnabled;
}

function saveOpeningNote() {
  state.openingNote = $("#openingNote")?.value.trim() || "";
  state.openingEnabled = $("#showOpeningNote")?.checked ?? true;

  writeJSON(STORE.openingNote, state.openingNote);
  writeJSON(STORE.openingEnabled, state.openingEnabled);
  showToast("Opening note saved.");
}

function showOpeningNote() {
  if (!state.openingEnabled || !state.openingNote) return;

  const today = new Date().toISOString().slice(0, 10);

  try {
    if (localStorage.getItem(STORE.openingDate) === today) return;
    localStorage.setItem(STORE.openingDate, today);
  } catch {
    // Continue without daily display tracking.
  }

  showToast(state.openingNote);
}


/* Release announcements */

async function loadRelease() {
  try {
    const data = await loadRemoteOrCached(
      REMOTE_DATA.release,
      "littleNotebook.remoteRelease.v1",
      "releases/releases.json"
    );

    const release = data;

    if (!release || !release.id || !Array.isArray(release.chapterNumbers)) {
      return;
    }

    state.release = release;

    const indexes = release.chapterNumbers
      .map(number => Number(number) - 1)
      .filter(index =>
        Number.isInteger(index) &&
        index >= 0 &&
        index < state.stories.length
      );

    state.release.storyIndexes = [...new Set(indexes)].sort((a, b) => a - b);

    const notice = $("#releaseNotice");

    if (!notice || !state.release.storyIndexes.length) {
      if (notice) notice.hidden = true;
      return;
    }

    const seen = localStorage.getItem(STORE.releaseSeen);

    if (seen === String(release.id)) {
      notice.hidden = true;
      return;
    }

    const title = $("#releaseTitle");
    const description = $("#releaseDescription");
    const count = state.release.storyIndexes.length;

    if (title) {
      title.textContent = release.title || "A little surprise for you.";
    }

    if (description) {
      description.textContent = release.message ||
        `${count} new ${count === 1 ? "chapter is" : "chapters are"} waiting for you.`;
    }

    notice.hidden = false;
  } catch (error) {
    console.warn("Release announcement unavailable:", error);
  }
}

function dismissRelease() {
  if (state.release?.id) {
    localStorage.setItem(STORE.releaseSeen, String(state.release.id));
  }

  const notice = $("#releaseNotice");
  if (notice) notice.hidden = true;
}

function readReleasedChapters() {
  const indexes = state.release?.storyIndexes || [];

  if (!indexes.length) {
    showToast("There are no released chapters to open.");
    return;
  }

  localStorage.setItem(STORE.releaseSeen, String(state.release.id));

  const notice = $("#releaseNotice");
  if (notice) notice.hidden = true;

  openStory(indexes[0]);
}

function replayRelease() {
  localStorage.removeItem(STORE.releaseSeen);
  loadRelease();
  showToast("Announcement reset.");
}


/* Events */

function bindEvents() {
  /*
   * One delegated handler for navigation.
   * Do not register a second handler for the same navigation buttons.
   */
  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-view]");

    if (nav) {
      event.preventDefault();
      openView(nav.dataset.view);
      return;
    }

    const open = event.target.closest("[data-open-view]");

    if (open) {
      event.preventDefault();
      openView(open.dataset.openView);
      return;
    }

    const releaseButton = event.target.closest("#dismissReleaseBtn");

    if (releaseButton) {
      dismissRelease();
      return;
    }

    const readReleaseButton = event.target.closest("#readReleaseBtn");

    if (readReleaseButton) {
      readReleasedChapters();
      return;
    }
  });


  $("#chapterSearch")?.addEventListener("input", renderChapters);
  $("#previousChapter")?.addEventListener("click", () => moveStory(-1));
  $("#nextChapter")?.addEventListener("click", () => moveStory(1));
  $("#backToChapters")?.addEventListener("click", () => openView("chapters"));
  $("#toggleBookmark")?.addEventListener("click", toggleBookmark);
  $("#saveQuote")?.addEventListener("click", saveQuote);
  $("#saveOpeningNote")?.addEventListener("click", saveOpeningNote);
  $("#resetReleaseSeen")?.addEventListener("click", replayRelease);
  $("#dismissRelease")?.addEventListener("click", dismissRelease);

  $("#textSmaller")?.addEventListener("click", () => changeFontSize(-1));
  $("#textLarger")?.addEventListener("click", () => changeFontSize(1));

  $("#menuBtn")?.addEventListener("click", () => {
    $("#sidebar")?.classList.toggle("open");
  });

  [
    "readerFont",
    "readerLineSpacing",
    "readerWidth",
    "themeSelect",
    "accentSelect"
  ].forEach(id => {
    document.getElementById(id)?.addEventListener(
      "change",
      handlePreferenceChange
    );
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      $("#sidebar")?.classList.remove("open");
    }
  });
}

async function init() {
  bindEvents();
  loadPreferences();
  loadBookmarks();
  loadQuote();
  loadOpeningNote();
  openView("home");

  await loadStories();
  renderBookmarks();
  await loadRelease();
  showOpeningNote();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
