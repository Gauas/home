const privacySections = [
  {
    title: "Overview",
    paragraphs: ["Gauas (“Gauas”, “we”, “our”, or “us”) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect information when you visit gauas.com, contact us, or use our services."],
  },
  {
    title: "Information We Collect",
    paragraphs: ["We may collect:"],
    lists: [["Name", "Email address", "Company or organization name", "Project information", "Messages submitted through contact forms", "Other information voluntarily provided"]],
    listIntroduction: "Technical information may include:",
    secondaryList: ["IP address", "Browser type", "Device type", "Operating system", "Referring pages", "Pages visited", "Usage and performance data"],
  },
  {
    title: "How We Use Your Information",
    paragraphs: ["We may use information to:"],
    lists: [["Respond to inquiries", "Communicate about projects", "Provide and improve services", "Maintain security", "Understand website usage", "Diagnose technical issues", "Comply with legal obligations"]],
  },
  {
    title: "Cookies and Analytics",
    paragraphs: ["Gauas may use cookies for essential functionality, security, performance, and analytics.", "Where legally required, consent will be requested before using non-essential cookies."],
  },
  {
    title: "Third-Party Services",
    paragraphs: ["Gauas may use third-party providers for:"],
    lists: [["Hosting", "CDN and security", "Analytics", "Email delivery", "Infrastructure", "Error monitoring", "Customer communication"]],
  },
  { title: "Data Retention", paragraphs: ["Personal information is retained only as long as reasonably necessary for the purposes described in this policy or as required by law."] },
  { title: "International Data Transfers", paragraphs: ["Data may be processed in countries other than the visitor’s country of residence.", "Where required, appropriate safeguards are used in accordance with applicable law."] },
  {
    title: "Your Privacy Rights",
    paragraphs: ["Depending on your location, you may have rights to:"],
    lists: [["Access data", "Correct data", "Delete data", "Restrict processing", "Object to processing", "Withdraw consent", "Request data portability"]],
    email: "privacy@gauas.com",
  },
  { title: "Security", paragraphs: ["Gauas uses reasonable technical and organizational safeguards to protect information. However, no transmission or storage method is completely secure, and we cannot guarantee absolute security."] },
  { title: "Children’s Privacy", paragraphs: ["The website is not intended for children where legal consent requirements apply. We do not knowingly collect personal information from children in those circumstances."] },
  { title: "External Links", paragraphs: ["Our website may link to third-party websites. Those websites are governed by their own privacy practices, and Gauas is not responsible for their content or policies."] },
  { title: "Changes to This Policy", paragraphs: ["We may update this policy from time to time. When we do, the “Last updated” date on this page will be revised."] },
  { title: "Contact", paragraphs: ["Gauas", "https://gauas.com"], email: "privacy@gauas.com" },
];

