import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "stories" / "stories.json"


def main():
    if not SOURCE.is_file():
        raise ValueError("Missing stories/stories.json")

    notes = json.loads(SOURCE.read_text(encoding="utf-8"))

    if not isinstance(notes, list) or not notes:
        raise ValueError("Stories must be a non-empty JSON list")

    titles = set()

    for number, note in enumerate(notes, start=1):
        if not isinstance(note, dict):
            raise ValueError(f"Story {number} must be an object")

        title = note.get("title")
        body = note.get("body")

        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"Story {number} has a missing title")

        if not isinstance(body, str) or not body.strip():
            raise ValueError(f"Story {number} has a missing body")

        if title in titles:
            raise ValueError(f"Duplicate story title: {title}")

        titles.add(title)

    print("Notebook build validation passed.")
    print(f"Stories validated: {len(notes)}")
    print(f"Source: {SOURCE.relative_to(ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise SystemExit(f"Build failed: {error}")
