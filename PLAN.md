# AI Readiness Checker — Verbesserungsplan

## Überblick

Umfassende Überarbeitung des AI Readiness Checkers: Sprache, Inhalte, Scoring, UI und Bugfixes. Zielgruppe: deutscher Mittelstand. Positionierung: Teclead Ventures als KI-Experten mit Prozessverständnis und Change-Management-Kompetenz.

> **Hinweis:** Die Landing Page (`src/app/page.tsx`) wird in diesem Plan **nicht** verändert — sie bleibt wie sie ist.

---

## Phase 1: Datenmodell & Kategorie-Struktur (Fundament)

### 1.1 Kategorie-Anzeigenamen aktualisieren

**Was sich ändert:** Nur die **Anzeigenamen** (Labels) der 5 Kategorien in der UI — sowohl Deutsch als auch Englisch. Die interne Code-Struktur (`tier`, `TIER_CONFIG`, etc.) bleibt unverändert.

**Betroffene Stellen:** `TIER_CONFIG` in `src/lib/features/types.ts` (die `en`/`de` Label-Felder), Übersetzungsdateien (`de.json`, `en.json`), `FreeTextStep.tsx` (zeigt Tier-Namen an).

**Neue Anzeigenamen:**

| Tier | Deutsch (neu) | Englisch (neu) | Bisher |
|------|--------------|----------------|--------|
| 1 | KI-Grundlagen & Verständnis | AI Fundamentals & Understanding | Table Stakes / Grundlagen |
| 2 | Grundlegendes Tooling | Basic Tooling | Productive Usage / Produktive Nutzung |
| 3 | Produktive Nutzung | Productive Usage | Integrated Workflows / Integrierte Workflows |
| 4 | Automatisierung & Workflows | Automation & Workflows | Advanced Configuration / Erweiterte Konfiguration |
| 5 | Strategische KI-Kompetenz | Strategic AI Competence | Frontier / Frontier |

- Jede Kategorie bekommt zusätzlich eine `description` (1-2 Sätze) die in der UI als erklärende Zeile unter dem Kategorienamen angezeigt wird (siehe 4.6).

**Developer-Track — Kategorie-Beschreibungen:**
1. **KI-Grundlagen & Verständnis** — Wie funktioniert KI? Was kann sie, was nicht? Grundlegendes Wissen.
2. **Grundlegendes Tooling** — Alltägliche KI-Werkzeuge im Entwickleralltag (Code Completion, Chat, Fehlerdiagnose).
3. **Produktive Nutzung** — Gezielte Nutzung für Code-Qualität, Tests, Reviews, Refactoring.
4. **Automatisierung & Workflows** — Automatisierte Pipelines, Multi-File-Editing, App-Generierung, CI/CD-Integration.
5. **Strategische KI-Kompetenz** — Kontext-Engineering, Prompt Libraries, Evaluation-Systeme, eigene Use Cases finden und umsetzen.

**Business-Track — Kategorie-Beschreibungen:**
1. **KI-Grundlagen & Verständnis** — Basiswissen: Wie funktioniert KI? Möglichkeiten und Grenzen.
2. **Grundlegendes Tooling** — Chat-Assistenten, Websuche, Schreibhilfe, Bildgenerierung.
3. **Produktive Nutzung** — Meeting-Transkription, Dokumentenerstellung, Präsentationen, Datenanalyse.
4. **Automatisierung & Workflows** — Content-Erstellungspipelines, automatisierte Berichte, Workflow-Automatisierung, Tool-Integrationen.
5. **Strategische KI-Kompetenz** — Eigene KI-Agenten, persistenter Kontext, strategische Use-Case-Identifikation, KI-gestütztes Prozessdesign.

### 1.2 Capabilities inhaltlich aktualisieren (Stand: März 2026)

**Alle Capabilities auf Aktualität prüfen und anpassen:**

- **"Advanced Configurations"** komplett überarbeiten: Datei-Uploads, persistenter Kontext sind 2026 Standardfunktionen → in niedrigere Kategorie verschieben oder ersetzen.
- **"Frontier"** neu definieren: Nicht "Hooks und Skills kennen", sondern: Kontext-Engineering, Management und Bewahrung von Kontext über Sessions hinweg, Aufbau eigener Prompt Libraries, Evaluation-Systeme für KI-Output-Qualität, systematisches Finden und Validieren eigener Use Cases.
- **Workflow-Beispiele** spezifischer: "Content-Erstellungspipelines", "automatisierte Code-Review-Pipelines", "KI-gestützte Incident-Response", "automatisierte Report-Generierung" statt generischer Beispiele.
- **Veraltetes entfernen/aktualisieren:** z.B. "KI in Tabellen" → "Automatisierung in Tabellen", Beispiele auf aktuellen Stand bringen.
- Alle `firstAvailable`-Daten auf Plausibilität prüfen.

