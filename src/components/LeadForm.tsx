"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/types/i18n";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/types/product";
import { submitLead } from "@/lib/leadForm";

type Status = "idle" | "submitting" | "success" | "error";
type ErrorCode = "name" | "phone" | "submitFailed" | "missingEndpoint" | "generic";

export default function LeadForm({
  locale,
  dict,
  source,
  products,
  defaultInterest,
}: {
  locale: Locale;
  dict: Dictionary;
  source: string;
  products: Product[];
  defaultInterest?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode>("generic");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const endpoint = process.env.NEXT_PUBLIC_LEAD_FORM_ENDPOINT;

    if (!endpoint) {
      setStatus("error");
      setErrorCode("missingEndpoint");
      return;
    }

    setStatus("submitting");
    try {
      await submitLead(endpoint, {
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        interest: String(formData.get("interest") ?? ""),
        note: String(formData.get("note") ?? ""),
        source,
        locale,
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      const code = err instanceof Error ? err.message : "generic";
      setErrorCode(code === "name" || code === "phone" || code === "submitFailed" ? code : "generic");
    }
  }

  if (status === "success") {
    return <p className="rounded-xl bg-gold/20 p-4 text-sm">{dict.leadForm.success}</p>;
  }

  const errorMessage = status === "error" ? dict.leadForm.errors[errorCode] : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder={dict.leadForm.fields.name}
          className="w-full rounded-full border border-black/10 px-4 py-3 text-sm"
        />
        <input
          name="phone"
          required
          placeholder={dict.leadForm.fields.phone}
          className="w-full rounded-full border border-black/10 px-4 py-3 text-sm"
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder={dict.leadForm.fields.email}
        className="w-full rounded-full border border-black/10 px-4 py-3 text-sm"
      />
      <select
        name="interest"
        defaultValue={defaultInterest ?? ""}
        className="w-full rounded-full border border-black/10 px-4 py-3 text-sm"
      >
        <option value="">{dict.leadForm.fields.interest}</option>
        {products.map((product) => (
          <option key={product.slug} value={product.slug}>
            {product.name[locale]}
          </option>
        ))}
        <option value="other">{dict.leadForm.fields.interestOther}</option>
      </select>
      <textarea
        name="note"
        placeholder={dict.leadForm.fields.note}
        className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
      />
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-ivory disabled:opacity-50"
      >
        {status === "submitting" ? dict.leadForm.submitting : dict.leadForm.submit}
      </button>
    </form>
  );
}