const termsSections = [
  { title: "Acceptance of Terms", paragraphs: ["By accessing gauas.com or using Gauas services, you agree to these Terms of Service."] },
  {
    title: "About Gauas",
    paragraphs: ["Gauas may provide:"],
    lists: [["Website development", "Mobile application development", "Backend development", "Infrastructure and DevOps", "Cloud solutions", "AI integration", "Internal tools", "Product design", "Technical consulting", "Maintenance and support"]],
  },
  {
    title: "Website Use",
    paragraphs: ["You must not:"],
    lists: [["Attempt unauthorized access", "Disrupt the website", "Introduce malicious software", "Misuse protected content", "Use the website unlawfully"]],
  },
  {
    title: "Project Agreements",
    paragraphs: ["Project-specific terms may be defined in proposals, quotations, statements of work, or contracts. These documents may define:"],
    lists: [["Scope", "Price", "Timeline", "Deliverables", "Payment", "Support", "Intellectual property ownership"]],
    closingParagraphs: ["If a signed project agreement conflicts with these Terms, the signed agreement takes priority for that project."],
  },
  { title: "Intellectual Property", paragraphs: ["Unless otherwise agreed, Gauas branding, designs, graphics, text, software, documentation, and website content are protected by applicable intellectual property laws."] },
  {
    title: "Third-Party Services",
    paragraphs: ["Gauas may rely on:"],
    lists: [["Infrastructure providers", "Cloud platforms", "APIs", "Software libraries", "Hosting services"]],
    closingParagraphs: ["Gauas is not responsible for failures outside its reasonable control."],
  },
  { title: "Payments", paragraphs: ["Payment terms are defined in the applicable quotation, invoice, or project agreement."] },
  { title: "Availability", paragraphs: ["Gauas does not guarantee uninterrupted or error-free availability of the website or services."] },
  { title: "Disclaimer", paragraphs: ["The website and services are provided on an “as is” and “as available” basis to the maximum extent permitted by law."] },
  { title: "Limitation of Liability", paragraphs: ["To the maximum extent permitted by law, Gauas is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the website."] },
  {
    title: "Termination",
    paragraphs: ["Gauas may restrict access in cases involving:"],
    lists: [["Abuse", "Security risks", "Fraud", "Legal violations", "Breach of these Terms"]],
  },
  { title: "Governing Law", paragraphs: ["These Terms are governed by the laws of Vietnam, unless mandatory applicable law requires otherwise.", "Disputes should first be addressed through good-faith negotiation."] },
  { title: "International Users", paragraphs: ["Users accessing Gauas from outside Vietnam are responsible for applicable local laws.", "Mandatory consumer or data protection rights remain unaffected."] },
  { title: "Changes to These Terms", paragraphs: ["These Terms may be updated from time to time. The latest version will be published on this page."] },
  { title: "Contact", paragraphs: ["Gauas", "https://gauas.com"], email: "legal@gauas.com" },
];

const cookieSections = [
  { title: "What Are Cookies", paragraphs: ["Cookies are small files stored on a visitor’s device. They help websites remember information and support reliable, secure functionality."] },
  { title: "Essential Cookies", paragraphs: ["Essential cookies may be used for:"], lists: [["Website functionality", "Security", "Session management", "Infrastructure"]] },
  { title: "Analytics Cookies", paragraphs: ["Analytics cookies may be used to understand how visitors use gauas.com and how the website performs. This information helps us identify issues and improve the experience."] },
  { title: "Preference Cookies", paragraphs: ["Preference cookies may be used to remember visitor settings and choices where this functionality is available."] },
  { title: "Marketing Cookies", paragraphs: ["If Gauas uses advertising or marketing measurement in the future, this policy will be updated to explain those technologies.", "Where consent is legally required, non-essential cookies will only be enabled after consent has been provided."] },
  { title: "Third-Party Cookies", paragraphs: ["Hosting, analytics, infrastructure, or security providers may use their own cookies when providing services to Gauas. Their use of information is governed by their respective privacy policies."] },
  { title: "Managing Cookies", paragraphs: ["You can control or delete cookies through your browser settings and through Gauas cookie preference controls, where available. Disabling essential cookies may affect website functionality."] },
  { title: "Contact", paragraphs: ["For questions about this Cookie Policy, contact:"], email: "privacy@gauas.com" },
];

export const legalPolicies = {
  privacy: {
    title: "Privacy Policy",
    description: "We value your privacy. This policy explains how Gauas collects, uses, stores, and protects your information.",
    sections: privacySections,
    links: [{ label: "Terms of Service", path: "/terms" }, { label: "Cookie Policy", path: "/cookies" }],
  },
  terms: {
    title: "Terms of Service",
    description: "These Terms govern your use of gauas.com and services provided by Gauas.",
    sections: termsSections,
    links: [{ label: "Privacy Policy", path: "/privacy", previous: true }, { label: "Cookie Policy", path: "/cookies" }],
  },
  cookies: {
    title: "Cookie Policy",
    description: "This Cookie Policy explains how Gauas uses cookies and similar technologies on gauas.com.",
    sections: cookieSections,
    links: [{ label: "Terms of Service", path: "/terms", previous: true }, { label: "Privacy Policy", path: "/privacy" }],
  },
};

export function getSectionId(title) {
  return title.toLowerCase().replaceAll("’", "").replaceAll(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
