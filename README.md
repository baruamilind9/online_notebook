# Online Notebook (Static)

This is a small, dependency-free static notebook web app that stores notes in the browser's localStorage. It supports creating, editing, deleting, searching, exporting, and importing notes as JSON.

Files added:
- `index.html` — main single-page app
- `css/styles.css` — styles
- `js/app.js` — application logic

How to run:

1. Open `index.html` in a modern browser (double-click the file) — this will work without a server.
2. Or start a simple local HTTP server from the project root (recommended) using Python:

```powershell
# from the project root (Windows PowerShell)
python -m http.server 8000; Start-Process "http://localhost:8000"
```

Notes are stored locally in `localStorage` under the key `online_notebook_notes_v1`.

Next steps / improvements:
- Add Markdown preview
- Add sync/export to remote storage or GitHub Gist
- Add tagging and filtering

License: MIT
