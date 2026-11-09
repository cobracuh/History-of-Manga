# The Evolution of Manga — repaired version

This folder is ready to publish as a static GitHub Pages site.

## Main files

- `index.html` contains the page content and accessible structure.
- `dashboard.html` contains the interactive sales dashboard.
- `assets/css/untitled.css` contains the responsive design and visual fixes.
- `assets/css/dashboard.css` contains the dashboard-specific responsive layout.
- `assets/js/site.js` contains the volume chart data, chart rendering, responsive redraw behavior, and ranking filters.
- `assets/js/dashboard.js` powers the dashboard filters, charts, search, sorting, and CSV download.
- `assets/data/manga-sales.json` is the reusable 2010–2020 ranking dataset.

## Notes

- The project is explicitly framed as a 2010–2020 data story.
- The rankings open to the 2020 “By series” view and remain filterable.
- The volume visualization now draws only the five records belonging to the selected year.
- The dashboard makes the shorter 2020 coverage explicit and calculates shares only from the displayed records.
- Keep the Oricon source link and replace or credit any artwork whose usage rights are not already documented.
