import { FeatureData } from '@/types/survey';

export const BUSINESS_FEATURES: FeatureData = {
  A: {
    name: { en: "AI Chat & Research", de: "KI-Chat & Recherche" },
    items: [
      { id: "A1", en: "ChatGPT (web or desktop app)", de: "ChatGPT (Web oder Desktop-App)" },
      { id: "A2", en: "Claude.ai (web or desktop app)", de: "Claude.ai (Web oder Desktop-App)" },
      { id: "A3", en: "Google Gemini", de: "Google Gemini" },
      { id: "A4", en: "Perplexity AI (AI-powered search)", de: "Perplexity AI (KI-gestützte Suche)" },
      { id: "A5", en: "Microsoft Copilot (Bing Chat / Windows integration)", de: "Microsoft Copilot (Bing Chat / Windows-Integration)" },
    ]
  },
  B: {
    name: { en: "Office & Productivity", de: "Office & Produktivität" },
    items: [
      { id: "B1", en: "Microsoft Copilot in Word (drafting, rewriting, summarizing)", de: "Microsoft Copilot in Word (Entwurf, Umschreiben, Zusammenfassen)" },
      { id: "B2", en: "Microsoft Copilot in Excel (formulas, analysis, charts)", de: "Microsoft Copilot in Excel (Formeln, Analyse, Diagramme)" },
      { id: "B3", en: "Microsoft Copilot in PowerPoint (slide generation)", de: "Microsoft Copilot in PowerPoint (Folienerstellung)" },
      { id: "B4", en: "Microsoft Copilot in Outlook (email drafting, summarizing threads)", de: "Microsoft Copilot in Outlook (E-Mail-Entwurf, Thread-Zusammenfassung)" },
      { id: "B5", en: "Microsoft Copilot in Teams (meeting summaries, action items)", de: "Microsoft Copilot in Teams (Meeting-Zusammenfassungen, Aufgaben)" },
      { id: "B6", en: "Google Workspace AI (Gemini in Docs, Sheets, Slides)", de: "Google Workspace AI (Gemini in Docs, Sheets, Slides)" },
      { id: "B7", en: "Notion AI (writing, summarizing, database queries)", de: "Notion AI (Schreiben, Zusammenfassen, Datenbank-Abfragen)" },
    ]
  },
  C: {
    name: { en: "Writing & Communication", de: "Schreiben & Kommunikation" },
    items: [
      { id: "C1", en: "AI email drafting and reply suggestions", de: "KI-E-Mail-Entwurf und Antwortvorschläge" },
      { id: "C2", en: "AI-powered translation (DeepL, Google Translate AI)", de: "KI-gestützte Übersetzung (DeepL, Google Translate)" },
      { id: "C3", en: "AI writing assistants (Grammarly, LanguageTool)", de: "KI-Schreibassistenten (Grammarly, LanguageTool)" },
      { id: "C4", en: "AI meeting transcription and summaries (Otter, Fireflies, tl;dv)", de: "KI-Meeting-Transkription und Zusammenfassungen (Otter, Fireflies, tl;dv)" },
      { id: "C5", en: "Slack AI (channel summaries, thread catch-up)", de: "Slack AI (Kanal-Zusammenfassungen, Thread-Zusammenfassung)" },
    ]
  },
  D: {
    name: { en: "Data & Analysis", de: "Daten & Analyse" },
    items: [
      { id: "D1", en: "AI data analysis from uploaded files (CSV, Excel → insights)", de: "KI-Datenanalyse aus hochgeladenen Dateien (CSV, Excel → Erkenntnisse)" },
      { id: "D2", en: "AI-generated charts and visualizations", de: "KI-generierte Diagramme und Visualisierungen" },
      { id: "D3", en: "Natural language database queries", de: "Datenbank-Abfragen in natürlicher Sprache" },
      { id: "D4", en: "AI-powered dashboards and reporting", de: "KI-gestützte Dashboards und Berichte" },
    ]
  },
  E: {
    name: { en: "Project & Product Management", de: "Projekt- & Produktmanagement" },
    items: [
      { id: "E1", en: "AI ticket/story writing (Jira, Linear, Notion)", de: "KI-Ticket/Story-Erstellung (Jira, Linear, Notion)" },
      { id: "E2", en: "AI sprint planning and estimation", de: "KI-Sprint-Planung und Schätzung" },
      { id: "E3", en: "AI-generated PRDs and specifications", de: "KI-generierte PRDs und Spezifikationen" },
      { id: "E4", en: "AI roadmap prioritization", de: "KI-Roadmap-Priorisierung" },
    ]
  },
  F: {
    name: { en: "Design & Creative", de: "Design & Kreativ" },
    items: [
      { id: "F1", en: "AI image generation (DALL-E, Midjourney, Stable Diffusion)", de: "KI-Bildgenerierung (DALL-E, Midjourney, Stable Diffusion)" },
      { id: "F2", en: "AI presentation design", de: "KI-Präsentationsdesign" },
      { id: "F3", en: "AI video creation or editing", de: "KI-Videoproduktion oder -Bearbeitung" },
      { id: "F4", en: "AI UI/UX design assistance (Figma AI, Galileo)", de: "KI UI/UX-Design-Unterstützung (Figma AI, Galileo)" },
    ]
  },
  G: {
    name: { en: "Workflow Automation", de: "Workflow-Automatisierung" },
    items: [
      { id: "G1", en: "AI-powered workflow automation (Zapier AI, Make AI)", de: "KI-gestützte Workflow-Automatisierung (Zapier AI, Make AI)" },
      { id: "G2", en: "AI chatbots / customer support automation", de: "KI-Chatbots / Kundensupport-Automatisierung" },
      { id: "G3", en: "AI document processing and extraction", de: "KI-Dokumentenverarbeitung und -Extraktion" },
      { id: "G4", en: "Custom AI agents for business processes", de: "Benutzerdefinierte KI-Agenten für Geschäftsprozesse" },
    ]
  },
  H: {
    name: { en: "Advanced AI Capabilities", de: "Erweiterte KI-Fähigkeiten" },
    items: [
      { id: "H1", en: "AI with file/document upload for analysis", de: "KI mit Datei-Upload für Analyse" },
      { id: "H2", en: "AI web browsing and research", de: "KI-Webrecherche" },
      { id: "H3", en: "AI artifacts (interactive apps built in conversation)", de: "KI-Artefakte (interaktive Apps aus Konversation)" },
      { id: "H4", en: "AI projects with persistent context", de: "KI-Projekte mit persistentem Kontext" },
      { id: "H5", en: "Computer Use (AI controlling your screen)", de: "Computer Use (KI steuert Ihren Bildschirm)" },
    ]
  }
};
