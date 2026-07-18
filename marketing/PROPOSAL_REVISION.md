# HiddenStay — Proposal Revision (Lecturer Feedback)

**Course:** BU3102/CP3102 · **Group:** 63 I  
**Purpose:** Replace or update sections in `project_proposal (1).pdf` before poster work.

---

## How to use this document

| Lecturer feedback | Fix location in this file |
|-------------------|---------------------------|
| OTA / EBITDA not defined | §1 Glossary — add to start of proposal |
| Wrong structure; β coefficients in lit review | §2 Problem Statement (rewritten) |
| Weak AI planner motivation | §3 AI Trip Planner motivation |
| Code of conduct scattered | §4 Unified Team Code of Conduct (replaces C.1, C.3–C.6) |
| Gantt too coarse | §5 Day-level Gantt chart |
| Risk owners missing | §6 Risk register with owners |

---

## §1 Glossary (insert after cover page, before Problem Statement)

> **Note to reader:** All industry terms used in this proposal are defined below.

| Term | Definition |
|------|------------|
| **OTA (Online Travel Agency)** | A website or app that lists hotels and takes bookings on behalf of properties (e.g. Booking.com, Expedia). The OTA charges the hotel a **commission** on each booking. |
| **Commission** | The percentage of a booking payment kept by the platform. If a guest pays SGD 100 and commission is 20%, the platform keeps SGD 20 and the hotel receives SGD 80. |
| **Independent hotel** | A property that is not part of a large international chain (e.g. a family-run guesthouse, boutique inn, or eco-lodge). These hotels usually cannot negotiate lower OTA fees. |
| **EBITDA per available room** | A profit measure used in the hotel industry: earnings before interest, taxes, depreciation, and amortisation, divided by the number of rooms available. It shows how much profit a hotel makes per room, before financing costs. **Lower EBITDA means the hotel earns less from each room.** |
| **MVP (Minimum Viable Product)** | The smallest working version of the product needed to test the idea and meet capstone requirements. |
| **UAT (User Acceptance Testing)** | Structured testing with real users (e.g. pilot hotel partners) to confirm features work as expected. |
| **Capstone scope** | Features we must deliver in the 10-week graded project. |
| **Post-capstone vision** | Business goals after graduation — not part of the graded MVP. |

---

## §2 Problem Statement (REPLACE pages 3–4)

### 2.1 Context

Small and independent hotels in Southeast Asia depend on **Online Travel Agencies (OTAs)** — booking websites such as Booking.com and Expedia — to reach international travellers. OTAs provide visibility and bookings, but charge **commission fees of roughly 15% to 30%** on each reservation.

### 2.2 Literature review — host (supply-side) problem

Research on hotel distribution channels shows a **contradiction** for independent properties:

- OTAs **increase room sales** by connecting hotels to a large online audience (Juniarta et al., 2026; Hospitalitynet.org, 2024).
- At the same time, OTA dependence **reduces profit margins**, because commission fees consume a large share of revenue — especially for **budget and independent hotels** that cannot negotiate chain rates (Juniarta et al., 2026).
- In Southeast Asia, independent hotels route a **much higher share of online bookings through OTAs** than chain hotels do, which increases their exposure to these fees (Hospitalitynet.org, 2024).
- Industry reports note **recent commission increases** targeting independent properties on major OTAs (Hospitality Technology, 2024; PhocusWire, 2024).

**Summary for the reader:** OTAs help hotels get guests, but the **cost of distribution is disproportionately high** for small independent operators. A survey cited by Juniarta et al. (2026) found that **most hotel managers consider OTA fees too high**.

*For the literature review, we cite the direction and magnitude of findings in plain language. Statistical details (regression coefficients) belong in the original paper, not in this proposal.*

### 2.3 Industry problem — traveller (demand-side)

Travellers who want **local, boutique, or eco-friendly stays** face a separate problem: **trip planning is fragmented**. A typical journey involves:

1. Inspiration (social media, blogs)  
2. Route planning (maps, spreadsheets)  
3. Activity research (review sites)  
4. Accommodation booking (OTA apps)  
5. On-trip navigation (another map app)  

