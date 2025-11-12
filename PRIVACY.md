# HealWise Privacy Policy

_Last updated: 2025-02-14_

This Privacy Policy explains how Foster Wealth Ventures, LLC (“HealWise,” “we,” “us”) collects, uses, and protects information when you use the HealWise application, website, and related services (the “Services”).

## 1. Guiding Principles

1. **Educational-only scope:** HealWise is designed for learning and reflection. We discourage the submission of Protected Health Information (“PHI”) or sensitive personal details.
2. **Local-first storage:** Planner entries, ingredient preferences, dark-mode settings, and onboarding flags are stored in your browser’s `localStorage`. They never leave your device unless you export them.
3. **Transparency:** When we add cloud sync or analytics in the future, we will update this document and obtain consent where required.

## 2. Information We Collect

### Information you provide
- Ingredient preferences or avoid lists you type into the Profile view.
- Planner notes, exported files, and any feedback form submissions stored locally.
- Optional email or contact info you include when requesting support.

### Automatically collected information
- Minimal diagnostic logs for the Express server (port 4000) when running locally.
- Standard HTTP metadata (IP address, user agent) if you deploy the `api/gemini-proxy` endpoint or host the demo publicly.

### Information we intentionally do **not** collect
- PHI, diagnoses, medication instructions, or data about minors—please do not submit this.
- Exact location data, financial information, or government IDs.

## 3. How Information Is Used

| Use Case | Details |
| --- | --- |
| Product functionality | Local storage of planner items, preferences, and onboarding state. |
| AI generation | When you submit a prompt, HealWise sends the text plus optional ingredient preferences to Google’s Gemini API to generate educational summaries. |
| Support & operations | High-level logs (success/failure) help us maintain uptime and troubleshoot bugs. |

We do **not** sell, rent, or license your data.

## 4. Data Sharing

We may share limited data:

- **Vendors:** Cloud providers (e.g., Vercel, Google Cloud) that host the Services and must process data to fulfill their duties. They are bound by their own agreements.
- **Legal:** When required by law, subpoena, or to protect the safety of users and the public.

No PHI is intentionally shared because we ask users not to submit it in the first place.

## 5. Data Security

- Front-end storage is sandboxed to your device’s browser profile.
- API keys should be stored in server-side environments; never ship real secrets in the client bundle.
- Access to repositories and production infrastructure is limited to authorized team members under least-privilege principles.

## 6. Data Retention & Deletion

- Local data stays on your device until you clear browser storage or use the “Clear Planner” controls.
- If backend persistence is enabled in the future, retention schedules will be documented here along with deletion/portability instructions.

## 7. International Considerations

HealWise is operated from the United States. By using it from other regions you consent to the transfer and processing of information in the U.S., where privacy laws may differ from yours.

## 8. Children

The Services are not directed to children under 13 (or the relevant age of digital consent in your jurisdiction). Do not allow minors to submit personal information to HealWise.

## 9. Changes

We will post revisions to this Privacy Policy in the repository and, when reasonable, inside the app. Your continued use after changes become effective signifies acceptance.

## 10. Contact

Questions or data requests? Email **privacy@healwise.ai**.

---

By using HealWise you acknowledge that it is a learning companion, that you should avoid sharing PHI, and that you retain control over any data stored locally on your device.
