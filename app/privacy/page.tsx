import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";

// Written for how the site actually works: no forms, no cookies, no analytics; enquiries happen on WhatsApp.
// If analytics, a contact form or cookies are added later, sections 2, 3 and 9 must be updated first.
// Have a UAE lawyer review before launch (PDPL: Federal Decree-Law No. 45 of 2021).
export const metadata: Metadata = {
  title: "Privacy policy | Cache & Carry",
  description: "How Cache & Carry collects, uses and protects personal data when you visit this website or work with us on WhatsApp.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "13 November 2026";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a web design studio in the United Arab Emirates. We build websites and Google
          listings for small businesses and look after them through monthly care plans.
        </p>
        <p>
          We are responsible for the personal data described in this policy. You can reach us on WhatsApp at {site.phone} about anything in it.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>
          <strong>When you visit this website.</strong> The site has no contact forms, no accounts, no advertising trackers and no analytics. It does not set
          cookies. Like every website, our hosting provider automatically records basic technical information when a page is requested (your IP address, browser
          type, the page visited and the time) to keep the site secure and working.
        </p>
        <p>
          <strong>When you use the price builder.</strong> Your choices are kept in the page address so the estimate survives a refresh or can be shared. The
          business name and area you type stay in your browser and are only sent to us if you choose to send the prepared WhatsApp message.
        </p>
        <p>
          <strong>When you message us on WhatsApp.</strong> We receive your phone number and WhatsApp profile name, and anything you choose to send: your name,
          business name and area, messages, photos, files and voice notes.
        </p>
        <p>
          <strong>When you become a client.</strong> We also hold the content you give us for your website (text, prices, opening hours, logos and photos),
          details needed to invoice you and keep payment records, and any account access you share so we can do the work, such as your domain, hosting or Google
          Business Profile. We do not receive or store your card details.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use it",
    body: (
      <>
        <p>We use personal data only to:</p>
        <ul>
          <li>reply to your enquiry and prepare a written quote;</li>
          <li>build, launch and maintain your website and Google listing;</li>
          <li>invoice you, keep accounting records and meet our legal and tax obligations;</li>
          <li>keep this website and our client accounts secure;</li>
          <li>show your finished website in our portfolio or publish your testimonial, only where you have agreed to this.</li>
        </ul>
        <p>We do not sell personal data, and we do not use it for advertising or send you marketing messages you have not asked for.</p>
      </>
    ),
  },
  {
    id: "legal-basis",
    title: "Our legal basis",
    body: (
      <p>
        We process personal data in line with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and other applicable law. We rely on
        what is needed to answer your request and to perform our agreement with you, on our legal obligations (for example, keeping financial records), and on
        your consent where we ask for it, such as showing your site in our portfolio. You can withdraw consent at any time.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We share personal data only with service providers who help us run the business, and only as far as each needs it:</p>
        <ul>
          <li>WhatsApp (Meta), which carries our conversations under its own privacy policy;</li>
          <li>our website hosting provider;</li>
          <li>providers we use to deliver your project, such as your domain registrar, hosting, Google (for your Business Profile) or Shopify;</li>
          <li>our bank or payment provider, and our accountant;</li>
          <li>public authorities, where the law requires it.</li>
        </ul>
        <p>Content you approve for your own website or Google listing is public once it is published.</p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Data stored outside the UAE",
    body: (
      <p>
        Some of these providers store data on servers outside the United Arab Emirates. Where that happens, we use established providers that apply recognised
        security and data protection safeguards, and we transfer only what is needed for the service.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Enquiries that do not lead to a project are deleted within 12 months of our last message.</li>
        <li>Client records, quotes and invoices are kept for as long as UAE commercial and tax law requires.</li>
        <li>Website content and account access are kept while we work for you. When our work ends, we hand everything over and delete our working copies within 90 days.</li>
        <li>Technical logs kept by our hosting provider are deleted on its standard schedule.</li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask us at any time to:</p>
        <ul>
          <li>tell you what personal data we hold about you and send you a copy;</li>
          <li>correct anything that is inaccurate or incomplete;</li>
          <li>delete your data, unless we must keep it by law;</li>
          <li>restrict or stop a particular use of your data, or withdraw your consent.</li>
        </ul>
        <p>
          Message us on WhatsApp at {site.phone}. We will reply within 30 days. If you are not satisfied with our answer, you may contact the UAE Data Office.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        We keep the data we hold to a minimum, protect our accounts with strong passwords and two-step sign-in, and give access to client accounts only to the
        people doing the work. No method of storing or sending data is completely secure, but we take reasonable care and will tell you promptly if a problem
        affects your data.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will update this policy if the way we handle data changes, for example if we add analytics to this website. The date at the top shows when it was last
        changed. If a change affects you as a client, we will tell you on WhatsApp.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      updated={UPDATED}
      intro={
        <p>
          This policy explains what personal data {site.name} collects when you visit this website or work with us, why we need it, who we share it with and the
          choices you have. We keep it short because we collect very little.
        </p>
      }
      sections={sections}
    />
  );
}
