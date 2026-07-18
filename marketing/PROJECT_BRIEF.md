# HiddenStay — Product Brief

| Field | Detail |
|-------|--------|
| **Product** | HiddenStay |
| **Document type** | Product Brief (PO / PM) |
| **Version** | 3.0 |
| **Course** | BU3102 / CP3102 Capstone |
| **Team** | Group 63 I |
| **Status** | MVP in development |
| **Author** | Product team (Group 63 I) |

---

## Executive Summary

HiddenStay is a **two-sided travel product** for Southeast Asia that combines (1) a **low-commission booking marketplace** for independent hotels and (2) an **AI trip planner** that outputs map-ready itineraries linked to bookable local stays.

**The problem:** Independent hotel operators depend on Online Travel Agencies (OTAs)—platforms like Booking.com and Expedia—that charge **15–30% commission** and erode profit even as they drive occupancy. Travellers, meanwhile, plan trips across disconnected tools and receive generic AI suggestions without bookable, map-verified stops.

**Our bet:** A **5% commission model** wins supply-side adoption; an **integrated AI planner** wins traveller acquisition and converts planning intent into direct bookings—creating a defensible loop competitors do not offer today.

**Capstone goal:** Deliver a testable MVP in **10 weeks** with **5 pilot listings**, a **working booking flow**, and **measurable planner quality** (≥80% map-valid stops)—proving problem–solution fit before scaling.

---

## 1. Product Vision & Strategy

### 1.1 Vision

*Every independent stay in Southeast Asia is discoverable, fairly priced, and bookable in one journey—from trip idea to checkout.*

### 1.2 Mission (Capstone)

Validate that independent hotels will list on a **5% commission** platform and that travellers will **plan and book** independent stays when AI planning and marketplace booking are unified.

### 1.3 Strategic pillars

| Pillar | Product implication |
|--------|---------------------|
| **Fair economics** | 5% booking fee on all tiers; **free host portal (SGD 0/mo)**; optional Growth tools / Featured / performance ads always disclosed upfront |
| **Discovery, not volume** | Inventory quality > chain breadth; Hidden Gems over generic search |
| **Planning → booking** | AI planner is a **conversion surface**, not a standalone chatbot |
| **Asia-first** | Pilot SG/MY; language, partners, and content tuned to SEA travellers |

### 1.4 What we are NOT building (strategic guardrails)

- Not competing with Booking.com on global chain inventory  
- Not a generic ChatGPT wrapper without map data or booking links  
- Not a host-only PMS replacement in capstone scope  
- Not live payment processing until post-validation (Stripe sandbox in MVP)

---

## 2. Problem Definition

### 2.1 Glossary (for reviewers)

| Term | Definition |
|------|------------|
| **OTA** | Online Travel Agency—a booking platform (e.g. Booking.com) that lists properties and charges **commission** per reservation |
| **Commission** | Share of booking value retained by the platform (e.g. 20% of SGD 100 = SGD 20) |
| **Independent hotel** | Non-chain property: homestay, guesthouse, eco-lodge, boutique inn (typically &lt;30 rooms) |
| **EBITDA per available room** | Hotel industry profit metric per room; OTAs can reduce this even when bookings rise |
| **GMV / GBV** | Gross booking value—total amount paid by guest for a reservation |
| **MVP** | Minimum Viable Product—the smallest release that tests core hypotheses |

### 2.2 Problem statement

> **Independent hotels in Southeast Asia lose margin to high OTA commissions while travellers lack one product that connects AI-assisted, map-ready trip planning to bookable local stays.**

### 2.3 Evidence (literature & industry)

| Finding | Source | Product implication |
|---------|--------|---------------------|
| OTAs increase room sales but reduce profit margins for hotels | Juniarta et al. (2026) | Supply-side pain is **economic**, not just operational |
| Majority of hotel managers consider OTA fees too high | Juniarta et al. (2026) | **Commission reduction** is a credible host acquisition lever |
| Independent SEA hotels use OTAs for ~61% of online bookings vs ~35% for chains | Hospitalitynet.org (2024) | Independents are **over-indexed** on expensive channels |
| Major OTAs have raised fees for independent properties | Hospitality Technology, PhocusWire (2024) | Timing supports a **fair-commission** alternative |

*Note: Statistical coefficients from academic papers are omitted here; judges should evaluate directional market evidence, not regression outputs.*

### 2.4 User problems (Jobs-to-be-Done)

**Host job:** *“When I have empty rooms, help me reach travellers **without giving away 20%+ of my revenue** to a booking platform.”*