Switching between **five or more tools** increases planning time and cognitive load. Generic AI chatbots can suggest activities, but often output **text-only lists** without map coordinates, opening hours, or links to **bookable nearby independent hotels**.

### 2.4 Problem statement (one paragraph)

**Independent hotels in Southeast Asia pay high OTA commissions that erode profit, while travellers lack a single platform that combines fair-priced booking of small properties with AI-assisted, map-ready trip planning.** HiddenStay addresses both gaps: a **5% commission** marketplace built for independent hotels, integrated with an **AI trip planner** that produces day-by-day itineraries with real map locations and bookable stays.

---

## §3 Why the AI Trip Planner Matters (NEW — insert after Problem Statement or in B.2)

Commission savings alone do not create traveller demand. HiddenStay’s **AI trip planner** is motivated by three concrete user problems:

### 3.1 Problem: Planning friction

| Without integrated planner | With HiddenStay planner |
|----------------------------|-------------------------|
| User copies suggestions from ChatGPT into Google Maps manually | AI outputs stops with **Google Places IDs and coordinates** |
| Hotel booked separately from daily activities | Itinerary and **booking live in one app** |
| No link between “things to do” and “where to stay” | Planner surfaces **HiddenStay listings near each stop** |

**User story:** A traveller planning 5 days in Chiang Mai currently spends hours cross-referencing blogs, maps, and Booking.com. HiddenStay reduces this to one flow: describe the trip → receive a **map-ready itinerary** → book an independent stay near the route.

### 3.2 Problem: Generic AI travel advice

Most AI tools recommend famous landmarks already crowded with tour groups. HiddenStay’s planner is designed to support **discovery of independent stays and hidden gems**, aligned with the platform’s positioning — not chain hotels at the top of OTA search results.

### 3.3 Problem: Conversion gap for small hotels

Independent hotels struggle with **discovery**, not just fees. The planner creates a **demand channel**: travellers who plan a trip in HiddenStay are shown bookable local properties along their route, increasing visibility without OTA advertising spend.

### 3.4 Measurable capstone goal (links to Objective 5)

| Goal | How we measure |
|------|----------------|
| Map-ready AI stops | ≥80% of planner stops have valid Google Places coordinates (validation script on 30 sample itineraries) |

**Why this is not “scope creep”:** The planner is not a separate product — it drives **search → book** conversion for the same inventory the marketplace lists.

---

## §4 Unified Team Code of Conduct (REPLACE C.1, C.3, C.4, C.5, C.6)

### C.1 Team Code of Conduct, Decision-Making, Workflow & Integrity

All team members agree to the following **single code of conduct** for the HiddenStay capstone project.

#### A. Professional behaviour

1. **Respect** — Treat every member fairly; criticise work, not people.  
2. **Honesty** — Report progress, blockers, and risks early in weekly meetings; do not hide delays.  
3. **Ownership** — Complete assigned tasks by agreed deadlines; flag conflicts before the deadline.  
4. **Attendance** — Attend scheduled meetings; notify the group at least 24 hours in advance if absent.  
5. **Quality** — Do not submit work that fails the sprint checklist; peer-review before merge.

#### B. Decision-making

| Decision type | Process |
|---------------|---------|
| **Task-level** (within one role) | Owner decides; informs team in weekly sync |
| **Shared** (design, priorities) | Discuss in weekly meeting; simple majority vote |
| **Major** (scope change, deadline slip) | All 5 members must agree; record in meeting minutes |
| **Deadlock** | Project Manager makes final call and logs rationale |

#### C. Workflow & files

- **Code:** GitHub Classroom repo, feature branches, pull request review before merge  
- **Tasks:** Trello/Jira updated weekly by task owner  
- **Documents:** Google Drive/OneDrive with versioned filenames  
- **Communication:** Team chat for daily updates; meeting minutes for decisions  

#### D. Conflict resolution

1. Discuss directly within **48 hours**  
2. Escalate to weekly team meeting  
3. Project Manager decides if unresolved  
4. Record outcome in project log  

#### E. Integrity & compliance

