import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzhinweis zur Online-Umfrage | Teclead Ventures',
  description: 'Datenschutzhinweis zur Online-Umfrage der Teclead Ventures GmbH',
};

const SECTIONS_DE = [
  {
    title: '1. Verantwortlicher',
    content: (
      <>
        <p>
          Teclead Ventures GmbH
          <br />
          Köpenicker Straße 126, Aufgang 1
          <br />
          10179 Berlin, Deutschland
        </p>
        <p>
          Geschäftsführer: Malte Herberg, Tony Schumacher
          <br />
          E-Mail:{' '}
          <a href="mailto:info@teclead-ventures.de" className="text-primary underline underline-offset-2 hover:text-primary/80">
            info@teclead-ventures.de
          </a>
        </p>
      </>
    ),
  },
  {
    title: '2. Datenschutzbeauftragter',
    content: (
      <p>
        Manuel Schierenberg
        <br />
        Köpenicker Straße 126, Aufgang 1
        <br />
        10179 Berlin, Deutschland
        <br />
        E-Mail:{' '}
        <a href="mailto:manuel.schierenberg@teclead-ventures.de" className="text-primary underline underline-offset-2 hover:text-primary/80">
          manuel.schierenberg@teclead-ventures.de
        </a>
      </p>
    ),
  },
  {
    title: '3. Zweck und Umfang der Datenverarbeitung',
    content: (
      <>
        <p>
          Im Rahmen dieser Online-Umfrage erheben wir die folgenden Daten zum Zweck der Marktforschung:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ihre Antworten auf die Umfragefragen</li>
          <li>Ihr Name (freiwillige Angabe)</li>
          <li>Technische Zugriffsdaten (IP-Adresse, Browsertyp, Zeitstempel)</li>
        </ul>
        <p>
          Die Angabe Ihres Namens ist ausdrücklich freiwillig und für die Teilnahme an der Umfrage nicht erforderlich. Sie können die Umfrage vollständig anonym ausfüllen.
        </p>
      </>
    ),
  },
  {
    title: '4. Rechtsgrundlage',
    content: (
      <p>
        Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage Ihrer Einwilligung gemäß Art.&nbsp;6 Abs.&nbsp;1 S.&nbsp;1 lit.&nbsp;a) DSGVO. Ihre Einwilligung erteilen Sie durch Bestätigung dieses Datenschutzhinweises vor Beginn der Umfrage. Die Einwilligung ist freiwillig und kann jederzeit mit Wirkung für die Zukunft widerrufen werden (siehe Abschnitt&nbsp;8).
      </p>
    ),
  },
  {
    title: '5. Empfänger und Auftragsverarbeitung',
    content: (
      <p>
        Die Umfrage wird auf einer Subdomain unserer Website gehostet. Die Daten werden auf Servern unseres Webhosting-Anbieters verarbeitet. Mit diesem besteht ein Auftragsverarbeitungsvertrag gemäß Art.&nbsp;28 DSGVO. Eine Weitergabe Ihrer Daten an sonstige Dritte erfolgt nicht.
      </p>
    ),
  },
  {
    title: '6. Datenübermittlung in Drittstaaten',
    content: (
      <p>
        Eine Übermittlung Ihrer personenbezogenen Daten in Drittstaaten außerhalb der EU/des EWR findet nicht statt. Sollte sich dies ändern, werden geeignete Garantien gemäß Art.&nbsp;44 ff. DSGVO sichergestellt (z.&nbsp;B. EU-Standardvertragsklauseln oder ein Angemessenheitsbeschluss der EU-Kommission).
      </p>
    ),
  },
  {
    title: '7. Speicherdauer',
    content: (
      <p>
        Ihre Umfragedaten werden nach Abschluss der Auswertung gelöscht, spätestens jedoch drei (3) Monate nach Erhebung. Sofern Sie Ihren Namen angegeben haben, wird dieser zusammen mit den übrigen Umfragedaten im selben Zeitraum gelöscht. Technische Zugriffsdaten (Server-Logfiles) werden nach spätestens 30 Tagen automatisch gelöscht.
      </p>
    ),
  },
  {
    title: '8. Ihre Rechte',
    content: (
      <>
        <p>Ihnen stehen folgende Rechte gegenüber dem Verantwortlichen zu:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Auskunft (Art.&nbsp;15 DSGVO):</strong> Sie können Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten verlangen.
          </li>
          <li>
            <strong>Berichtigung (Art.&nbsp;16 DSGVO):</strong> Sie können die Berichtigung unrichtiger Daten verlangen.
          </li>
          <li>
            <strong>Löschung (Art.&nbsp;17 DSGVO):</strong> Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </li>
          <li>
            <strong>Einschränkung (Art.&nbsp;18 DSGVO):</strong> Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen.
          </li>
          <li>
            <strong>Datenübertragbarkeit (Art.&nbsp;20 DSGVO):</strong> Sie können die Herausgabe Ihrer Daten in einem strukturierten, maschinenlesbaren Format verlangen.
          </li>
          <li>
            <strong>Widerruf der Einwilligung:</strong> Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.
          </li>
          <li>
            <strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig ist insbesondere die Berliner Beauftragte für Datenschutz und Informationsfreiheit.
          </li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
          <a href="mailto:info@teclead-ventures.de" className="text-primary underline underline-offset-2 hover:text-primary/80">
            info@teclead-ventures.de
          </a>
        </p>
      </>
    ),
  },
  {
    title: '9. Freiwilligkeit der Teilnahme',
    content: (
      <p>
        Die Teilnahme an dieser Umfrage ist vollständig freiwillig. Aus der Nichtteilnahme entstehen Ihnen keinerlei Nachteile.
      </p>
    ),
  },
  {
    title: '10. Allgemeine Datenschutzerklärung',
    content: (
      <p>
        Ergänzend gelten die Bestimmungen unserer allgemeinen Datenschutzerklärung unter:{' '}
        <a
          href="https://teclead-ventures.de/dataprotection"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          https://teclead-ventures.de/dataprotection
        </a>
      </p>
    ),
  },
];

