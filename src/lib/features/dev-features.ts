import { FeatureData } from '@/types/survey';

export const DEV_FEATURES: FeatureData = {
  A: {
    name: { en: "Code Writing & Completion", de: "Code-Erstellung & Vervollständigung" },
    items: [
      { id: "A1", en: "Inline code completions (e.g. Copilot Tab, Cursor Tab)", de: "Inline Code-Vervollständigung (z.B. Copilot Tab, Cursor Tab)" },
      { id: "A2", en: "Multi-line / function-level code generation from comments", de: "Mehrzeilige / funktionsweite Code-Generierung aus Kommentaren" },
      { id: "A3", en: "Natural language → code in chat", de: "Natürliche Sprache → Code im Chat" },
      { id: "A4", en: "Multi-file edits from a single prompt (Cursor Composer, Claude Code)", de: "Multi-Datei-Bearbeitung aus einem Prompt (Cursor Composer, Claude Code)" },
      { id: "A5", en: "Full app generation from descriptions (Bolt, Lovable, Replit, v0)", de: "App-Generierung aus Beschreibungen (Bolt, Lovable, Replit, v0)" },
    ]
  },
  B: {
    name: { en: "Code Review & Quality", de: "Code-Review & Qualität" },
    items: [
      { id: "B1", en: "AI-powered PR review (Copilot Code Review, CodeRabbit)", de: "KI-gestützte PR-Reviews (Copilot Code Review, CodeRabbit)" },
      { id: "B2", en: "Automated test generation from code changes (Qodo, Copilot)", de: "Automatische Testgenerierung aus Code-Änderungen (Qodo, Copilot)" },
      { id: "B3", en: "AI security scanning in PRs", de: "KI-Sicherheitsscanning in PRs" },
      { id: "B4", en: "Codebase-aware review (full repo context, not just diff)", de: "Codebase-bewusstes Review (gesamter Repo-Kontext)" },
    ]
  },
  C: {
    name: { en: "Testing", de: "Testing" },
    items: [
      { id: "C1", en: "Unit test generation with edge cases", de: "Unit-Test-Generierung mit Randfällen" },
      { id: "C2", en: "E2E / integration test generation", de: "E2E / Integrationstest-Generierung" },
      { id: "C3", en: "Test coverage analysis by AI", de: "Testabdeckungsanalyse durch KI" },
      { id: "C4", en: "Test-driven development with AI", de: "Testgetriebene Entwicklung mit KI" },
    ]
  },
  D: {
    name: { en: "Debugging & Incident Response", de: "Debugging & Incident Response" },
    items: [
      { id: "D1", en: "AI-assisted error diagnosis (paste error → get fix)", de: "KI-gestützte Fehlerdiagnose (Fehler einfügen → Fix erhalten)" },
      { id: "D2", en: "Log analysis and root cause identification", de: "Log-Analyse und Ursachenermittlung" },
      { id: "D3", en: "AI-powered incident triage", de: "KI-gestützte Incident-Triage" },
      { id: "D4", en: "Parallel hypothesis debugging with multiple agents", de: "Paralleles Debugging mit mehreren Agenten" },
    ]
  },
  E: {
    name: { en: "Git & Workflow Automation", de: "Git & Workflow-Automatisierung" },
    items: [
      { id: "E1", en: "AI commit message generation", de: "KI-generierte Commit-Nachrichten" },
      { id: "E2", en: "Natural language git operations", de: "Git-Operationen in natürlicher Sprache" },
      { id: "E3", en: "AI-assisted merge conflict resolution", de: "KI-gestützte Merge-Konfliktlösung" },
      { id: "E4", en: "Git worktrees for parallel AI tasks", de: "Git-Worktrees für parallele KI-Aufgaben" },
      { id: "E5", en: "Checkpoint/undo system for AI changes", de: "Checkpoint/Undo-System für KI-Änderungen" },
    ]
  },
  F: {
    name: { en: "Documentation & Knowledge", de: "Dokumentation & Wissen" },
    items: [
      { id: "F1", en: "Auto-generated code documentation / docstrings", de: "Auto-generierte Code-Dokumentation" },
      { id: "F2", en: "Architecture documentation generation (ADRs)", de: "Architekturdokumentation-Generierung (ADRs)" },
      { id: "F3", en: "Codebase Q&A (ask questions about unfamiliar code)", de: "Codebase Q&A (Fragen an unbekannten Code)" },
      { id: "F4", en: "Onboarding guides from repo analysis", de: "Onboarding-Guides aus Repo-Analyse" },
    ]
  },
  G: {
    name: { en: "Refactoring & Architecture", de: "Refactoring & Architektur" },
    items: [
      { id: "G1", en: "AI-powered code refactoring", de: "KI-gestütztes Code-Refactoring" },
      { id: "G2", en: "Dependency impact analysis", de: "Abhängigkeits-Auswirkungsanalyse" },
      { id: "G3", en: "Architecture-level analysis and recommendations", de: "Architektur-Analyse und -Empfehlungen" },
      { id: "G4", en: "Migration / framework upgrade assistance", de: "Migrations- / Framework-Upgrade-Unterstützung" },
    ]
  },
  H: {
    name: { en: "Advanced / Agentic Features", de: "Erweiterte / Agentische Features" },
    items: [
      { id: "H1", en: "Custom instruction files (CLAUDE.md, .cursorrules)", de: "Benutzerdefinierte Instruktionsdateien (CLAUDE.md, .cursorrules)" },
      { id: "H2", en: "Custom slash commands / skills", de: "Benutzerdefinierte Slash-Commands / Skills" },
      { id: "H3", en: "MCP servers (AI connected to Slack, Notion, DBs)", de: "MCP-Server (KI verbunden mit Slack, Notion, DBs)" },
      { id: "H4", en: "Hooks / automation (pre/post AI events)", de: "Hooks / Automatisierung (vor/nach KI-Events)" },
      { id: "H5", en: "Agent teams (multiple AI agents coordinating)", de: "Agent-Teams (mehrere KI-Agenten koordinieren)" },
      { id: "H6", en: "Background/async agents (assign issue → get PR)", de: "Hintergrund-Agenten (Issue zuweisen → PR erhalten)" },
      { id: "H7", en: "AI memory / persistent context across sessions", de: "KI-Gedächtnis / persistenter Kontext über Sessions" },
      { id: "H8", en: "Computer Use (AI controlling browser/desktop)", de: "Computer Use (KI steuert Browser/Desktop)" },
    ]
  },
  I: {
    name: { en: "AI Applications", de: "KI-Anwendungen" },
    items: [
      { id: "I1", en: "Interactive AI artifacts (apps from conversation)", de: "Interaktive KI-Artefakte (Apps aus Konversation)" },
      { id: "I2", en: "AI projects/workspaces with persistent context", de: "KI-Projekte mit persistentem Kontext" },
      { id: "I3", en: "Local/on-premise models (Ollama) for privacy", de: "Lokale Modelle (Ollama) für Datenschutz" },
    ]
  },
  J: {
    name: { en: "DevOps & Infrastructure", de: "DevOps & Infrastruktur" },
    items: [
      { id: "J1", en: "AI-assisted CI/CD pipeline configuration", de: "KI-gestützte CI/CD-Pipeline-Konfiguration" },
      { id: "J2", en: "Infrastructure-as-code generation (Terraform)", de: "Infrastructure-as-Code-Generierung (Terraform)" },
      { id: "J3", en: "AI monitoring and alerting setup", de: "KI-Monitoring und Alerting-Einrichtung" },
      { id: "J4", en: "Container/deployment config generation", de: "Container/Deployment-Konfiguration" },
    ]
  }
};