- Original work only; cite all sources — **no plagiarism**  
- Do not promise hotel partners features not in the current build  
- Follow **PDPA** when handling user or partner personal data  
- Use Stripe **sandbox only** during capstone — no live payments without approval  

*Sections C.2 (Roles) and C.7+ remain unchanged except where noted below.*

---

## §5 Gantt Chart — Day-Level (REPLACE C.8)

**Capstone duration:** 10 weeks · **Assumption:** Week 1 = Mon–Fri (5 working days each)

| ID | Task | Start | End | Days | Owner | Depends on |
|----|------|-------|-----|------|-------|------------|
| 1.1 | Team charter & role confirmation | W1 D1 | W1 D2 | 2 | PM | — |
| 1.2 | Literature review (OTA fees, SEA market) | W1 D2 | W1 D5 | 4 | BA | 1.1 |
| 1.3 | Commission comparison model | W2 D1 | W2 D3 | 3 | BA | 1.2 |
| 1.4 | Project kick-off milestone | W2 D5 | W2 D5 | 1 | All | 1.3 |
| 2.1 | Functional requirements document | W3 D1 | W3 D3 | 3 | BA | 1.4 |
| 2.2 | User stories (traveller, host, admin) | W3 D3 | W3 D5 | 3 | BA + Designer | 2.1 |
| 2.3 | System architecture diagram | W3 D4 | W4 D2 | 4 | Dev | 2.1 |
| 2.4 | Wireframes — search, listing, book | W4 D1 | W4 D5 | 5 | Designer | 2.2 |
| 2.5 | Requirements sign-off | W4 D5 | W4 D5 | 1 | All | 2.4 |
| 3.1 | UI kit & branding | W5 D1 | W5 D3 | 3 | Designer | 2.5 |
| 3.2 | High-fidelity screens — traveller flows | W5 D3 | W6 D2 | 4 | Designer | 3.1 |
| 3.3 | High-fidelity screens — host dashboard | W5 D5 | W6 D3 | 3 | Designer | 3.1 |
| 3.4 | Design approval | W6 D5 | W6 D5 | 1 | All | 3.2, 3.3 |
| 4.1 | DB schema + Prisma setup | W7 D1 | W7 D2 | 2 | Dev | 3.4 |
| 4.2 | Auth API (JWT) | W7 D2 | W7 D4 | 3 | Dev | 4.1 |
| 4.3 | Property listing API | W7 D4 | W8 D2 | 4 | Dev | 4.2 |
| 4.4 | Search API | W8 D2 | W8 D4 | 3 | Dev | 4.3 |
| 4.5 | Sprint 1 demo | W8 D5 | W8 D5 | 1 | Dev | 4.4 |
| 5.1 | Booking API + Stripe sandbox | W9 D1 | W9 D3 | 3 | Dev | 4.5 |
| 5.2 | Host dashboard (bookings, calendar) | W9 D2 | W9 D4 | 3 | Dev | 5.1 |
| 5.3 | Reviews module | W9 D4 | W9 D5 | 2 | Dev | 5.1 |
| 5.4 | Sprint 2 demo | W9 D5 | W9 D5 | 1 | Dev | 5.3 |
| 6.1 | AI engine + API integration | W7 D3 | W8 D3 | 6 | Dev | 4.2 |
| 6.2 | Google Places enrichment | W8 D1 | W8 D4 | 4 | Dev | 6.1 |
| 6.3 | Prompt design + JSON schema | W7 D1 | W8 D2 | 6 | BA + PM | 2.5 |
| 6.4 | Itinerary UI pages | W8 D3 | W9 D2 | 5 | Designer + Dev | 6.2, 6.3 |
| 6.5 | Map view integration | W9 D1 | W9 D4 | 4 | Dev | 6.4 |
| 6.6 | AI module demo | W9 D5 | W9 D5 | 1 | All | 6.5 |
| 7.1 | Integration testing | W9 D3 | W10 D2 | 4 | All | 5.4, 6.6 |
| 7.2 | UAT with pilot hotels | W10 D1 | W10 D3 | 3 | BA + PM | 7.1 |
| 7.3 | Bug fix buffer | W10 D2 | W10 D4 | 3 | Dev | 7.2 |
| 8.1 | Staging deployment | W10 D3 | W10 D4 | 2 | Dev | 7.3 |
| 8.2 | Final documentation | W10 D4 | W10 D5 | 2 | All | 8.1 |
| 8.3 | Capstone submission | W10 D5 | W10 D5 | 1 | PM | 8.2 |

