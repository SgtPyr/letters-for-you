import hashlib
import json
import zipfile
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKUP_DIR = ROOT / "backups"

FILES = [
    "index.html",
    "css/style.css",
    "js/app.js",
    "stories/stories.json",
    "tools/build_notebook.py",
]

def main():
    missing = [name for name in FILES if not (ROOT / name).is_file()]
    if missing:
        raise SystemExit("Backup failed. Missing files: " + ", ".join(missing))

    stories_path = ROOT / "stories/stories.json"
    stories = json.loads(stories_path.read_text(encoding="utf-8"))

    if not isinstance(stories, list):
        raise SystemExit("Backup failed. stories.json must contain a list.")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archive = BACKUP_DIR / f"notebook_{stamp}.zip"

    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for name in FILES:
            zip_file.write(ROOT / name, arcname=name)

    digest = hashlib.sha256(archive.read_bytes()).hexdigest()

    print("Backup completed.")
    print(f"Stories checked: {len(stories)}")
    print(f"Archive: {archive.relative_to(ROOT)}")
    print(f"SHA-256: {digest}")

if __name__ == "__main__":
    main()
