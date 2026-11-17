# Can Ozan Gürleyen - Portfolio

A static programming portfolio for GitHub Pages. It covers game systems, simulation, applications and hardware prototypes. No build step or third-party runtime dependencies are required.

## Local preview

From the repository directory:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. The site also uses relative asset paths so it works under the GitHub Pages `/ozan-tr/` project path.

## Editing projects

Project content lives directly in `index.html`. Each `article.project-card` has a stable `id` for links and a `data-category` value: `games`, `software`, `hardware`, or comma-separated values. Keep IDs stable when updating project names. The count is updated automatically by JavaScript.

Use a short overview for the problem and contribution, then a native `details` block for implementation specifics. Give prototypes and unfinished work a clear status. Only link public sources or demos that are actually available; never use a local filesystem path as a website link.

The showcase currently includes:

- First-person horror game
- Soft-body physics simulation
- Pharmacy appointment app and chatbot
- Between the Pipes
- SB Rogue-Like
- Minecraft: Item Frame Finder
- Arduino slot-machine prototype
- Convex hull visualiser
- Falling-sand sandbox

The NewMind appointment website includes a React frontend and a FastAPI backend, both developed by Can Ozan. Randevu desktop is a stripped-down version of that website and is not presented as a separate showcase project. The embedded chatbot retrieves medication information; chatbot appointment booking was not completed. The horror project describes the programming contribution within a five-person team.

Dates are project years, based on available repository history and internship/coursework context; an initial imported commit is not proof of the exact development start date.

## Files and behaviour

- `src/style/main.css`: layout, typography and responsive components.
- `src/style/themes.css`: automatic light/dark colour palettes.
- `src/js/projects.js`: accessible category filters and project deep links.
- `src/js/site.js`: footer year.
- `src/img/`: genuine project screenshots and a labelled simulation design sketch.

Cards use native expandable details and remain readable without JavaScript. On wide screens, each visible project sits below the shortest column and the layout updates when a card changes size. At 760px and below, projects stack in document order. Respect reduced-motion preferences and preserve keyboard focus styling when changing the CSS.

## Contact

- [LinkedIn](https://www.linkedin.com/in/can-ozan-g%C3%BCrleyen-b96044347/)
- [Email](mailto:ozang@live.com)
- [GitHub](https://github.com/ozan-tr)