### 1.3 Response Scale anpassen

**Datei:** `src/lib/features/types.ts`

Anzeigenamen und Beschreibungen der 4-Punkte-Skala aktualisieren:

| Wert | Deutsch (neu) | Englisch (neu) | Beschreibung DE | Bisher |
|------|--------------|----------------|-----------------|--------|
| 0 | Nicht bekannt | Not Aware | Kenne ich nicht | Unaware |
| 1 | Bekannt | Aware | Kenne ich, noch nicht ausprobiert | Aware |
| 2 | Ausprobiert | Tried | Mindestens einmal genutzt | Tried |
| 3 | Regelmäßig genutzt | Regularly Used | Teil meines Arbeitsalltags | Integrated |

### 1.4 Job-Relevanz-Dimension hinzufügen

**Betroffene Stellen:** `types.ts`, `survey.ts`, `FeatureItem.tsx`, `FeatureMatrixStep.tsx`, API-Route (`src/app/api/responses/route.ts` — Zod-Schema), `scoring.ts`, `OpportunitiesList.tsx`, `FeatureBreakdown.tsx`, Supabase Schema.

- Pro Capability eine zweite Bewertungszeile: **"Relevant für meinen Job?"** mit Optionen: Ja / Nein / Nicht sicher.
- **Kein Default** — der Nutzer muss aktiv wählen. Ohne Auswahl bleibt das Feld leer.
- `features`-Datenstruktur erweitern: `Record<string, { score: 0|1|2|3, relevant: 'yes'|'no'|'unsure' }>` statt `Record<string, 0|1|2|3>`.
- UI: Kompaktes 2-Zeilen-Layout pro Capability (Zeile 1: Nutzungsgrad, Zeile 2: Relevanz).

> **Breaking Change:** Dieses neue Format ist nicht abwärtskompatibel. → **Clean-Slate:** Bestehende Testdaten in Supabase vor Go-Live löschen.

### 1.5 Survey-Type-Definitionen aktualisieren

**Datei:** `src/types/survey.ts`

- `SurveyResponse` Interface anpassen für neue Felder:
  - `features` → neues Format mit Relevanz (siehe 1.4)
  - `knowledge_management` → neuer Abschnitt mit 5 Werten (siehe 2.3)
  - `barriers` → erweiterte Optionen + Freitextfeld
- Score-Labels Deutsch überarbeiten (kein "Frontier", kein "Pioneer")
- Supabase Schema (`supabase/schema.sql`) entsprechend anpassen.
- **API-Route** (`src/app/api/responses/route.ts`): Zod-Validierungsschema für das neue `features`-Format und `knowledge_management`-Felder aktualisieren.

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

**Scoring-Integration:** Der Wissensmanagement-Score wird als **eigene, separate Dimension** berechnet und angezeigt — er fließt **nicht** in den Gesamt-Readiness-Score ein. Begründung: Der Hauptscore misst "Wie gut nutzen Sie KI-Tools?" (praktische Fähigkeit), Wissensmanagement misst "Wie gut bleiben Sie informiert?" (Meta-Kompetenz). Das Vermischen würde beide Signale verwässern.

Darstellung auf der Ergebnisseite:
- Eigene Karte: "Wissensmanagement: X/100"
- Zusätzlicher Balken in der Kategorie-Übersicht (neben den 5 Hauptkategorien)
- Bei niedrigem Score: Gezielte Empfehlung (z.B. "Ein strukturierter Ansatz zum Filtern von KI-Neuigkeiten könnte Ihnen helfen")

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

**Validierung — "Weiter"-Button bleibt deaktiviert bis Mindestanforderung erfüllt:**

