(() => {
  "use strict";

  // Read-only notebook: there are no editing or saving controls.
  const STORAGE_KEY = "littleNotebook.v1";

  // Stories are loaded from stories/stories.json.
  const data = {
    notes: [],
    from: "Your bestie"
  };

  let current = -1; // -1 = cover, -2 = contents, 0+ = note
  let turning = false;
  let turnTimer = null;

  const page = document.getElementById("page");
  const pageContent = document.getElementById("pageContent");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progress = document.getElementById("progress");
  const contentsBtn = document.getElementById("contentsBtn");

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderCover() {
    pageContent.innerHTML = `
      <div class="page-top">
        <span class="page-label">A little something for you</span>
        <span class="page-number">♡</span>
      </div>

      <div class="cover-content">
        <div class="cover-mark">for you</div>
        <h2>A Little<br>Notebook</h2>
        <p class="cover-subtitle">
          Little reminders, random thoughts, and words
          I wanted you to have somewhere.
        </p>
        <div class="cover-from">from, ${escapeHTML(data.from)}</div>
      </div>

      <div class="page-bottom">
        <span>Open whenever you need it.</span>
        <span>♡</span>
      </div>
    `;

    progress.textContent = "Cover";
    prevBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = "Open notebook →";
  }

  function renderNote() {
    const note = data.notes[current];

    if (!note) {
      current = -1;
      renderCover();
      return;
    }

    pageContent.innerHTML = `
      <div class="page-top">
        <span class="page-label">A note for you</span>
        <span class="page-number">${current + 1}</span>
      </div>

      <h2 class="note-title">${escapeHTML(note.title)}</h2>

      <div class="note-body"
           id="noteBody"
           role="document"
           aria-label="${escapeHTML(note.title || "Notebook note")}">${escapeHTML(note.body)}</div>

      <div class="page-bottom">
        <span>Written with care.</span>
        <span>Page ${current + 1}</span>
      </div>
    `;

    progress.textContent = `Page ${current + 1} of ${data.notes.length}`;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    nextBtn.textContent = current === data.notes.length - 1
      ? "Back to cover ↶"
      : "Next page →";
  }

  function renderContents() {
    pageContent.innerHTML = `
      <div class="page-top">
        <span class="page-label">Find a page</span>
        <span class="page-number">Index</span>
      </div>

      <h2 style="font-family:Caveat,cursive;font-size:34px;margin:0 0 16px">
        Little chapters
      </h2>

      <div id="contentsList" style="display:grid;gap:10px"></div>

      <div class="page-bottom" style="margin-top:auto">
        <span>Every page has its place.</span>
        <span>♡</span>
      </div>
    `;

    const list = document.getElementById("contentsList");

    data.notes.forEach((note, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.style.textAlign = "left";
      button.textContent =
        `${String(index + 1).padStart(2, "0")}  ·  ${note.title || "Untitled note"}`;

      button.addEventListener("click", () => {
        if (turning) return;
        current = index;
        render();
      });

      list.appendChild(button);
    });

    progress.textContent = "Contents";
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    nextBtn.textContent = "Back to cover ↶";
  }

  function render() {
    if (current === -1) {
      renderCover();
    } else if (current === -2) {
      renderContents();
    } else {
      renderNote();
    }
  }

  function navigate(direction) {
    if (turning) return;

    if (current === -2) {
      current = -1;
      render();
      return;
    }

    turning = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    contentsBtn.disabled = true;

    page.classList.remove("turn-next", "turn-prev");
    void page.offsetWidth;
    page.classList.add(direction > 0 ? "turn-next" : "turn-prev");

    turnTimer = window.setTimeout(() => {
      if (direction > 0) {
        if (current === -1) {
          current = data.notes.length ? 0 : -1;
        } else if (current < data.notes.length - 1) {
          current++;
        } else {
          current = -1;
        }
      } else {
        if (current === -1) {
          current = data.notes.length ? data.notes.length - 1 : -1;
        } else if (current > 0) {
          current--;
        } else {
          current = -1;
        }
      }

      page.classList.remove("turn-next", "turn-prev");
      render();

      turning = false;
      contentsBtn.disabled = false;
      turnTimer = null;
    }, 480);
  }

  prevBtn.addEventListener("click", () => navigate(-1));
  nextBtn.addEventListener("click", () => navigate(1));

  contentsBtn.addEventListener("click", () => {
    if (turning) return;
    current = -2;
    render();
  });

  // Allow left/right arrow navigation without enabling editing.
  document.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    }
  });

  async function loadStories() {
    try {
      const response = await fetch("stories/stories.json", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const stories = await response.json();

      if (!Array.isArray(stories) ||
          !stories.every(note =>
            note &&
            typeof note.title === "string" &&
            typeof note.body === "string"
          )) {
        throw new Error("The story data has an invalid format.");
      }

      data.notes = stories;
      render();
    } catch (error) {
      console.error("Could not load notebook stories:", error);
      pageContent.innerHTML = `
        <div class="page-top">
          <span class="page-label">Notebook unavailable</span>
        </div>
        <h2 class="note-title">The stories couldn't load.</h2>
        <p class="note-body">
          Open this notebook through a local web server or try again later.
        </p>
      `;
      progress.textContent = "Loading error";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      contentsBtn.disabled = true;
    }
  }

  loadStories();
})();