**Traveller job:** *“When I plan a trip to Southeast Asia, help me **discover authentic places to stay** and **organise my days** without juggling five apps.”*

**Admin job (platform trust):** *“Ensure listings are legitimate before travellers book.”*

---

## 3. Users & Personas

### 3.1 Primary personas

#### Persona A — **Siti, Independent Host** (Supply)

| Attribute | Detail |
|-----------|--------|
| Role | Owner, 8-room eco-lodge, Chiang Mai |
| Current behaviour | Lists on Booking.com; pays ~18% commission |
| Pain | Thin margins; cannot negotiate chain rates; guest relationship owned by OTA |
| Goal | More direct bookings; keep revenue; simple calendar view |
| Success moment | Sees SGD 95 retained on a SGD 100 booking vs SGD 82 on OTA |

#### Persona B — **Alex, Experience Traveller** (Demand)

| Attribute | Detail |
|-----------|--------|
| Role | 32, software professional, annual Asia trip |
| Current behaviour | Uses Google Maps + blogs + Booking.com; tried ChatGPT for ideas |
| Pain | Planning takes hours; AI lists places without maps; results skew to chains |
| Goal | Unique stays; efficient planning; trustworthy checkout |
| Success moment | Gets 5-day map itinerary + books boutique stay near Day 2 route in one session |

#### Persona C — **Platform Admin** (Internal)

| Attribute | Detail |
|-----------|--------|
| Role | HiddenStay operations (capstone: team member) |
| Job | Approve new listings; suspend fraud; monitor booking health |
| Success moment | Onboards 5th pilot listing with complete photos and pricing |

### 3.2 Stakeholder map

| Stakeholder | Interest | Influence | MVP expectation |
|-------------|----------|-----------|-----------------|
| Travellers | Fair price, unique stays, easy planning | Medium | Working search, book, planner |
| Independent hosts | Low fee, bookings, simple tools | Medium | Dashboard, 5% fee visible |
| Lecturers / judges | Problem fit, SMART delivery, demo | High | End-to-end capstone demo |
| Payment / maps providers | Reliable sandbox APIs | Low | Test-mode transactions |

---

## 4. Product Value Proposition

### 4.1 Value proposition canvas (summary)

| | Hosts | Travellers |
|---|-------|------------|
| **Gains** | Keep 95%; direct guest contact; discovery via planner | One app; hidden gems; map-ready AI plans |
| **Pains relieved** | High OTA fees; poor tools; low visibility | Fragmented planning; generic AI; chain-heavy search |
| **Products & services** | Listing, dashboard, booking alerts, earnings view | Search, Hidden Gems, AI planner, checkout, reviews |

### 4.2 Positioning

**For** experience-led travellers and independent hotel owners in Southeast Asia  
**Who** struggle with high OTA fees and fragmented trip planning  
**HiddenStay is** a fair-commission marketplace with integrated AI trip planning  
**That** unlike Booking.com or Expedia  
**Provides** 5% host economics and map-ready itineraries tied to bookable local inventory.

### 4.3 Core hypotheses (to validate in capstone)

| ID | Hypothesis | Validation method | Pass criteria |
|----|------------|-------------------|---------------|
| H1 | Hosts prefer 5% over 15–30% when economics are transparent | Partner interviews + commission one-pager | ≥4/5 pilots cite fee as reason to list |
| H2 | Travellers will use AI planner if output is map-ready | Usage analytics + UAT | ≥80% stops have valid coordinates |
| H3 | Planner increases booking intent | Funnel observation | Users who plan → view listing ≥2× vs search-only |
| H4 | End-to-end booking flow is usable | UAT checklist | ≥90% test bookings complete |

---

## 5. Solution Overview

HiddenStay is one product with **three interconnected experiences**:

```
┌─────────────────────────────────────────────────────────────┐
│                      HiddenStay Product                      │
├──────────────┬──────────────────────┬───────────────────────┤
│   MARKETPLACE │    AI TRIP PLANNER    │   HOST WORKSPACE     │
│  Search       │  Chat + day timeline  │  Listings            │
│  Hidden Gems  │  Map + Places data    │  Bookings & calendar │
│  Book & pay   │  Link to nearby stays │  Earnings (5% fee)   │
└──────────────┴──────────────────────┴───────────────────────┘
         │                  │                      │
         └──────────────────┴──────────────────────┘
                    Single account & inventory
```