| Schritt | Pflichtfeld(er) | Begründung |
|---------|-----------------|------------|
| 0 — Track | Track muss gewählt sein | Bereits so implementiert (auto-advance) |
| 1 — Profil | Rolle + Unternehmensgröße | Minimum für sinnvolle Auswertung |
| 2 — Selbsteinschätzung (vorher) | Keine extra Pflicht | Schieberegler haben Startwerte, Nutzer sieht und bestätigt sie bewusst |
| 3 — Aktuelle Nutzung | Nutzungshäufigkeit gewählt | Kern-Datenpunkt für Kontext |
| 4 — Einstellung & Barrieren | Keine extra Pflicht | Offenheit hat Startwert, Barrieren sind optional |
| 5 — Wissensmanagement | Keine extra Pflicht | Alle 5 Skalen haben Startwert (Mitte) |
| 6 — Fähigkeiten-Matrix | Mind. **30%** der Capabilities bewertet | Balance zwischen Datenqualität und Nutzerfreundlichkeit (~15 bei Dev, ~9 bei Business) |
| 7 — Selbsteinschätzung (nachher) | Keine extra Pflicht | Wie Schritt 2 |
| 8 — Freitext | Keine Pflicht | Optional by Design |

---

## Phase 3: Scoring-Engine überarbeiten

### 3.1 Scoring-Logik anpassen

**Datei:** `src/lib/scoring.ts`

- Gewichtungslogik bleibt gleich (aufsteigende Gewichte pro Kategorie), nur Anzeigenamen ändern sich (siehe 1.1).
- **Job-Relevanz einbeziehen:**
  - Capabilities mit `relevant: 'no'` → komplett aus der Berechnung ausschließen (weder positiv noch negativ).
  - Capabilities mit `relevant: 'yes'` oder `'unsure'` → normal gewichten.
  - Capabilities ohne Relevanz-Angabe → normal gewichten (Fallback).
- **Sonderfall "Alles irrelevant":** Wenn ein Nutzer alle Capabilities einer Kategorie als "nicht relevant" markiert, wird diese Kategorie als "N/A" angezeigt und aus dem Gesamtscore ausgeschlossen. Wenn über alle Kategorien hinweg weniger als 5 Capabilities als relevant/unsicher übrig bleiben, kann kein sinnvoller Score berechnet werden → Hinweis anzeigen: "Bitte bewerten Sie mehr Fähigkeiten als relevant, um ein aussagekräftiges Ergebnis zu erhalten."
- **Wissensmanagement-Score** als eigene Dimension ins ScoreResult aufnehmen (Durchschnitt der 5 Fragen, normalisiert auf 0-100).
- Timeline-Begriffe anpassen ("Frontier" → "Vorreiter" in Labels).
- Gap-Analyse-Terminologie eindeutschen.

### 3.2 Opportunities-Logik verbessern

- Opportunities nach Relevanz filtern: Nur Capabilities die als `relevant: 'yes'` oder `'unsure'` markiert sind.
- Opportunities mit konkreten, geschäftsrelevanten Handlungsempfehlungen anreichern (je Capability ein Satz warum das wertvoll ist).

---

## Phase 4: UI & Visualisierung

### 4.1 Adaptionsprognose-Graph überarbeiten

**Datei:** `AdaptationProjection.tsx`

**Problem mit dem aktuellen Ansatz:** Die Y-Achse zeigt "Monate hinterher" — das wird aus dem Datum der neuesten integrierten Capability berechnet. Dadurch wirkt selbst ein 91%-Score wie "11 Monate Rückstand", was unverhältnismäßig dramatisch und verwirrend ist. Außerdem kann man "in der Zeit zurückfallen", was keinen intuitiven Sinn ergibt.

**Neuer Ansatz — Prozentbasierte Projektion:**
- Y-Achse: **"% der verfügbaren KI-Fähigkeiten genutzt"** (0–100%) statt "Monate hinterher"
- Drei Elemente im Diagramm:
  1. **Referenzlinie "Verfügbare KI-Fähigkeiten"** — steigt über Zeit (zeigt: das Feld wächst)
  2. **Rote gestrichelte Linie "Bei aktuellem Tempo"** — Projektion des Nutzers bei unverändertem Verhalten
  3. **Grüne Linie "Mit gezielter Weiterbildung"** — realistisches Verbesserungsszenario
- Datenpunkte: Heute → 6 Monate → 12 Monate
- Der visuelle Abstand zwischen persönlicher Linie und Referenzlinie zeigt die "Lücke" — intuitiv, ohne verwirrende Monatsangaben
- Unterhalb des Diagramms: Ein-Satz-Zusammenfassung (z.B. "Bei gezielter Weiterbildung könnten Sie in 12 Monaten X% mehr Fähigkeiten aktiv nutzen")

