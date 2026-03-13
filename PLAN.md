# AI Readiness Checker — Verbesserungsplan

## Überblick

Umfassende Überarbeitung des AI Readiness Checkers: Sprache, Inhalte, Scoring, UI und Bugfixes. Zielgruppe: deutscher Mittelstand. Positionierung: Teclead Ventures als KI-Experten mit Prozessverständnis und Change-Management-Kompetenz.

---

## Phase 1: Datenmodell & Kategorie-Struktur (Fundament)

### 1.1 Kategorie-Struktur von Tiers auf funktionale Bereiche umstellen

**Dateien:** `src/lib/features/types.ts`, `dev-features.ts`, `business-features.ts`

- Die 5 Tiers (Table Stakes → Frontier) werden durch **funktionale Kategorien** ersetzt, die von simpel zu komplex aufbauen:

**Developer-Track — Neue Kategorien:**
1. **KI-Grundlagen & Verständnis** — Wie funktioniert KI? Was kann sie, was nicht? Grundlegendes Wissen.
2. **Grundlegendes Tooling** — Alltägliche KI-Werkzeuge im Entwickleralltag (Code Completion, Chat, Fehlerdiagnose).
3. **Produktive Nutzung** — Gezielte Nutzung für Code-Qualität, Tests, Reviews, Refactoring.
4. **Automatisierung & Workflows** — Automatisierte Pipelines, Multi-File-Editing, App-Generierung, CI/CD-Integration.
5. **Strategische KI-Kompetenz** — Kontext-Engineering, Prompt Libraries, Evaluation-Systeme, eigene Use Cases finden und umsetzen.

**Business-Track — Neue Kategorien:**
1. **KI-Grundlagen & Verständnis** — Basiswissen: Wie funktioniert KI? Möglichkeiten und Grenzen.
2. **Grundlegendes Tooling** — Chat-Assistenten, Websuche, Schreibhilfe, Bildgenerierung.
3. **Produktive Nutzung** — Meeting-Transkription, Dokumentenerstellung, Präsentationen, Datenanalyse.
4. **Automatisierung & Workflows** — Content-Erstellungspipelines, automatisierte Berichte, Workflow-Automatisierung, Tool-Integrationen.
5. **Strategische KI-Kompetenz** — Eigene KI-Agenten, persistenter Kontext, strategische Use-Case-Identifikation, KI-gestütztes Prozessdesign.

- Jede Kategorie bekommt eine `description` (1-2 Sätze) die in der UI als erklärende Zeile unter dem Kategorienamen angezeigt wird.
- `TIER_CONFIG` → `CATEGORY_CONFIG` umbenennen; Gewichtung beibehalten (aufsteigend nach Komplexität).
- `tier`-Feld in `Capability` Interface → `category` umbenennen.

### 1.2 Capabilities inhaltlich aktualisieren (Stand: März 2026)

**Alle Capabilities auf Aktualität prüfen und anpassen:**

- **"Advanced Configurations"** komplett überarbeiten: Datei-Uploads, persistenter Kontext sind 2026 Standardfunktionen → in niedrigere Kategorie verschieben oder ersetzen.
- **"Frontier"** neu definieren: Nicht "Hooks und Skills kennen", sondern: Kontext-Engineering, Management und Bewahrung von Kontext über Sessions hinweg, Aufbau eigener Prompt Libraries, Evaluation-Systeme für KI-Output-Qualität, systematisches Finden und Validieren eigener Use Cases.
- **Workflow-Beispiele** spezifischer: "Content-Erstellungspipelines", "automatisierte Code-Review-Pipelines", "KI-gestützte Incident-Response", "automatisierte Report-Generierung" statt generischer Beispiele.
- **Veraltetes entfernen/aktualisieren:** z.B. "KI in Tabellen" → "Automatisierung in Tabellen", Beispiele auf aktuellen Stand bringen.
- Alle `firstAvailable`-Daten auf Plausibilität prüfen.

### 1.3 Response Scale anpassen

**Datei:** `src/lib/features/types.ts`

- "Integrated" → **"Regelmäßig genutzt"** (`de`) / "Regularly Used" (`en`)
- "Unaware" → **"Nicht bekannt"**
- "Aware" → **"Bekannt"**
- "Tried" → **"Ausprobiert"**