**Why integration matters (product logic):**  
The planner is the **top-of-funnel** for travellers; the marketplace is **monetisation**; the host workspace is **supply retention**. Splitting these across separate products would fail H3 and weaken host discovery (H1 alone is insufficient for traveller acquisition).

---

## 6. MVP Scope

### 6.1 In scope — Capstone MVP (10 weeks)

| Epic | User value | Key capabilities |
|------|------------|------------------|
| **E1 — Identity** | Secure access for all roles | Traveller, host, admin registration & login |
| **E2 — Listings** | Hosts can go live | Property + room CRUD, photos, pricing, availability |
| **E3 — Discovery** | Travellers find stays | Search by destination, dates, price, type; Hidden Gems map |
| **E4 — Booking** | Revenue event | Room booking, Stripe **sandbox** payment, **5% commission** recorded |
| **E5 — Host ops** | Partners manage business | Booking list, calendar view, basic stats, earnings breakdown |
| **E6 — AI planner** | Differentiated planning | Chat itinerary, Google Places enrichment, map view, day timeline |
| **E7 — Trust** | Safer marketplace | Guest reviews; admin listing approval |
| **E8 — Release** | Demo-ready | Staging deployment; UAT with pilot partners |

### 6.2 Out of scope — Capstone (explicit deferrals)

| Item | Reason deferred |
|------|-----------------|
| Live payment processing | Regulatory & capstone risk; sandbox proves flow |
| Native iOS/Android apps | Web MVP validates demand first |
| Multi-language | Single-market pilot reduces complexity |
| Dynamic pricing engine | Requires booking volume data |
| Full payout automation | Post-capstone ops |
| All SEA countries | Focus SG/MY pilots for measurable UAT |

### 6.3 MVP definition of done

- [ ] 5 pilot listings approved and bookable  
- [ ] Booking completes in Stripe sandbox with 5.00% commission stored  
- [ ] Host dashboard shows bookings and net earnings  
- [ ] AI planner produces itinerary with map; ≥80% stops geocoded  
- [ ] UAT ≥90% pass on critical paths (search → book; host list → receive booking)  
- [ ] Staging URL demo-ready for assessment  

---

## 7. Success Metrics

### 7.1 North Star Metric (post-launch)

**Monthly Gross Booking Value (GBV)** on independent inventory — measures both supply and demand health.

### 7.2 Capstone KPIs (measurable at Week 10)

| KPI | Target | Measurement |
|-----|--------|---------------|
| UAT booking success rate | ≥90% | Test script / partner walkthrough |
| Commission accuracy | 100% at 5.00% | DB audit of test transactions |
| Pilot listings live | 5 | Admin-approved records |
| Planner geocode accuracy | ≥80% | Validation on 30 sample itineraries |
| Host dashboard satisfaction | ≥4/5 | Short partner survey |
| Critical path availability | Staging live | Judge demo without manual workaround |

### 7.3 Leading indicators (product health)

| Metric | Why it matters |
|--------|----------------|
| Planner sessions / WAU | Demand creation |
| Search → listing view rate | Discovery quality |
| Listing view → booking start | Conversion |
| Host time-to-first-booking | Supply-side activation |
| Review submission rate | Trust loop |

---

## 8. Product Roadmap

### 8.1 Now — Capstone (Weeks 1–10)

Focus: **Prove H1–H4** with integrated MVP (Epics E1–E8).

### 8.2 Next — Months 1–6 post-capstone

| Initiative | Outcome |
|------------|---------|
| Live payments & payout reporting | Real revenue |
| 50 partner listings (SG/MY/TH) | Supply scale |
| Mobile-responsive PWA polish | Traveller retention |
| SEO destination pages | Organic acquisition |

### 8.3 Later — Months 6–24

| Initiative | Outcome |
|------------|---------|
| Featured listing + performance ads | Revenue diversification — **optional**, disclosed upfront |
| Native apps | Channel expansion |
| 6-country SEA rollout | Regional PMF |
| Partner analytics & dynamic pricing | Host stickiness |

---

## 9. Go-to-Market (Product-Led)

### 9.1 Sequencing

**Supply first:** Without listings, traveller acquisition wastes CAC.  
**Planner as hook:** Traveller-facing differentiator for awareness and SEO content.

### 9.2 Launch motions

| Motion | Audience | Message |
|--------|----------|---------|
| Partner outreach | Hosts | “**From 5% per booking, SGD 0/mo on Starter** — see your total vs your OTA invoice” |
| Content / SEO | Travellers | “Hidden gems in [city]” + sample AI itineraries |
| Social demo | Travellers | 30s screen recording: plan → map → book |
| University / word of mouth | Early adopters | Pilot UAT participants |