**Legend:** W# D# = Week number, Day number (Mon=1 … Fri=5)

*Tip for Word/Excel Gantt: import this table; set Start/End as dates anchored to your actual term start.*

---

## §6 Risk Register with Owners (REPLACE C.9)

| # | Risk | Likelihood | Impact | Mitigation | **Risk owner** | Residual |
|---|------|------------|--------|------------|----------------|----------|
| R1 | Low pilot hotel adoption | Medium | High | Free onboarding; team personal contacts for first 5 listings | **Yihua Deng** (Marketing) | Low–Med |
| R2 | Lead Developer overload W7–8 | High | High | Split AI track: Dev = APIs; BA/PM = prompts/UI | **Zaw Latt Naung** (PM) monitors load | Low |
| R3 | Schedule overrun | Medium | Medium | Weekly sprint review; cut non-core features first | **Zaw Latt Naung** (PM) | Low |
| R4 | Stripe integration delay | Medium | Medium | Start sandbox W7 D1; manual test booking fallback | **Oakkar Phyoe** (Dev) | Low |
| R5 | AI API limits / downtime | Medium | Medium | Groq → Gemini → OpenAI fallback; cache itineraries | **Oakkar Phyoe** (Dev) | Low |
| R6 | Data / security breach | Low | Very High | HTTPS, hashed passwords, PDPA soft-delete | **Oakkar Phyoe** (Dev) | Low |
| R7 | Team member unavailable | Low | High | Docs in GitHub/Drive; cross-training on key modules | **Zaw Latt Naung** (PM) | Medium |
| R8 | AI planner map accuracy below 80% | Medium | Medium | Validation script; manual Places lookup fallback | **Chenyang Gu** (BA) | Low |
| R9 | UAT failure (<90% pass) | Medium | High | Test checklist from W9; buffer days W10 D2–D4 | **Eka Dian Tara Tiu** (UX) | Low |
| R10 | Scope creep (post-MVP features) | Medium | Medium | Written capstone scope; PM rejects out-of-scope tasks | **Zaw Latt Naung** (PM) | Low |

**Risk owner duty:** Monitor assigned risk weekly, report status in team meeting, trigger mitigation if likelihood or impact increases.

---

## §7 Suggested proposal structure (for lecturer)

Re-order the document to match a standard project proposal:

1. Cover page & team table  
2. **Glossary** (§1)  
3. **Executive summary** (1 page — write last)  
4. **Problem statement** (§2) — literature review in plain language  
5. **Proposed solution** — HiddenStay overview + commission model  
6. **AI trip planner motivation** (§3)  
7. **Objectives (SMART)** — keep existing table  
8. **Scope** — capstone MVP vs post-capstone (keep B.3/B.4 split)  
9. **Methodology / approach** — tech stack + agile weekly sprints  
10. **Project organisation** — roles (Section A)  
11. **Project management plan** — unified code of conduct (§4), day Gantt (§5), risks (§6)  
12. **Stakeholder analysis** — keep Section D  
13. **Expected outcomes** — keep B.5  
14. **References** — keep; remove β notation from in-text citations  

---

## §8 Quick checklist before resubmission

- [ ] Glossary on page 2  
- [ ] No regression coefficients (β₁, β₂) in problem statement — cite findings in words  
- [ ] AI planner has its own motivation section with user story  
- [ ] One unified code of conduct section (delete old C.3–C.6 headers)  
- [ ] Gantt shows days, not just weeks  
- [ ] Every risk has a named owner  
- [ ] Executive summary written last (1 page max)

---

*Revision prepared for Group 63 I — align with live MVP at github.com/virusxix/Travel_planner.*
