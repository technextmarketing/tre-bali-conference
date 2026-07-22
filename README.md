# TRE Worldwide Conference — Bali 2027

Event website for the first worldwide TRE® conference, Bali, 12–15 November 2027.
Built by TechNext from the approved proposal deck design.

## Pages (3-page structure)
- `index.html` — **Ticket**: landing + live countdown + ticket waves + inline registration form (`#tickets`, `#register`)
- `speakers.html` — **Speaker**: speaker profiles, sessions, social links
- `info.html` — **Info**: dates, venue, programme, travel, visa & invitation, hotels, gallery, FAQ (`#programme`, `#visa`, `#hotels`, `#gallery`, `#faq`)
- `privacy.html` / `terms.html` — legal (draft), linked from the footer only

Header nav is Ticket · Speaker · Info + a "Get your ticket" button (→ `index.html#register`).

## Notes
- Design system in `assets/style.css`; behaviour (countdown, nav, lightbox, tier select, form) in `assets/app.js`.
- Live countdown targets 2027-11-12 09:00 Bali time (WITA, UTC+8).
- Home page uses all-white sections with hairline dividers (expo-style arrangement, tickets near the top).
- Pricing shown is **indicative**; final tiers/prices confirmed at launch.
- The registration form is a front-end demo. Live version connects to Stripe checkout + Odoo CRM.
- Legal pages are drafts for TRE Indonesia to finalise.

Hosted on GitHub Pages. Site by [TechNext](https://www.technext.asia).