### 9.3 Pricing (product policy — transparent tiers)

**Messaging rule:** Always show **booking fee + optional monthly fees** together. Never advertise “5% only” without the tier table.

**Host portal vs Growth tools:** Every host uses the **free host portal** to list and get paid. **Growth tools** (SGD 50/mo) is an optional upgrade — not a paywall to access the site.

| Tier | Monthly fee | Booking fee | Included | Capstone |
|------|-------------|-------------|----------|----------|
| **Starter — host portal** | **SGD 0** | **5%** | List, book, payout, earnings, calendar | ✓ MVP default |
| **Growth tools** | **SGD 50** (or SGD 500/yr) | **5%** | + advanced SEO, analytics, extra photos | Post-pilot |
| **Featured listing** | **+SGD 99/mo** per property | **5%** | Homepage / landing spotlight | Post-pilot |
| **Performance ads** | **7–10%** on attributed bookings (15% cap) | **5% + ad %** | SEO + promoted placement (opt-in; SGD 0 if &lt;10 bookings/mo) | Post-pilot |

**Trust policies:** 60-day Growth tools trial (first 20 hosts); pause Growth after 30 days with zero bookings; no auto-upgrade from Starter; performance ads always opt-in.

**Host calculator:** Show monthly total vs OTA invoice at onboarding (see `REAL_WORLD_FINANCIAL_STRATEGY.md` §2.5).

---

## 10. Competitive Analysis

| Capability | Booking.com | Expedia | Airbnb (partial) | HiddenStay |
|------------|-------------|---------|------------------|------------|
| Independent / boutique focus | Partial | Partial | Strong (different model) | **Core** |
| Commission (typical independent) | 15–30% | 15–30% | ~3% host fee + guest fee | **5%** |
| Integrated AI map itinerary | No | Limited | No | **Yes** |
| SEA-first partner economics | No | No | No | **Yes** |
| Booking + planning unified | No | No | No | **Yes** |

**Moat (early stage):** Niche inventory + fair economics + planner-to-booking loop—not network scale.

---

## 11. Assumptions, Risks & Mitigations

| Assumption | If wrong | Mitigation | Owner |
|------------|----------|------------|-------|
| Hosts will list at 5% | No supply | Free onboarding; team network for 5 pilots | Marketing |
| Travellers want AI planning | Low engagement | Improve map UX; seed sample trips | UX / BA |
| 10 weeks sufficient for MVP | Scope miss | Weekly cut list; defer E7 nice-to-haves last | PM |
| Pilot partners available | Empty marketplace | Demo listings + personal outreach | Marketing |
| AI API stable & affordable | Planner fails | Model fallback chain; cache itineraries | Dev |
| Stripe sandbox sufficient for judges | Demo confusion | Clear “test mode” labelling in UI | PM |

---

## 12. Dependencies & Constraints

| Dependency | Impact | Contingency |
|------------|--------|-------------|
| Google Places / Maps | Planner quality | Manual coordinate fallback for demo |
| Stripe sandbox | Booking demo | Manual booking record for UAT worst-case |
| OpenAI / Gemini / Groq | Itinerary generation | Pre-seeded sample itineraries |
| Pilot host cooperation | UAT realism | Team-curated test accounts |
| PDPA compliance | Legal | Minimal PII; soft-delete policy |

**Constraints:** 5-person student team; 10-week capstone; no live money in MVP.

---

## 13. Team & Product Ownership (RACI snapshot)

| Area | Accountable | Responsible |
|------|-------------|-------------|
| Product scope & priorities | Zaw Latt Naung (PM) | All |
| Marketplace & booking | Oakkar Phyoe (Dev) | Dev |
| UX & UAT | Eka Dian Tara Tiu (Design) | Design |
| Metrics, requirements, AI prompts | Chenyang Gu (BA) | BA |
| Partner acquisition & GTM | Yihua Deng (Marketing) | Marketing |

**Decision rule:** Task-level → owner decides; scope change → all 5 agree; deadlock → PM.

---

## 14. Financial Viability (Product Lens)

### 14.1 Unit economics (per booking)

| SGD 100 booking | OTA (~18%) | HiddenStay (5% — all tiers) |
|-----------------|------------|----------------------------|
| Platform fee | SGD 18 | **SGD 5** |
| Host retains | SGD 82 | **SGD 95** |
| Host saving | — | **SGD 13 per booking** |

