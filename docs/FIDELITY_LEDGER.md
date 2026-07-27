# RetailLens visual fidelity ledger

QA date: 2026-07-27
Reference concepts:

- `docs/design/intake-concept.png`
- `docs/design/report-concept.png`
- `docs/design/matrices-concept.png`
- `docs/design/enterprise-workpaper-concept.png` — enterprise decision-workpaper concept

Latest browser-rendered implementation evidence:

- `docs/design/enterprise-desktop-qa.png`
- `docs/design/enterprise-theory-desktop-qa.png` — 91-field enterprise extension and eight-module theory workpaper

The base implementation was inspected at the browser's native desktop viewport and at a temporary 390 × 844 mobile viewport. The enterprise extension was replayed end to end at the native 1280 × 720 desktop viewport from `http://127.0.0.1:8787`. The responsive rules cover the new enterprise classes, but a fresh resizable mobile Browser viewport was not available for the extension, so the ledger does not claim a new mobile screenshot.

| Comparison point | Concept | Implemented result | Status / intentional deviation |
|---|---|---|---|
| Global frame | Thin header, three central navigation items, language toggle, explicit bilingual-only notice | Same hierarchy and navigation; added a narrow service-readiness strip below the header | Matched; status strip adds operational clarity |
| Intake structure | Left eight-step rail, open two-column form, right coverage rail, fixed action bar | Preserved the rail/form/coverage/action model and added a ninth Enterprise workbench: the original eight steps define 108 fields and step nine adds exactly 91 structured fields | Intentional functional extension; current physical/hybrid route defines 199 visible fields |
| Visual language | White canvas, navy text, restrained amber accent, thin grey rules, teal positive states | Same palette, spacing system, border treatment, typography hierarchy, and state colors | Matched |
| Report frame | Left report navigation, central score/report canvas, right AI interpretation rail | Same three-column layout at desktop; collapses to one-column reading order on mobile | Matched responsively |
| Score band | Large score, band label, confidence, completeness, alert count | Same metrics; deterministic-score lock is explicit and gate outcome is appended to the performance band | Matched and clarified |
| Ten dimensions | Weighted horizontal bars | Correct 100-point weights and status-aware teal/amber/red bars | Matched; concept's illustrative weights did not total 100 and were corrected |
| IE matrix | Three-by-three strategy matrix | Horizontal IFE weak→average→strong; vertical EFE high→medium→low; cells III/II/I, VI/V/IV, IX/VIII/VII | Intentional correction: concept had the axes reversed |
| EFE/IFE/QSPM | Factors and strategy comparison | Auditable weight totals, ratings, TAS, STAS, relative winner, and safe empty states | Extended without inventing facts |
| AI panel | Independent right rail | Shows complete/unavailable/error state and reiterates that AI cannot alter either the locked score or locked eight-module theory assessment | Matched with stronger control copy |
| API configuration | Not shown in reference image | Added an OpenAI-only bilingual dialog with model choice, masked key input, safe connection test, and explicit current-page memory/privacy copy | Intentional operational extension; no secret is stored |
| Mobile | Not shown in reference image | The shared shell previously passed 390 × 844; the enterprise extension adds explicit one-column rules at `≤680px`, but has no fresh mobile screenshot | Responsive code verified; fresh enterprise mobile visual evidence remains outstanding |
| Enterprise workpaper hierarchy | Left workpaper rail, central decision evidence, partner-review rail | Added Executive workpaper as the first report route; deterministic content occupies the central canvas while the existing independent AI rail remains on the right | Matched hierarchy; AI rail retained as a stronger control boundary |
| Management answer | Conditional-Go band with readiness, evidence confidence, evidence quality, and red flags | Deterministic Proceed / Conditional / Pause / Stop stamp, one-page conclusion, exact rule, preconditions, readiness, evidence quality, and evidence confidence | Matched and strengthened with reproducible decision logic |
| MECE diagnostic | Four illustrated issue-tree lines | Five actual branches—commercial thesis, route to customer, operating model, economics, feasibility & execution—with ten testable dimension hypotheses | Intentional expansion to preserve all ten course dimensions without overlap |
| Scenario laboratory | Downside/base/upside comparison and triggers | Submitted downside/base values plus symmetric upside sensitivity; contribution and mathematical break-even coverage remain blank when inputs are unavailable | Matched; removed illustrative external forecasts |
| KPI causal tree | Outcome, driver, and guardrail table with cadence and owner | Three decision outcomes, linked drivers/guardrails, formulas, target basis, cadence, owner, and source handles | Matched and made auditable |
| 90-day workstreams | 0–30 / 31–60 / 61–90 management plan | Risk-ranked P0/P1/P2 workstreams with owner, horizon, next step, exit criteria, and source handles | Matched and extended |
| Evidence and audit | Partner-review findings and source register | Separate evidence-quality register, assumptions/tests, course handles, formula register, limitations, and current-fact disclaimer | Matched control intent; detailed audit content sits in the main workpaper |
| Enterprise theory workbench | Not present in the original report concept | Eight deterministic modules: Five Forces, CPM, STP, entry-mode MCDA, SPM/GMROI, Service GAPS, organization/control, and top risk/monitoring | Intentional enterprise extension; each module exposes formula, status, evidence requirements, source handles, and internal-rule disclaimer |
| Narrative scoring control | Concept did not specify how prose affects scoring | Narrative presence establishes coverage only; additional text length never earns additional performance points | Intentional audit control; structured values and explicit checks drive score differences |
| Method positioning | Concept used consulting-workpaper visual cues | Independent RetailLens method using course theory and public professional-practice references; no Big Four affiliation, endorsement, or proprietary-method claim | Intentional legal and methodological clarification |