### 1.4 Job-Relevanz-Dimension hinzufügen

**Dateien:** `types.ts`, `FeatureItem.tsx`, `FeatureMatrixStep.tsx`, `survey.ts`

- Pro Capability eine zweite Bewertungszeile: **"Relevant für meinen Job?"** mit Optionen: Ja / Nein / Nicht sicher.
- `features`-Datenstruktur erweitern: `Record<string, { score: 0|1|2|3, relevant: 'yes'|'no'|'unsure' }>` statt `Record<string, 0|1|2|3>`.
- UI: Kompaktes 2-Zeilen-Layout pro Capability (Zeile 1: Nutzungsgrad, Zeile 2: Relevanz).

### 1.5 Survey-Type-Definitionen aktualisieren

**Datei:** `src/types/survey.ts`

- `SurveyResponse` Interface anpassen für neue Felder:
  - `features` → neues Format mit Relevanz
  - `knowledge_management` → neuer Abschnitt (siehe Phase 2)
  - `barriers` → erweiterte Optionen
- Score-Labels Deutsch überarbeiten (kein "Frontier", kein "Pioneer")
- Supabase Schema (`supabase/schema.sql`) entsprechend anpassen.

---

## Phase 2: Survey-Inhalte & neue Fragen

### 2.1 Sprachliche Gesamtbereinigung

**Dateien:** `src/messages/de.json`, `en.json`, alle Survey-Components

- **Alle** englischen Begriffe in deutschen UI-Texten ersetzen:
  - "Assessment" → "Einschätzung" / "Bewertung"
  - "Timeline Positionierung" → "Zeitliche Einordnung"
  - "Team Benchmarks" → "Team-Vergleich"
  - "Frontier" → "Vorreiterrolle" / "Strategische Kompetenz"
  - "Advanced Configurations" → "Strategische KI-Kompetenz" (o.ä.)
- Schritt 4 (Business Survey): Alle englischen Antwortoptionen auf Deutsch umstellen.
- Durchgängig professionelle, klare deutsche Sprache — kein Buzzword-Overload.

### 2.2 Barrieren/Hinderungsgründe erweitern

**Datei:** `MindsetStep.tsx`, Übersetzungsdateien

Neue Optionen hinzufügen:
- "Keine Zeit" / "Fehlende Zeit"
- "Berührungsängste / Unsicherheit wo anfangen"
- "Datenschutzbedenken (Unternehmen)"
- "Sicherheitsbedenken (IT-Security)"
- "Weiß nicht wo ich anfangen soll"
- Bestehende Optionen auf Deutsch prüfen und ggf. verbessern.
- **"Sonstiges"-Freitextfeld** hinzufügen.

### 2.3 Neuer Survey-Abschnitt: Wissensmanagement

**Neue Datei:** `src/components/survey/KnowledgeManagementStep.tsx`

Neuer Schritt zwischen Mindset und Feature Matrix (wird Schritt 5, Feature Matrix wird 6). Fragen:

1. **Aktualität:** "Wie gut bleiben Sie über aktuelle KI-Entwicklungen informiert?" (Skala 1-5)
2. **Filterung:** "Wie gut gelingt es Ihnen, relevante KI-Neuigkeiten von Hype zu unterscheiden?" (Skala 1-5)
3. **Einordnung:** "Können Sie neue KI-Entwicklungen für Ihre Arbeit und Ihr Unternehmen einordnen?" (Skala 1-5)
4. **Überforderung:** "Wie stark empfinden Sie die Nachrichtendichte rund um KI als Überforderung?" (Skala 1-5)
5. **Interner Wissenstransfer:** "Wie gut funktioniert der KI-Wissensaustausch in Ihrem Unternehmen?" (Skala 1-5)

→ Ergebnis fließt als "Wissensmanagement-Score" in die Auswertung ein.

### 2.4 Selbsteinschätzungsfragen spezifischer formulieren

**Dateien:** `SelfAssessmentStep.tsx`, Übersetzungsdateien