### 4.2 Ergebniskarten überarbeiten

**Dateien:** Alle `src/components/results/*.tsx`, `ResultsContent.tsx`, `src/components/team/*.tsx`

- **"Zeitliche Einordnung"** (ehem. Timeline Position): Mehr Kontext, z.B. Branchendurchschnitt als Vergleich, klare Markierungen was jede Era bedeutet.
- **"Team-Vergleich"** (ehem. Team Benchmarks): Nur anzeigen wenn Team-Daten vorliegen, sonst ausblenden.
- **Radar-Chart ersetzen** — überall (Einzelergebnis UND Team-Ansicht): Kategorien bauen aufeinander auf, daher ist ein Radar-Chart irreführend. Ersetzen durch **gestaffeltes Balkendiagramm** (horizontale Fortschrittsbalken pro Kategorie, von oben nach unten nach Komplexität sortiert). Betrifft: `RadarChart.tsx`, `CategoryHeatmap.tsx`, `ResultsContent.tsx`, `TeamOverview.tsx`.
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

- Jede Kategorie-Sektion bekommt einen erklärenden Untertitel (aus den in 1.1 definierten Beschreibungen).
- Visuell sauber: Kategoriename (fett), darunter Beschreibung (kleiner, grau), dann die Capabilities.
- Nicht überladen: Beschreibung nur 1-2 Zeilen, ggf. collapsible.

---

## Phase 5: Neue Seiten & Navigation

### 5.1 Buchungslink / CTA am Ende

**Datei:** `ResultsContent.tsx`, neue Komponente `BookingCTA.tsx`

- Nach den Ergebnissen prominent:
  - "Lassen Sie uns gemeinsam Ihre KI-Strategie entwickeln"
  - Button → Buchungs-Link (konfigurierbar über Umgebungsvariable `NEXT_PUBLIC_BOOKING_URL` — so bleibt es flexibel falls der Anbieter wechselt)
  - Unterhalb des TeamCTA, aber über dem Footer.

### 5.2 Impressum & Datenschutz Seiten

**Neue Dateien:** `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`

- Platzhalter-Seiten mit Standard-Layout.
- Footer-Links bereits vorhanden → auf die neuen Routen verlinken.

### 5.3 Navigation verbessern (konsistent auf allen Seiten)

**Datei:** `src/app/layout.tsx`

- **Header auf allen Seiten** (Landing, Survey, Ergebnis, Admin, Impressum, Datenschutz):
  - "Teclead Ventures — AI Readiness Check" als klickbarer Link zur Landing Page (oben links).
  - Während der Survey: minimaler Header (nur Logo/Name, keine weiteren Nav-Items) um nicht abzulenken.
- **Footer auf allen Seiten:** Link zu teclead-ventures.de (öffnet in neuem Tab).
- **Ergebnisseite:** Zusätzlich Button "Zurück zur Startseite" am Seitenende.

---

## Phase 6: Bugfixes & Polish

> **Wichtig:** Bugfixes 6.1 und 6.2 müssen **vor Phase 2** (neuer Wissensmanagement-Schritt) erledigt werden, weil das Einfügen eines neuen Schritts die Step-Indices verschiebt und bestehende Bugs maskieren oder verschlimmern könnte.

### 6.1 Post-Assessment-Schritt wird übersprungen

**Datei:** `SurveyForm.tsx`

- **Symptom:** Der Schritt "Selbsteinschätzung (nachher)" (aktuell Step 6) wird kurz angezeigt und dann automatisch übersprungen — der Nutzer landet direkt beim Freitext-Schritt.
- Mögliche Ursache: Animations-Timing (AnimatePresence), React-State-Problem, oder die extra `<div>`-Wrapper um den Post-Assessment-Schritt (die andere Steps nicht haben).
- Fix priorisieren und testen bevor neue Steps hinzugefügt werden.

### 6.2 Zurück-Button speichert Zustand nicht

**Datei:** `SurveyForm.tsx`

- React Hook Form Werte müssen beim Zurücknavigieren erhalten bleiben.
- Problem: Möglicherweise wird das Form-Feld bei Step-Wechsel neu gemountet und Defaults überschrieben.
- Fix: `defaultValues` korrekt aus Form State laden, nicht aus Initialwerten.

### 6.3 Validierung: Weiter-Button ohne Eingabe

**Datei:** `SurveyForm.tsx`, Step-Components

