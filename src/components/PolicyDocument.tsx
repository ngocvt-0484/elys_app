import type { ReactNode } from "react";
import type { Locale, LocalizedText } from "@/types/i18n";
import { CheckCircleIcon } from "./icons";

type ListItem = string | { text: string; checks: string[] };

export type PolicyBlock =
  | { type: "h2" | "h3" | "p" | "part"; text: string }
  | { type: "list"; style: "alpha" | "disc"; items: ListItem[] }
  | { type: "step"; label: string; title: string; items: ListItem[] }
  | { type: "company" }
  | { type: "contact" };

export interface PolicyContent {
  company?: { name: LocalizedText; addressLabel: LocalizedText; address: LocalizedText };
  contact: { fanpage: string; hotline: string; email: string };
  blocks: Record<Locale, PolicyBlock[]>;
}

// Turns emails, URLs and the hotline number inside plain policy text into links.
function linkify(text: string, hotline: string): ReactNode[] {
  const escaped = hotline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(https?://[^\\s,;)]+|[\\w.+-]+@[\\w-]+\\.[\\w.]+\\w|${escaped})`, "g");
  return text.split(pattern).map((part, index) => {
    if (index % 2 === 0) return part;
    const href = part.includes("@")
      ? `mailto:${part}`
      : part.startsWith("http")
        ? part
        : `tel:${part.replace(/\D/g, "")}`;
    return (
      <a key={index} href={href} className="text-gold-dark underline underline-offset-2 hover:text-black">
        {part}
      </a>
    );
  });
}

export default function PolicyDocument({ content, locale }: { content: PolicyContent; locale: Locale }) {
  const { company, contact } = content;
  const link = (text: string) => linkify(text, contact.hotline);

  const renderItems = (items: ListItem[]) =>
    items.map((item, index) =>
      typeof item === "string" ? (
        <li key={index}>{link(item)}</li>
      ) : (
        <li key={index}>
          {link(item.text)}
          <ul className="mt-2 space-y-2">
            {item.checks.map((check, checkIndex) => (
              <li key={checkIndex} className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                <span>{link(check)}</span>
              </li>
            ))}
          </ul>
        </li>
      ),
    );

  const contactRows = [
    { label: "Fanpage", value: contact.fanpage.replace(/^https?:\/\/(www\.)?/, ""), href: contact.fanpage },
    { label: "Hotline", value: contact.hotline, href: `tel:${contact.hotline.replace(/\D/g, "")}` },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  ];

  return (
    <div className="mt-10 space-y-5 text-sm leading-relaxed text-black/75">
      {content.blocks[locale].map((block, index) => {
        switch (block.type) {
          case "part":
            return (
              <div key={index} className="!mt-20 border-t border-black/10 pt-12">
                <div className="mb-4 h-1 w-16 bg-gradient-to-r from-gold-dark via-gold-light to-gold" />
                <h2 className="font-heading text-3xl text-black">{block.text}</h2>
              </div>
            );
          case "h2":
            return (
              <h2 key={index} className="!mt-12 font-heading text-2xl text-black">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} className="!mt-8 text-base font-semibold text-black">
                {block.text}
              </h3>
            );
          case "p":
            return <p key={index}>{link(block.text)}</p>;
          case "list":
            return (
              <ol
                key={index}
                className={`space-y-2 pl-6 marker:text-gold-dark ${
                  block.style === "alpha" ? "list-[lower-alpha]" : "list-disc"
                }`}
              >
                {renderItems(block.items)}
              </ol>
            );
          case "step":
            return (
              <div key={index} className="flex gap-4 rounded-2xl border border-black/5 bg-white p-5 md:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold-light to-gold font-heading text-black">
                  {block.label.replace(/\D/g, "")}
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-gold-dark">{block.label}</p>
                  <h4 className="mt-1 font-heading text-lg text-black">{block.title}</h4>
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-gold-dark">{renderItems(block.items)}</ul>
                </div>
              </div>
            );
          case "company":
            if (!company) return null;
            return (
              <div key={index} className="rounded-2xl border border-black/5 bg-white p-5">
                <p className="font-heading text-lg text-black">{company.name[locale]}</p>
                <p className="mt-1">
                  <span className="text-black/50">{company.addressLabel[locale]}:</span> {company.address[locale]}
                </p>
              </div>
            );
          case "contact":
            return (
              <dl key={index} className="grid gap-3 sm:grid-cols-3">
                {contactRows.map((row) => (
                  <div key={row.label} className="rounded-xl border border-black/5 bg-white p-4">
                    <dt className="text-xs uppercase tracking-widest text-black/50">{row.label}</dt>
                    <dd className="mt-1 break-words font-medium text-black">
                      <a
                        href={row.href}
                        className="hover:text-gold-dark"
                        {...(row.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {row.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            );
        }
      })}
    </div>
  );
}