- Vorher-Fragen spezifischer:
  - Statt generisch "Wie schätzen Sie sich ein?" → z.B. "Wie sicher fühlen Sie sich im täglichen Umgang mit KI-Tools?"
  - "Wie viel Prozent Ihrer täglichen Aufgaben erledigen Sie bereits mit KI-Unterstützung?"
  - "Wie zuversichtlich sind Sie, dass Sie KI-Tools optimal nutzen?"
- Nachher-Fragen als Spiegel:
  - "Nach dieser Übersicht: Wie schätzen Sie Ihre KI-Kompetenz jetzt ein?"
  - "Wie viel Potenzial sehen Sie für KI-Einsatz in Ihrem Arbeitsalltag?"
- Vorher/Nachher-Logik beibehalten für Gap-Analyse.

### 2.5 Freitextfelder ergänzen

Überall wo "Sonstiges" als Option existiert oder sinnvoll ist:
- `CurrentUsageStep` → "Sonstiges"-Freitextfeld bei Tools
- `MindsetStep` → Freitextfeld bei Barrieren
- `ProfileStep` → Bei "Rolle: Sonstiges" ein Freitextfeld
- `FreeTextStep` → bleibt, aber Prompt-Text überarbeiten (spezifischer).

### 2.6 Survey-Reihenfolge & Validierung

**Datei:** `SurveyForm.tsx`

Neue Schritt-Reihenfolge (9 Schritte):
0. Track-Auswahl
1. Profil
2. Selbsteinschätzung (vorher)
3. Aktuelle Nutzung
4. Einstellung & Barrieren
5. **Wissensmanagement (NEU)**
6. Fähigkeiten-Matrix (mit Relevanz)
7. Selbsteinschätzung (nachher)
8. Freitext & Abschluss

**Validierung hinzufügen:**
- Mindestens Track-Auswahl required vor "Weiter"
- Profil: Mindestens Rolle und Unternehmensgröße required
- Feature Matrix: Mindestens 50% der Capabilities bewertet
- Aktuell kann man durch den gesamten Flow klicken ohne eine Eingabe → beheben.

---

## Phase 3: Scoring-Engine überarbeiten

### 3.1 Scoring-Logik anpassen

**Datei:** `src/lib/scoring.ts`

- Tier-basierte Gewichtung → Kategorie-basierte Gewichtung (gleiche Logik, neue Namen).
- **Job-Relevanz einbeziehen:** Capabilities die als "nicht relevant" markiert wurden, aus der Gewichtung herausnehmen (weder positiv noch negativ zählen). "Nicht sicher" wird normal gezählt.
- **Wissensmanagement-Score** als eigene Dimension ins ScoreResult aufnehmen.
- Timeline-Position beibehalten, aber Begriffe anpassen ("Frontier" → "Vorreiter").
- Gap-Analyse-Terminologie eindeutschen.

### 3.2 Opportunities-Logik verbessern

- Opportunities nach Relevanz filtern (nur Capabilities die als "relevant" oder "nicht sicher" markiert sind).
- Opportunities mit konkreten, geschäftsrelevanten Handlungsempfehlungen anreichern (je Capability ein Satz warum das wertvoll ist).

---

## Phase 4: UI & Visualisierung

### 4.1 Adaptionsprognose-Graph überarbeiten

**Datei:** `AdaptationProjection.tsx`

- Aktuell: Zwei Linien (current pace vs. improved) → verwirrend.
- **Neu:** Einfacherer Ansatz — Balkendiagramm oder Bereichsdiagramm das zeigt:
  - Branchenentwicklung (exponentielles Wachstum der KI-Möglichkeiten)
  - Persönliche Position heute
  - Projektion bei aktuellem Tempo vs. bei gezielter Weiterbildung
- "X Monate hinterher"-Anzeige optional machen oder in eine Textbox unter dem Graph verschieben statt im Graph selbst.

### 4.2 Ergebniskarten überarbeiten

**Dateien:** Alle `src/components/results/*.tsx`, `ResultsContent.tsx`

