---
layout: ../../layouts/LegalLayout.astro
title: Privacy Policy
---

# NeatNest Privacy Policy

**Version:** v1 (effective 2026-04-18)
**Contact:** ben@benlewis.fyi

NeatNest is operated by Ben Lewis ("we"). This policy explains what data the NeatNest app ("NeatNest") collects, how it is used, and the choices you have.

## 1. Data we collect

- **Account data:** your email address (used for sign-in and account recovery).
- **Photos:** images you capture or upload while using the app.
- **Item metadata:** the name, category, estimated value, tags, color, notes, and location you attach to items you save.
- **Household membership:** the household(s) you create or join, and your role in them.
- **Crash diagnostics:** when the app crashes or errors, a stack trace, device model, OS version, and a per-household hashed identifier are sent to our crash telemetry provider (Sentry). User IDs, email addresses, IP addresses, and usernames are stripped before the event is sent.
- **Diagnostic context in feedback:** when you submit feedback via **Settings → Feedback**, your device model, OS version, and app version are included in the message body so we can reproduce issues.

We do not collect advertising identifiers, precise geolocation, contacts, microphone audio, biometric data, health data, or browsing history. NeatNest does not track you across other apps or websites.

## 2. How we use it

- **Item extraction (AI):** when you take a photo, the image is sent to Google's Gemini API so the model can suggest a name, category, and estimated value. NeatNest uses Google's **paid Gemini tier**, which operates under a **zero-retention** data policy — Google does not retain your photos after processing and does not use them to train their models. See Google's Generative AI terms for current details.
- **Storage:** photos and item metadata are stored in Supabase (US-hosted). Photos currently live in a **public-read storage bucket with URL-based access control** — in plain language, anyone who knows a photo's URL can view that photo. URLs are not discoverable without authentication, but the bucket does not cryptographically prevent access if a URL leaks. We plan to tighten this to signed, expiring URLs before App Store public release; for the duration of alpha, treat photos you upload as URL-sharable.
- **Household sharing:** joining a household exposes your items and photos to other members of that household. Leaving a household stops new exposures but does not un-share anything other members have already seen.
- **Account recovery + security:** email addresses are used for authentication, password reset flows, and to contact you about your account.

## 3. How we share it

- **Google Gemini** (item extraction — paid zero-retention tier; no training, no retention beyond processing)
- **Supabase** (US-hosted database + storage; RLS enforces household isolation)
- **Sentry** (crash telemetry; app automatically strips user IDs, emails, IP addresses, and usernames from events before sending; a per-household hashed identifier is retained for triage grouping)

We do not sell or rent your data. We do not share data with advertising networks.

## 4. Account deletion

Account deletion is available in-app from **Settings → Danger zone → Delete account**. Once confirmed, we immediately remove:

- Your authentication record
- Item and container rows you created **in households where you were the sole remaining member**
- Photos from those households
- Household memberships you held

In rare cases, a deletion can partially fail — for example, a transient storage cleanup error might leave one or more photo objects behind. When this happens, the app surfaces a clear error with a support contact link (ben@benlewis.fyi). The underlying database records are always removed first; any residue is storage-only.

**What is NOT deleted:** items and photos you created while sharing a household with other members who still have that household. Those items stay with the surviving household so the remaining members don't lose shared data. Authorship metadata on those rows is cleared — surviving household members will see the items but will no longer see your name as the creator. If you want a photo specifically removed from a surviving household, contact us.

## 5. California (CCPA) rights

California residents have the right to:

- Know what personal information we hold about them
- Request correction of inaccurate personal information we hold about them
- Request deletion of their personal information (see Section 4)
- Opt out of the sale or sharing of personal information
- Limit the use or disclosure of sensitive personal information (SPI)

We **do not sell or share** personal information within the meaning of CCPA. NeatNest does not use photos or other collected data beyond the purposes described in Section 2, so no SPI-limiting action is currently required to honor the right above; you may still exercise it as a matter of record. To exercise any right not covered by in-app deletion, contact ben@benlewis.fyi.

Data categories we collect under CCPA taxonomy: **identifiers** (email), **commercial information** (item inventory you track), **visual information** (photos), **internet or network activity** (crash telemetry).

## 6. EU / UK (GDPR) rights

For users in the EU / UK:

- **Controller:** Ben Lewis, operator of NeatNest (contact below).
- **Legal basis:** contract (account + core app functionality) and consent (photo capture and AI processing).
- **International transfer:** Supabase and Google process data in the United States. We rely on **Standard Contractual Clauses (SCCs)** for these transfers.
- **Rights:** access, rectification, erasure (see Section 4), portability, objection, withdrawal of consent, and lodging a complaint with your supervisory authority.
- **No solely-automated decisions:** AI-generated suggestions (item name, category, value) are presented for your review and require your confirmation before being saved. No decisions about your data are made solely by automated means within the meaning of GDPR Article 22.
- **Response time:** we aim to respond to data subject requests within 30 days, as required by GDPR Article 12(3).
- **Data Protection Officer:** NeatNest does not currently appoint a DPO. Contact the operator at the address below.

## 7. Children

NeatNest is rated **12+** in the App Store and is not directed to children under 13. We do not knowingly collect personal information from children under 13 (or 16 in the EU, where applicable). The 12+ App Store rating reflects content suitability; the minimum age to create a NeatNest account is 13 (see Terms of Service §1) to comply with COPPA. If you believe a child has provided us personal information, contact ben@benlewis.fyi and we will delete it.

## 8. Retention

- Account data: retained until account deletion.
- Photos: retained until account deletion (see Section 4 for scope).
- Crash telemetry (Sentry): retained per Sentry's default 90-day window.

## 9. Contact

Questions, corrections, or data-subject requests:

Ben Lewis
ben@benlewis.fyi

## 10. Changes

We will update the version stamp at the top of this document when this policy changes. For alpha testers, changes are content-only — we do not yet gate app usage on re-consent. The current public URL is `https://benlewis.fyi/neatnest/privacy`.
