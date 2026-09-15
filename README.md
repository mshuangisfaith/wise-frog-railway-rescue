# Wise Frog Railway Rescue

An HTML5 Primary 3 English game extending the established Tape Trail Word Quest classroom patterns. Original frog and princess avatars, a crafted garden railway, and two routes:

- Railway Rescue: 12 tap-to-order sentence questions using if, while and as.
- Clue Carriages: 8 inference-and-evidence questions aligned to Prince Zak and the Wise Frog.

## Play

Open index.html on a computer, or publish this folder through GitHub Pages and open its HTTPS link in Safari on pupils' iPads. All asset paths are relative. No installation, account or build step is needed. The original PDFs are not required to run the game.

Choose a character and route. Tap sentence pieces in order or select one inference and one evidence option. Tap Check, read feedback and continue. Three independent correct answers earn an extra life. At zero lives, supported practice continues. Music starts only when enabled and uses the existing Tape Trail track.

Save & take a break stores the latest journey in that browser. On reopening, choose Continue saved journey. Only the latest journey is retained; starting another route replaces the previous saved record. Private browsing or restricted storage may prevent saving. The app reports storage failure.

## Assessment

Independent means first-attempt correct before a hint or model answer. First responses are retained when pupils retry. The reading route also reports inference and evidence counts separately. Arcade lives and elapsed time do not determine the English assessment.

At the finish, pupils can show the teacher their skill breakdown and item-level support record, download a CSV of every attempt, or print the results. CSV includes original responses, correctness, independent-attempt flag and support usage. Results are local to the device; no teacher dashboard or automatic submission is included. Use your own classroom process to match a downloaded result to a pupil.

## Reusable files

- questions.js: the two question packs, explanations and reader references.
- engine.js: assessment rules and first-attempt tracking.
- app.js: controls, SVG characters/scenery, progress, audio and local save.
- style.css: responsive layouts, craft styling, print and reduced-motion rules.
- trail-music.mp3: track reused from the existing Tape Trail project.

Run `node tests/engine.cjs` for the assessment regression checks. This is a plain static project and does not need npm dependencies.

## Teaching basis

Unit guidelines pp. 18–20: conditions and time/sequence connectors, and inference from evidence. Reader pp. 1–9: story and companion Frog Prince activities. Railway sentences and visual artwork are original; reading clues are short paraphrases. The princess is a playable adventure avatar inspired by the companion story, not an additional character inserted into Zak's main story. For inference, also ask pupils to justify an answer orally.

## Verification — 15 September 2026

- 98 pure-logic assertions passed, covering valid clause orders, wrong conditions, immutable first attempts, hint exclusion, streak rewards, zero lives and separate inference/evidence marks.
- Completed both full routes in the browser, including a wrong answer/retry, hints, model answer, save/reload/resume, and finish summaries.
- Inspected 1024×768 and 768×1024 iPad-sized layouts and 390×844 narrow layout; no horizontal overflow at tested widths. Physical iPad testing remains a classroom check.
- The in-app preview showed the export-request message without exposing a download event; verify CSV saving in Safari before relying on a class collection workflow. Screen review and printing are alternative collection methods.

## Teacher review update — 15 September 2026

At the finish, open **See all answers and support used**, then open any stop. The review shows the original sentence or inference and evidence choices, a correct model, the explanation, and a suggested discussion prompt. It distinguishes an independently correct first response from success after a hint. A later retry or model answer never overwrites the original response.

Verification: 98 existing assessment assertions and 10 new teacher-review assertions passed. Both complete routes were checked in the browser with a wrong-evidence retry, a model-answer stop and a hint-assisted answer. Expanded review cards fit 768-pixel and 390-pixel widths without horizontal overflow.