*Monthly fees are separate and optional — see §14.2.*

### 14.2 Revenue model — transparent four streams

**Disclosure rule:** Present all four lines together in product, pitch, and proposal — not “5%” alone.

| Stream / tier | Price | Required? | Host gets |
|---------------|-------|-----------|-----------|
| **Starter — booking fee** | **5%** per stay | Yes | Free **host portal** — list, book, payout, earnings, calendar |
| **Growth tools** | **SGD 50/mo** or **SGD 500/yr** | Optional | Advanced SEO, analytics, extra photos |
| **Featured listing** | **SGD 99/mo** per property | Optional | Homepage / landing spotlight |
| **Performance advertising** | **7–10%** on attributed bookings | Optional | Promoted placement — **15% total cap** (SGD 0 ad fee if &lt;10 bookings/mo) |

**Guest room prices unchanged.** Featured and performance ads are **advertising**, not hidden commission hikes.

### 14.3 Host monthly cost example (8 bookings × SGD 112 avg)

| | Booking.com | Starter | + Growth tools | + Featured |
|---|-------------|---------|----------------|------------|
| Commission | ~SGD 161 | ~SGD 45 | ~SGD 45 | ~SGD 45 |
| Monthly fee | — | SGD 0 | SGD 50 | SGD 149 |
| **Total** | **~SGD 161** | **~SGD 45** | **~SGD 95** | **~SGD 194** |

**Starter** still beats Booking.com at modest volume. Featured is for hosts who want extra visibility.

### 14.4 Illustrative Year 1 (platform revenue)

| Revenue line | Year 1 (SGD) |
|--------------|--------------|
| Booking fees (5%, ~1,025 bookings) | ~6,150 |
| Growth tools (SGD 50/mo) | ~6,000 |
| Featured listing (SGD 99/mo) | ~2,970 |
| Performance advertising | ~3,024 |
| **Total platform revenue** | **~18,144** |
| Running costs | ~12,000 |
| **Profit (base case)** | **~6,144** |

**Break-even:** ~**Month 5–6** on combined revenue — booking fees alone are insufficient at hidden-stay prices; **optional** host upgrades are disclosed upfront, not a surprise.

*Full model, trust policies, host copy: **`REAL_WORLD_FINANCIAL_STRATEGY.md`** · Simple narrative: **`FINANCIAL_SURVIVAL_PLAN.md`***

*Judges: figures are projections for viability discussion, not audited forecasts.*

---

## 15. Expected Outcomes (Judge Summary)

| Stakeholder | Capstone outcome |
|-------------|------------------|
| **Hosts** | Demonstrably better economics; usable dashboard; 5 live pilots |
| **Travellers** | Search, plan, and book independent stays in one product |
| **Product team** | Validated hypotheses H1–H4 with measurable KPIs |
| **Industry reviewers** | Clear problem evidence, scoped MVP, realistic roadmap, honest risks |

---

## 16. References

1. Juniarta, I.G.M., et al. (2026). *More Rooms, Less Profit: Unveiling OTA Distribution Channels' Contradictory Hotel Impacts.* Momentum Matrix, 3(1). https://doi.org/10.62951/momat.v3i1.603  
2. Hospitalitynet.org (2024). *The real cost of Booking.com: Five practical steps for Southeast Asian hotels.*  
3. Hospitality Technology (2024). *Expedia and Booking.com increase their fees for independent hotels.*  
4. PhocusWire (2024). *Booking.com and Expedia commission hikes spark backlash from independent hotels.*

---

## Appendix A — Critical user journeys (MVP)

**Journey 1 — Traveller books a stay**  
Discover (search / Hidden Gems) → View listing → Select dates → Pay (sandbox) → Confirmation  

**Journey 2 — Traveller plans then books**  
Open planner → Describe trip → Review map itinerary → Tap nearby listing → Book  

**Journey 3 — Host onboarding**  
Register as host → Create listing → Admin approval → Receive booking → View earnings (95%)  

---

## Appendix B — Requirements traceability (SMART → Epic)

| SMART objective | Epic |
|-----------------|------|
| Booking flow ≥90% UAT | E4 Booking |
| 5% commission enforced | E4 Booking |
| Host dashboard ≥4/5 | E5 Host ops |
| 5 pilot listings | E2 Listings + E8 Release |
| ≥80% map-valid AI stops | E6 AI planner |

---

*This brief is written for industrial and academic judges evaluating product merit, scope discipline, and market viability—not as a technical specification. Implementation details are documented separately in the capstone project proposal and repository.*
