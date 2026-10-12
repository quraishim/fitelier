# Fitelier

Minimal editorial website with an opening wordmark reveal, the supplied logo treated in warm antique gold (#A27D4B), subtle olive accents, a prominent fabric library, a detailed suit builder and built-in consultation time requests.

## Consultation requests

Visitors choose a preferred date (or a flexible date), an exact preferred time in 30-minute increments, name and email. An optional advisor name and note, saved fabric studies and an optional suit-design snapshot travel with the request. Success appears only after the server stores it. Repeating the same attempt does not create duplicates. A preferred time is never represented as available or confirmed.

Requests are stored in the site's D1 database, binding `DB`, table `consultation_requests`. The owner can review these through the authenticated Sites Settings database viewer or the Sites database tools. There is no public listing endpoint. Requests have `pending` status; confirm arrangements directly with the visitor using your usual process. Automatic emails, calendar availability and automatic booking confirmation are not connected.

The site retains its existing private audience. Change access only when ready to share it with customers.

## Fabric and tailoring

The eight fabric images are generated inspiration studies, not approved stock. Visitors can filter by colour/pattern, inspect close-ups, save a device-local shortlist and choose one direction for a suit. Actual cloth, mills, composition, availability and construction options still require atelier approval. No supplier claims, prices, location or hours have been invented.

The suit builder preserves the proposed option catalog, compatibility checks, two-/three-piece journeys, 30-day anonymous drafts, review, downloadable HTML brief and JSON export. Its editorial photograph does not update with selections. The client portal remains a clearly marked future service.

## Implementation

The main frontend remains HTML, CSS and JavaScript in `public/`, with a React island for the hero. `#/motion` compares working GSAP, React Spring and Motion variations. `src/worker.js` handles consultation submission and serves assets. `npm run build` creates `dist/client` plus the Cloudflare Worker entrypoint in `dist/server/index.js`. The hosting manifest declares the logical D1 binding. Drizzle schema and generated migrations live in `db/` and `drizzle/`; production migrations are handled by Sites. No schema changes run on production requests.

`npm run dev` serves the site on localhost:8765 with an ignored local SQLite database. Local preview records never enter the hosted database. `npm test` checks storage, validation, idempotency and failure handling. `npm run db:generate` generates future migrations; preserve already deployed migration history.

Fonts are self-hosted Cormorant Garamond and Jost under their included SIL Open Font Licenses. Existing concept images are retained. No advertising or analytics are included.

## Remaining business setup

Provide approved fabric records, production vector logo assets, verified business contact details, and a client portal when those become available. Review requests regularly in Sites Settings and arrange appointments directly. This site does not process orders or payments.

## September 18 changes

One fabric added per colour (eight total); knitwear, knitted polos and cardigans added as consultation-led categories. The exact time dropdown is a preference, not live availability. Preferred advisor is a free-form optional name; no advisor roster, personal calendar or automatic allocation is invented. New additive migration 0002 preserves existing requests and adds preferred_time and preferred_advisor. Full local request saving and mobile UI were checked; live customer records were not accessed.
