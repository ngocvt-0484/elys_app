export interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  note?: string;
  source: string;
  locale: string;
}

export function validateLeadForm(data: Pick<LeadFormData, "name" | "phone">): "name" | "phone" | null {
  if (!data.name.trim()) return "name";
  if (!/^[0-9]{9,11}$/.test(data.phone.trim())) return "phone";
  return null;
}

export async function submitLead(endpoint: string, data: LeadFormData): Promise<void> {
  const error = validateLeadForm(data);
  if (error) throw new Error(error);

  // Google Apps Script Web Apps reject the CORS preflight triggered by
  // "application/json"; text/plain keeps this a simple request.
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("submitFailed");
}