- **"Zeitliche Einordnung"** (ehem. Timeline Position): Mehr Kontext, z.B. Branchendurchschnitt als Vergleich, klare Markierungen was jede Era bedeutet.
- **"Team-Vergleich"** (ehem. Team Benchmarks): Nur anzeigen wenn Team-Daten vorliegen, sonst ausblenden.
- **ReadinessRadar** kritisch prüfen: Wenn Kategorien aufeinander aufbauen, ist ein Radar-Chart irreführend → ggf. durch gestaffeltes Balkendiagramm oder Fortschrittsleiste ersetzen.
- **Fragezeichen-Icons** (ℹ️) an allen Karten: Tooltip mit kurzer Erklärung was die Karte zeigt und wie die Werte zu interpretieren sind.

### 4.3 "Top-Chancen"-Sektion implementieren

**Datei:** `OpportunitiesList.tsx` erweitern

- Kompakte Karten-Übersicht mit klickbaren Elementen.
- Beim Klick: Expandierbare Detail-Ansicht mit:
  - Warum diese Chance relevant ist
  - Konkretes Praxisbeispiel
  - Geschätzter Aufwand (niedrig/mittel/hoch)
  - Erwarteter Nutzen
- Maximal Top 5 Chancen basierend auf Relevanz × Gap-Größe.

### 4.4 Fragezeichen-Hilfe-System

**Neue Komponente:** `src/components/ui/InfoTooltip.tsx`

- Wiederverwendbare Komponente: Fragezeichen-Icon das bei Hover/Click einen Tooltip mit Erklärung zeigt.
- Einsatzorte:
  - Alle Ergebniskarten (Kartenheader)
  - Feature Matrix (bei Fachbegriffen die nicht selbsterklärend sind)
  - Wissensmanagement-Fragen
  - Selbsteinschätzungs-Skalen
- Nutzt bestehende `tooltip.tsx` shadcn Komponente.

### 4.5 Button-Cursor Fix

**Datei:** `src/components/ui/button.tsx` und/oder `globals.css`

- `cursor: pointer` für alle interaktiven Button-Elemente sicherstellen.

### 4.6 Kategorie-Beschreibungen in Feature Matrix

**Datei:** `FeatureMatrixStep.tsx`

- Jede Kategorie-Sektion bekommt einen erklärenden Untertitel (aus `CATEGORY_CONFIG.description`).
- Visuell sauber: Kategoriename (fett), darunter Beschreibung (kleiner, grau), dann die Capabilities.
- Nicht überladen: Beschreibung nur 1-2 Zeilen, ggf. collapsible.

---

## Phase 5: Neue Seiten & Navigation

### 5.1 Buchungslink / CTA am Ende

**Datei:** `ResultsContent.tsx`, neue Komponente `BookingCTA.tsx`

- Nach den Ergebnissen prominent:
  - "Lassen Sie uns gemeinsam Ihre KI-Strategie entwickeln"
  - Button → Calendly-Link (als Prop/Env-Variable konfigurierbar)
  - Unterhalb des TeamCTA, aber über dem Footer.

### 5.2 Impressum & Datenschutz Seiten

**Neue Dateien:** `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`

- Platzhalter-Seiten mit Standard-Layout.
- Footer-Links bereits vorhanden → auf die neuen Routen verlinken.

### 5.3 Navigation verbessern

**Datei:** `src/app/layout.tsx`

- **Header:** "Teclead Ventures — AI Readiness Check" als klickbarer Link zur Landing Page (oben links).
- **Footer:** Link zu teclead-ventures.de (öffnet in neuem Tab).
- **Ergebnisseite:** Button "Zurück zur Startseite".

---

## Phase 6: Bugfixes & Polish

### 6.1 Schritt 7 wird übersprungen

**Datei:** `SurveyForm.tsx`

- Step-Logik debuggen: Warum wird Post-Assessment übersprungen?
- Vermutlich Off-by-one-Error bei Step-Index nach Einfügen/Entfernen von Steps.
- Gründlich testen nach Umstellung auf 9 Steps.

### 6.2 Zurück-Button speichert Zustand nicht

**Datei:** `SurveyForm.tsx`

- React Hook Form Werte müssen beim Zurücknavigieren erhalten bleiben.
- Problem: Möglicherweise wird das Form-Feld bei Step-Wechsel neu gemountet und Defaults überschrieben.
- Fix: `defaultValues` korrekt aus Form State laden, nicht aus Initialwerten.

### 6.3 Validierung: Weiter-Button ohne Eingabe

