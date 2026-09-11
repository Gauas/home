import { CONTACT_EMAIL } from "../../config/site";
import { getSectionId } from "./legalPolicies";

export function LegalSection({ section, index }) {
  const {
    title,
    paragraphs,
    lists,
    listIntroduction,
    secondaryList,
    closingParagraphs = [],
    email,
  } = section;
  return <section id={getSectionId(title)}><header><h2>{title}</h2><span>{String(index + 1).padStart(2, "0")}</span></header>
    {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {lists?.[0] && <ul>{lists[0].map((item) => <li key={item}>{item}</li>)}</ul>}
    {listIntroduction && <p>{listIntroduction}</p>}
    {secondaryList && <ul>{secondaryList.map((item) => <li key={item}>{item}</li>)}</ul>}
    {closingParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {email && <a className="privacy-email" href={`mailto:${email || CONTACT_EMAIL}`}>{email}</a>}
  </section>;
}