- Validierungsregeln wie in 2.6 definiert implementieren.
- "Weiter"-Button bleibt deaktiviert solange Pflichtfelder nicht ausgefüllt sind.

### 6.4 Seiten-Reload / Versehentlich Zurück

- Survey-Zustand bei jedem Schrittwechsel automatisch in `sessionStorage` speichern.
- Bei Seiten-Reload: Gespeicherten Zustand aus `sessionStorage` wiederherstellen und beim letzten Schritt fortfahren.
- Kein `beforeunload`-Dialog nötig (unzuverlässig auf mobilen Geräten).

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

- Alle `en`/`de` Texte aktualisieren für neue Kategorienamen.
- Beispiele (`examples`-Feld) auf Aktualität prüfen (Stand März 2026).

### 7.3 End-to-End Test (manuell)

- Kompletten Flow durchspielen: Landing → Survey (beide Tracks) → Ergebnisse
- Validierung testen (Weiter-Button deaktiviert ohne Pflichtfelder)
- Sprache umschalten testen
- Mobile Responsiveness prüfen
- Sonderfälle testen: Alles als "nicht relevant" markieren, minimale Eingaben, Zurück-Navigation
- Build (`npm run build`) ohne Fehler sicherstellen

---

## Implementierungsreihenfolge

Die Phasen bauen aufeinander auf. Bugfixes vor inhaltlichen Änderungen:

1. **Phase 6.1 + 6.2** — Bugfixes (Step-Skip und Zurück-Button) zuerst beheben
2. **Phase 1** — Datenmodell (Anzeigenamen, Response Scale, Relevanz-Feld, Type-Definitionen)
3. **Phase 2** — Survey-Inhalte (neue Fragen, Wissensmanagement, Freitextfelder)
4. **Phase 6.3 + 6.4** — Validierung und Session-Persistenz
5. **Phase 3** — Scoring (Relevanz-Logik, Wissensmanagement-Score)
6. **Phase 4** — UI/Visualisierung (Prozent-Projektion, Balkendiagramm statt Radar, Tooltips)
7. **Phase 5** — Neue Seiten & Navigation (Booking CTA, Impressum, Header/Footer)
8. **Phase 7** — i18n & QA (zum Schluss, alles zusammen prüfen)

---

## Betroffene Dateien (Zusammenfassung)

| Bereich | Dateien |
|---------|---------|
| Datenmodell | `types.ts`, `dev-features.ts`, `business-features.ts`, `survey.ts`, `schema.sql` |
| Survey | `SurveyForm.tsx`, alle `*Step.tsx`, neuer `KnowledgeManagementStep.tsx` |
| Scoring | `scoring.ts` |
| API | `src/app/api/responses/route.ts` (Zod-Schema) |
| Ergebnisse | Alle `results/*.tsx`, `ResultsContent.tsx` |
| Team | `CategoryHeatmap.tsx`, `TeamOverview.tsx`, `MemberTable.tsx` |
| UI | `button.tsx`, `globals.css`, neuer `InfoTooltip.tsx`, neuer `BookingCTA.tsx` |
| Seiten | `layout.tsx`, neue `impressum/`, `datenschutz/` |
| i18n | `de.json`, `en.json` |
| Config | `schema.sql`, Env-Variable `NEXT_PUBLIC_BOOKING_URL` |

---

## Risiken & Anmerkungen

- **Breaking Change für bestehende Daten:** Das neue Features-Format (mit Relevanz) ist nicht abwärtskompatibel. → **Clean-Slate:** Bestehende Testdaten in Supabase löschen bevor das neue Format live geht. Kein Migrationsskript nötig.
- **Umfang der Survey:** Die Survey sollte trotz neuer Fragen nicht zu lang werden. Wissensmanagement-Schritt ist kurz (5 Fragen à 1-5 Skala = schnell). Feature Matrix wird durch Relevanz-Zeile etwas länger — die Relevanz-Frage muss aktiv beantwortet werden (kein Default), was den Zeitaufwand leicht erhöht.
- **Fachliche Korrektheit:** Alle KI-Capabilities und Beispiele müssen auf Stand März 2026 geprüft werden. Keine veralteten Tool-Namen oder Features.
- **Radar-Chart Entfernung:** Der Radar-Chart wird überall durch Balkendiagramme ersetzt (Einzel- und Team-Ansicht). Das verändert die visuelle Identität der Ergebnisseite deutlich — sieht aber fachlich korrekter aus.