**Datei:** `SurveyForm.tsx`, Step-Components

- Pro Step Mindest-Validierung implementieren:
  - Step 0: Track muss gewählt sein
  - Step 1: Rolle + Unternehmensgröße required
  - Step 3: Mindestens 1 Tool oder Frequenz
  - Step 5: Mindestens 3 Capabilities bewertet
  - Andere Steps: Mindest-Eingaben definieren
- "Weiter"-Button disabled solange Validierung nicht bestanden.

### 6.4 Seiten-Reload / Versehentlich Zurück

- Service Worker oder `beforeunload`-Event um bei versehentlichem Seiten-Reload zu warnen.
- Survey-Zustand in `sessionStorage` persistieren, bei Reload wiederherstellen.

---

## Phase 7: i18n & finale Qualitätssicherung

### 7.1 Übersetzungen komplett überarbeiten

**Dateien:** `de.json`, `en.json`

- Alle neuen Keys für neue Fragen, Kategorien, Beschreibungen.
- Bestehende Übersetzungen auf professionelle Sprache prüfen.
- Englische Begriffe in deutschen Texten eliminieren.
- Konsistente Terminologie über alle Seiten hinweg.

### 7.2 Capabilities bilingual aktualisieren

**Dateien:** `dev-features.ts`, `business-features.ts`

- Alle `en`/`de` Texte aktualisieren für neue Kategoriestruktur.
- Beispiele (`examples`-Feld) auf Aktualität prüfen (Stand März 2026).

### 7.3 End-to-End Test (manuell)

- Kompletten Flow durchspielen: Landing → Survey (beide Tracks) → Ergebnisse
- Validierung testen
- Sprache umschalten testen
- Mobile Responsiveness prüfen
- Build (`npm run build`) ohne Fehler sicherstellen

---

## Implementierungsreihenfolge

Die Phasen bauen aufeinander auf:

1. **Phase 1** — Datenmodell (Fundament, alles andere hängt davon ab)
2. **Phase 2** — Survey-Inhalte (nutzt neues Datenmodell)
3. **Phase 3** — Scoring (nutzt neue Datenstrukturen)
4. **Phase 6** — Bugfixes (parallel möglich, teilweise vor UI-Arbeit)
5. **Phase 4** — UI/Visualisierung (nutzt neues Scoring)
6. **Phase 5** — Neue Seiten (unabhängig)
7. **Phase 7** — i18n & QA (zum Schluss, alles zusammen prüfen)

---

## Betroffene Dateien (Zusammenfassung)

| Bereich | Dateien |
|---------|---------|
| Datenmodell | `types.ts`, `dev-features.ts`, `business-features.ts`, `survey.ts`, `schema.sql` |
| Survey | `SurveyForm.tsx`, alle `*Step.tsx`, neuer `KnowledgeManagementStep.tsx` |
| Scoring | `scoring.ts` |
| Ergebnisse | Alle `results/*.tsx`, `ResultsContent.tsx` |
| UI | `button.tsx`, `globals.css`, neuer `InfoTooltip.tsx`, neuer `BookingCTA.tsx` |
| Seiten | `layout.tsx`, `page.tsx`, neue `impressum/`, `datenschutz/` |
| i18n | `de.json`, `en.json` |
| Config | `schema.sql`, ggf. Env-Variablen |

---

## Risiken & Anmerkungen

- **Breaking Change für bestehende Daten:** Die Umstellung von Tiers auf Kategorien und das neue Features-Format (mit Relevanz) ist nicht abwärtskompatibel. Bestehende Responses in Supabase können die neuen Ergebnisseiten nicht rendern. → Migrations-Strategie nötig oder Clean-Slate.
- **Umfang:** Die Survey sollte trotz neuer Fragen nicht zu lang werden. Wissensmanagement-Schritt kurz halten (5 Fragen à 1-5 Skala = schnell). Feature Matrix durch Relevanz-Zeile etwas länger → ggf. "Nicht relevant" als Default und nur explizit markieren wenn relevant.
- **Fachliche Korrektheit:** Alle KI-Capabilities und Beispiele müssen auf Stand März 2026 geprüft werden. Keine veralteten Tool-Namen oder Features.
