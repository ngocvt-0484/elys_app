import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateLeadForm, submitLead } from "./leadForm";

describe("validateLeadForm", () => {
  it("flags an empty name", () => {
    expect(validateLeadForm({ name: "", phone: "0901234567" })).toBe("name");
  });

  it("flags an invalid phone", () => {
    expect(validateLeadForm({ name: "Lan", phone: "abc" })).toBe("phone");
  });

  it("passes valid data", () => {
    expect(validateLeadForm({ name: "Lan", phone: "0901234567" })).toBeNull();
  });
});

describe("submitLead", () => {
  const baseData = { name: "Lan", phone: "0901234567", source: "home", locale: "vi" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws 'name' without calling fetch when data is invalid", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    await expect(submitLead("https://example.com/exec", { ...baseData, name: "" })).rejects.toThrow("name");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws 'submitFailed' when the response is not ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response);
    await expect(submitLead("https://example.com/exec", baseData)).rejects.toThrow("submitFailed");
  });

  it("resolves when the response is ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    await expect(submitLead("https://example.com/exec", baseData)).resolves.toBeUndefined();
  });
});