const SECTIONS_EN = [
  {
    title: '1. Data Controller',
    content: (
      <>
        <p>
          Teclead Ventures GmbH
          <br />
          Köpenicker Straße 126, Aufgang 1
          <br />
          10179 Berlin, Germany
        </p>
        <p>
          Managing Directors: Malte Herberg, Tony Schumacher
          <br />
          Email:{' '}
          <a href="mailto:info@teclead-ventures.de" className="text-primary underline underline-offset-2 hover:text-primary/80">
            info@teclead-ventures.de
          </a>
        </p>
      </>
    ),
  },
  {
    title: '2. Data Protection Officer',
    content: (
      <p>
        Manuel Schierenberg
        <br />
        Köpenicker Straße 126, Aufgang 1
        <br />
        10179 Berlin, Germany
        <br />
        Email:{' '}
        <a href="mailto:manuel.schierenberg@teclead-ventures.de" className="text-primary underline underline-offset-2 hover:text-primary/80">
          manuel.schierenberg@teclead-ventures.de
        </a>
      </p>
    ),
  },
  {
    title: '3. Purpose and Scope of Data Processing',
    content: (
      <>
        <p>
          As part of this online survey, we collect the following data for market research purposes:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your responses to the survey questions</li>
          <li>Your name (optional)</li>
          <li>Technical access data (IP address, browser type, timestamp)</li>
        </ul>
        <p>
          Providing your name is expressly voluntary and not required to participate in the survey. You may complete the survey completely anonymously.
        </p>
      </>
    ),
  },
  {
    title: '4. Legal Basis',
    content: (
      <p>
        The processing of your personal data is based on your consent pursuant to Art.&nbsp;6(1)(a) GDPR. You give your consent by confirming this privacy notice before starting the survey. Consent is voluntary and can be revoked at any time with future effect (see Section&nbsp;8).
      </p>
    ),
  },
  {
    title: '5. Recipients and Data Processing',
    content: (
      <p>
        The survey is hosted on a subdomain of our website. Data is processed on the servers of our web hosting provider. A data processing agreement pursuant to Art.&nbsp;28 GDPR is in place. Your data will not be shared with any other third parties.
      </p>
    ),
  },
  {
    title: '6. Data Transfer to Third Countries',
    content: (
      <p>
        Your personal data will not be transferred to third countries outside the EU/EEA. Should this change, appropriate safeguards pursuant to Art.&nbsp;44 ff. GDPR will be ensured (e.g., EU Standard Contractual Clauses or an adequacy decision by the EU Commission).
      </p>
    ),
  },
  {
    title: '7. Retention Period',
    content: (
      <p>
        Your survey data will be deleted after the evaluation is complete, but no later than three (3) months after collection. If you provided your name, it will be deleted together with the remaining survey data within the same period. Technical access data (server log files) will be automatically deleted after a maximum of 30 days.
      </p>
    ),
  },
  {
    title: '8. Your Rights',
    content: (
      <>
        <p>You have the following rights with respect to the data controller:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Access (Art.&nbsp;15 GDPR):</strong> You may request information about your personal data stored by us.
          </li>
          <li>
            <strong>Rectification (Art.&nbsp;16 GDPR):</strong> You may request the correction of inaccurate data.
          </li>
          <li>
            <strong>Erasure (Art.&nbsp;17 GDPR):</strong> You may request the deletion of your data, provided no statutory retention obligations apply.
          </li>
          <li>
            <strong>Restriction (Art.&nbsp;18 GDPR):</strong> You may request the restriction of processing of your data.
          </li>
          <li>
            <strong>Data Portability (Art.&nbsp;20 GDPR):</strong> You may request your data in a structured, machine-readable format.
          </li>
          <li>
            <strong>Revocation of Consent:</strong> You may revoke your consent at any time with future effect. The lawfulness of processing carried out prior to revocation remains unaffected.
          </li>
          <li>
            <strong>Right to Complain:</strong> You have the right to lodge a complaint with a data protection supervisory authority. The competent authority is the Berlin Commissioner for Data Protection and Freedom of Information.
          </li>
        </ul>
        <p>
          To exercise your rights, please contact:{' '}
          <a href="mailto:info@teclead-ventures.de" className="text-primary underline underline-offset-2 hover:text-primary/80">
            info@teclead-ventures.de
          </a>
        </p>
      </>
    ),
  },
  {
    title: '9. Voluntary Participation',
    content: (
      <p>
        Participation in this survey is entirely voluntary. Non-participation will not result in any disadvantages for you.
      </p>
    ),
  },
  {
    title: '10. General Privacy Policy',
    content: (
      <p>
        In addition, the provisions of our general privacy policy apply:{' '}
        <a
          href="https://teclead-ventures.de/dataprotection"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          https://teclead-ventures.de/dataprotection
        </a>
      </p>
    ),
  },
];

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const isDE = locale === 'de';
  const sections = isDE ? SECTIONS_DE : SECTIONS_EN;
  const title = isDE
    ? 'Datenschutzhinweis zur Online-Umfrage'
    : 'Privacy Notice for the Online Survey';
  const subtitle = 'Teclead Ventures GmbH';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-lg text-muted-foreground mb-10">{subtitle}</p>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {section.title}
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