## Copy differences

- The concept used illustrative business, score, and action copy. The implementation uses a clearly labelled synthetic demonstration dataset generated by the real deterministic engine.
- “Executive decision workpaper” is rendered as “Management decision memo / 管理层决策备忘录” inside the report because the first page is the management conclusion; the navigation retains “Executive workpaper / 管理层底稿” for the full artifact.
- The concept's four illustrative issue lines were expanded to five MECE branches so that channel/location/customer lifecycle, operating model, economics, and compliance/execution remain distinct.
- The concept's A− evidence grade and red-flag count were replaced by exact 0–100 evidence-quality logic and enumerated preconditions; no unsupported letter grade is invented.
- “Critical alerts” is rendered as “Hard-gate alerts” because legal and operational gates remain separate from the performance score.
- The implementation states “Chinese & English only / 仅支持中文与 English” in the header and intake guidance, and does not offer a third language.
- The intake rail now contains nine steps. The added Enterprise workbench contributes 91 structured inputs; it is not represented as 91 prose prompts.
- Historical course examples are labelled as teaching/framework fixtures and cannot be displayed as current company, country, legal, market, or financial benchmarks.
- “Consulting-grade” describes the workpaper discipline and auditability target only; the product does not claim affiliation with, endorsement by, or access to proprietary methods of any Big Four firm.

## Verified core interaction

Load demo → 199/199 visible data fields complete, including the 91-field Enterprise workbench → Generate assessment → Executive workpaper → Enterprise theory engine → inspect all eight modules → switch to English → API settings → Method & Audit.

Latest desktop Browser QA verified a 74.3 locked score, a deterministic Conditional Proceed recommendation, 85.9 decision readiness, 87.8 evidence quality, 88.6 confidence, five issue-tree branches, downside/base/upside economics, three KPI outcomes, all eight complete theory modules, Five Forces 35/100 internal attractiveness, CPM totals 3.70/3.35/3.30, STP diagnostics, entry-mode MCDA 78.0 versus 68.8, SPM/GMROI calculations, Service GAPS, 71.7% submitted control coverage, residual risk 8.8, bilingual switching, the no-key AI fallback, and the current-page API configuration/privacy copy. Browser evaluation confirmed document and body `scrollWidth = clientWidth = 1280`, with the theory workpaper also free of body-level horizontal overflow.

## Enterprise-extension verification boundary

The fresh desktop replay was completed:

`Load demo → review all nine steps → verify 91/91 Enterprise workbench inputs → Generate assessment → Executive workpaper → Enterprise theory workbench → inspect eight locked modules → switch Chinese/English → confirm AI reads but cannot alter either deterministic snapshot → API settings`

The screenshot is `docs/design/enterprise-theory-desktop-qa.png`. The only remaining visual-evidence limitation is a fresh mobile capture for the extension; build success and responsive CSS are not presented as a substitute for that screenshot.
