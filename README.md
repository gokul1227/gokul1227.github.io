# Gokulakannan — Cloud & DevOps Portfolio

A responsive Creative Editorial portfolio for [gokul1227.github.io](https://gokul1227.github.io/). Plain HTML, CSS, and JavaScript; no build step, backend, API keys, or package installation.

## What is included

- Warm cream, charcoal, and orange design with editorial typography and scroll reveals.
- Hero, About, Expertise, Projects, Results, Experience, Education, and Contact.
- Resume-backed HarvestEye, Twellr.ai, and Supplier Portal case studies with project filters.
- Real Three.js robot with satin ceramic panels, painted metal, a recessed glass faceplate, articulated fingers, mechanical joints, and soft contact shadows. Includes drag/touch and keyboard rotation, 360° spin, pause, and reset controls.
- An animated SVG robot fallback when WebGL is unavailable, including this environment's preview browser.
- Reduced-motion support, keyboard navigation, accessible modal dialogs, and mobile navigation.
- Latest supplied resume PDF, downloadable from the header, experience section, and contact section.

## Preview locally

Serve the repository over HTTP so ES module imports work:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Opening `index.html` directly as `file://` will not load the 3D module correctly.

## Deploy on GitHub Pages

The files live at the repository root to preserve the existing static GitHub Pages setup. Merge the redesign branch into the repository's publishing branch. For branch-based publishing, GitHub Pages should use **main / (root)**. There is no application build command.

To apply the downloadable source package manually, extract it over the repository root, commit the changed and added files, and push to the publishing branch. Include `assets/` and `character.js`; the 3D dependencies are vendored locally.

## Edit content

- `index.html`: page text, navigation, contact details, project cards, and metadata.
- `script.js`: detailed case studies, project filters, dialog behavior, mobile menu, and copy email action.
- `style.css`: typography, responsive layouts, transitions, and character presentation.
- `character.js`: Three.js scene, robot geometry, materials, lighting, and controls.
- `assets/gokul-bot.svg`: illustrated fallback for browsers without WebGL.
- `Gokulakannan_Cloud_DevOps_Engineer.pdf`: replace this file to update all resume download links.

The current content uses the resume supplied on 22 October 2026. Cost and release improvements are approximate. Twellr.ai's Azure D2C DNS cutover remains described as pending, matching the supplied resume. Revisit dated status and experience text as your work evolves.

## Dependencies and compatibility

Three.js **0.170.0**, `RoundedBoxGeometry`, and `RoomEnvironment` are included under `assets/vendor/`. Their MIT license is retained in `assets/vendor/THREE-LICENSE.txt`. The interactive 3D scene needs WebGL 2. Browsers without it receive the matching robot illustration and the rest of the site remains usable. Fonts load from Google Fonts with local sans-serif and serif fallbacks.

## Verification

JavaScript syntax and local asset/anchor checks passed. Desktop and narrow-screen layouts, mobile navigation, project filtering, and case-study dialogs were checked in the preview browser. WebGL is disabled in that browser, so live 3D rendering could not be visually verified there; the fallback was verified instead. The robot geometry was checked for finite coordinates in the preceding implementation.

The refined robot uses separate ceramic, painted-metal, rubber, and glass materials; recessed rounded screen panels; mechanical assembly details; restrained idle motion; and soft contact shadows. Geometry and spin, pause, reset, keyboard, drag, and context-restoration paths passed a CPU runtime check. GPU rendering remains unverified in the WebGL-disabled preview environment.

Toolkit brand icons are local SVG assets from [Devicon v2.17.0](https://github.com/devicons/devicon/tree/v2.17.0), covering AWS, Azure, Docker, Terraform, Python, GitHub Actions, Kubernetes, and Jenkins. Devicon’s MIT license is included in `assets/icons/DEVICON-LICENSE.txt`; brand marks belong to their respective owners.

Gokul-bot now has a visible neck with a swivel pivot. Mouse and pen movement anywhere in the viewport guides its head and eyes relative to the robot’s screen position. Eyes lead the smoothly damped head turn; leaving the page returns the gaze to neutral. Tracking yields to drag/spin controls, pauses with the animation, and respects reduced-motion preferences.
