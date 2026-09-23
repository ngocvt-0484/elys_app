# ELYSIDERM / Eirlys' Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ELYSIDERM/Eirlys' marketing + product website as a fully static Next.js site, deployable to Cloudflare Pages, with a client-side lead form that writes to Google Sheets.

**Architecture:** Next.js App Router with `output: 'export'` (no server runtime). Product content lives in a static JSON file read by pure helper functions. Every route is pre-rendered at build time (`generateStaticParams` for the product detail route). The only "dynamic" behavior is a client component that posts lead form submissions directly to an external Google Apps Script Web App URL.

**Tech Stack:** Next.js 14 (App Router, static export), React 18, TypeScript, Tailwind CSS, Vitest (unit tests for pure logic only — UI is verified by build + manual dev-server check, not component tests).

**Spec:** `CLAUDE.md` (project root)

## Global Constraints

- Static export only: `next.config.mjs` sets `output: 'export'`. No Route Handlers, Middleware, ISR, or default Image Optimization (`images.unoptimized: true`, use plain `<img>` with explicit `width`/`height`).
- Single language: Vietnamese only. No i18n.
- No CMS, no database, no authentication.
- Colors: gold `#FFC871` (gradient `#C3A767 → #EDCA96 → #FFC871`), black `#000000`, ivory `#FBF6F2`. Ivory is the primary background; black is for text/contrast only, never large background areas.
- Fonts: Rosario for headings, Montserrat for body.
- Brand voice: avoid hype phrases ("trắng thần tốc", "trắng bật tone", "trắng cấp tốc"); prefer Brightening, Radiance, Healthy Glow, Skin Confidence, Skin Harmony.
- Lead capture: client-side `fetch` straight to a Google Apps Script Web App URL stored in `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` (build-time env var, no server-side proxy).
- Deploy target: Cloudflare Pages, build command `next build`, output directory `out`.
- Product data lives in `src/data/products.json`, edited directly — no admin UI (YAGNI).

---

### Task 1: Project scaffold (Next.js + TypeScript + Tailwind, static export)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx` (minimal placeholder — replaced fully in Task 4)
- Create: `src/app/page.tsx` (minimal placeholder — replaced fully in Task 6)

**Interfaces:**
- Produces: working `npm run dev` / `npm run build` pipeline that every later task builds on. Path alias `@/*` → `./src/*`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "elys-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.3",
    "tailwindcss": "^3.4.6",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: lockfile created, `node_modules/` populated, exit code 0.

- [ ] **Step 3: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create Tailwind + PostCSS config**

`postcss.config.mjs`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#FFC871",
          dark: "#C3A767",
          light: "#EDCA96",
        },
        ivory: "#FBF6F2",
        ink: "#000000",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-ivory text-ink font-body;
}

h1,
h2,
h3,
h4 {
  @apply font-heading;
}
```

- [ ] **Step 7: Create minimal `src/app/layout.tsx` and `src/app/page.tsx`**

`src/app/layout.tsx`:
```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:
```tsx
export default function HomePage() {
  return <p>ELYSIDERM</p>;
}
```

- [ ] **Step 8: Create `.eslintrc.json` and `.gitignore`**

`.eslintrc.json`:
```json
{
  "extends": "next/core-web-vitals"
}
```

`.gitignore`:
```
node_modules
.next
out
.env
.env.local
```

- [ ] **Step 9: Create `.env.example`**

```
NEXT_PUBLIC_LEAD_FORM_ENDPOINT=https://script.google.com/macros/s/REPLACE_ME/exec
```

- [ ] **Step 10: Verify build produces static export**

Run: `npm run build`
Expected: exit code 0, `out/index.html` exists.

- [ ] **Step 11: Commit**

```bash
git init
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts .eslintrc.json .gitignore .env.example src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "chore: scaffold Next.js static export project"
```

---

### Task 2: Design tokens — fonts wired into Tailwind

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx` (apply font variables to `<html>`)

**Interfaces:**
- Consumes: nothing external.
- Produces: `rosario`, `montserrat` exports from `@/lib/fonts` (each a `NextFont` with `.variable`), used by Task 4's full layout.

- [ ] **Step 1: Create `src/lib/fonts.ts`**

```ts
import { Rosario, Montserrat } from "next/font/google";

export const rosario = Rosario({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
```

- [ ] **Step 2: Apply font variables in `src/app/layout.tsx`**

```tsx
import "./globals.css";
import { rosario, montserrat } from "@/lib/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${rosario.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit code 0 (confirms Google Fonts fetch + Tailwind var wiring works).

- [ ] **Step 4: Commit**

```bash
git add src/lib/fonts.ts src/app/layout.tsx
git commit -m "feat: wire Rosario/Montserrat fonts into design tokens"
```

---

### Task 3: Product data layer (types, JSON data, pure helpers) — TDD

**Files:**
- Create: `src/types/product.ts`
- Create: `src/data/products.json`
- Create: `src/lib/products.ts`
- Create: `src/lib/products.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `Product` type; `getAllProducts(): Product[]`, `getFeaturedProducts(): Product[]`, `getProductBySlug(slug: string): Product | undefined`, `getRelatedProducts(slug: string, limit?: number): Product[]` from `@/lib/products`. Every later page task consumes these.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 2: Create `src/types/product.ts`**

```ts
export interface Product {
  slug: string;
  name: string;
  collection: string;
  price: number;
  shortDescription: string;
  description: string;
  ingredients: string[];
  images: string[];
  featured: boolean;
  usageSteps?: string[];
}
```

- [ ] **Step 3: Write the failing test `src/lib/products.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
} from "./products";

describe("products data layer", () => {
  it("returns all products", () => {
    expect(getAllProducts().length).toBeGreaterThan(0);
  });

  it("finds a product by slug", () => {
    const product = getProductBySlug("eirlys-alpha-melight-intensive-cream");
    expect(product?.name).toBe("Eirlys' Alpha-Melight™ Intensive Cream");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProductBySlug("khong-ton-tai")).toBeUndefined();
  });

  it("returns only featured products", () => {
    const featured = getFeaturedProducts();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("returns related products from the same collection, excluding itself", () => {
    const related = getRelatedProducts("eirlys-alpha-melight-intensive-cream");
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.collection === "Alpha-Melight")).toBe(true);
    expect(related.some((p) => p.slug === "eirlys-alpha-melight-intensive-cream")).toBe(false);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/lib/products.test.ts`
Expected: FAIL — `Cannot find module './products'`.

- [ ] **Step 5: Create `src/data/products.json`**

```json
[
  {
    "slug": "eirlys-crystal-tone-up-cream",
    "name": "Eirlys' Crystal Tone Up Cream",
    "collection": "Crystal Tone Up",
    "price": 590000,
    "shortDescription": "Kem dưỡng nâng tone tự nhiên, cấp ẩm tức thì cho làn da tươi sáng.",
    "description": "Eirlys' Crystal Tone Up Cream giúp hiệu chỉnh tông màu da tự nhiên, cấp ẩm sâu và tạo lớp nền mịn màng, sẵn sàng cho các bước trang điểm tiếp theo.",
    "ingredients": ["Niacinamide", "Hyaluronic Acid", "Pearl Extract"],
    "images": ["/images/products/crystal-tone-up-cream.jpg"],
    "featured": true
  },
  {
    "slug": "eirlys-crystal-tone-up-sunscreen",
    "name": "Eirlys' Crystal Tone Up Sunscreen SPF50+",
    "collection": "Crystal Tone Up",
    "price": 390000,
    "shortDescription": "Kem chống nắng nâng tone SPF50+ PA++++, bảo vệ da khỏi tia UV.",
    "description": "Kết cấu mỏng nhẹ, không bết dính, vừa bảo vệ da khỏi tác hại của tia UV vừa nâng tone tự nhiên, phù hợp dùng hằng ngày.",
    "ingredients": ["Zinc Oxide", "Niacinamide", "Centella Asiatica"],
    "images": ["/images/products/crystal-tone-up-sunscreen.jpg"],
    "featured": true
  },
  {
    "slug": "eirlys-glutathione-cream",
    "name": "Eirlys' Glutathione Cream",
    "collection": "Glutathione",
    "price": 650000,
    "shortDescription": "Kem dưỡng chuyên sâu hỗ trợ làn da sáng khoẻ, đều màu.",
    "description": "Công thức chứa Glutathione hỗ trợ quá trình chăm sóc da sáng khoẻ, đều màu và cải thiện sức sống làn da theo thời gian.",
    "ingredients": ["Glutathione", "Vitamin C Derivative", "Ceramide NP"],
    "images": ["/images/products/glutathione-cream.jpg"],
    "featured": false
  },
  {
    "slug": "eirlys-sunscreen-bao-ve",
    "name": "Eirlys' Sunscreen Bảo Vệ",
    "collection": "Sunscreen",
    "price": 350000,
    "shortDescription": "Kem chống nắng phổ rộng, bảo vệ da toàn diện mỗi ngày.",
    "description": "Màng lọc chống nắng phổ rộng UVA/UVB, kết cấu nhẹ tênh, thấm nhanh, phù hợp cho da nhạy cảm sử dụng hằng ngày.",
    "ingredients": ["Zinc Oxide", "Titanium Dioxide", "Panthenol"],
    "images": ["/images/products/sunscreen-bao-ve.jpg"],
    "featured": true
  },
  {
    "slug": "eirlys-daily-cleanser-3t-care",
    "name": "Eirlys' Daily Cleanser 3T Care",
    "collection": "Cleanser",
    "price": 320000,
    "shortDescription": "Sữa rửa mặt dịu nhẹ, làm sạch sâu mà không làm khô da.",
    "description": "Công thức pH cân bằng làm sạch bụi bẩn, bã nhờn và cặn trang điểm mà vẫn giữ được hàng rào bảo vệ da tự nhiên.",
    "ingredients": ["Amino Acid Surfactant", "Panthenol", "Centella Asiatica"],
    "images": ["/images/products/daily-cleanser-3t-care.jpg"],
    "featured": true
  },
  {
    "slug": "eirlys-alpha-melight-refining-serum",
    "name": "Eirlys' Alpha-Melight™ Refining Serum",
    "collection": "Alpha-Melight",
    "price": 450000,
    "shortDescription": "Serum tinh chất mở đầu liệu trình đánh tan làn da thiếu sức sống.",
    "description": "Bước đầu tiên trong liệu trình Alpha-Melight™, giúp làm dịu và chuẩn bị da trước khi hấp thụ dưỡng chất chuyên sâu ở bước tiếp theo.",
    "ingredients": ["Alpha-Arbutin", "Niacinamide", "Hyaluronic Acid"],
    "images": ["/images/products/alpha-melight-refining-serum.jpg"],
    "featured": false
  },
  {
    "slug": "eirlys-alpha-melight-intensive-cream",
    "name": "Eirlys' Alpha-Melight™ Intensive Cream",
    "collection": "Alpha-Melight",
    "price": 680000,
    "shortDescription": "Kem dưỡng chuyên sâu, hỗ trợ ức chế melanin tận gốc.",
    "description": "Trọng tâm của liệu trình Alpha-Melight™, kết hợp Alpha-Arbutin, Glutathione và Ceramide NP giúp làn da khoẻ mạnh, đều màu và rạng rỡ hơn theo thời gian.",
    "ingredients": ["Alpha-Arbutin", "Glutathione", "Ceramide NP", "Niacinamide"],
    "images": ["/images/products/alpha-melight-intensive-cream.jpg"],
    "featured": false
  }
]
```

- [ ] **Step 6: Create `src/lib/products.ts`**

```ts
import productsData from "@/data/products.json";
import type { Product } from "@/types/product";

const products = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.collection === current.collection)
    .slice(0, limit);
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/lib/products.test.ts`
Expected: PASS, 5 tests passing.

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts src/types/product.ts src/data/products.json src/lib/products.ts src/lib/products.test.ts
git commit -m "feat: add product data layer with tests"
```

---

### Task 4: Lead form logic + component — TDD

**Files:**
- Create: `src/lib/leadForm.ts`
- Create: `src/lib/leadForm.test.ts`
- Create: `src/components/LeadForm.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` env var (read inside the component, not the lib).
- Produces: `LeadFormData` type, `validateLeadForm(data): string | null`, `submitLead(endpoint, data): Promise<void>` from `@/lib/leadForm`; `<LeadForm source={string} productSlug?={string} />` component consumed by Tasks 6, 7, 8, 9.

- [ ] **Step 1: Write the failing tests `src/lib/leadForm.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateLeadForm, submitLead } from "./leadForm";

describe("validateLeadForm", () => {
  it("rejects empty name", () => {
    expect(validateLeadForm({ name: "", phone: "0901234567", source: "home" })).toMatch(/họ tên/);
  });

  it("rejects invalid phone", () => {
    expect(validateLeadForm({ name: "Lan", phone: "abc", source: "home" })).toMatch(/điện thoại/);
  });

  it("accepts valid data", () => {
    expect(validateLeadForm({ name: "Lan", phone: "0901234567", source: "home" })).toBeNull();
  });
});

describe("submitLead", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws on invalid data without calling fetch", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    await expect(
      submitLead("https://example.com/exec", { name: "", phone: "0901234567", source: "home" })
    ).rejects.toThrow(/họ tên/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response);
    await expect(
      submitLead("https://example.com/exec", { name: "Lan", phone: "0901234567", source: "home" })
    ).rejects.toThrow(/thất bại/);
  });

  it("resolves when the response is ok", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
    await expect(
      submitLead("https://example.com/exec", { name: "Lan", phone: "0901234567", source: "home" })
    ).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/leadForm.test.ts`
Expected: FAIL — `Cannot find module './leadForm'`.

- [ ] **Step 3: Create `src/lib/leadForm.ts`**

```ts
export interface LeadFormData {
  name: string;
  phone: string;
  productSlug?: string;
  note?: string;
  source: string;
}

export function validateLeadForm(data: LeadFormData): string | null {
  if (!data.name.trim()) return "Vui lòng nhập họ tên";
  if (!/^[0-9]{9,11}$/.test(data.phone.trim())) return "Số điện thoại không hợp lệ";
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

  if (!res.ok) throw new Error("Gửi thông tin thất bại, vui lòng thử lại");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/leadForm.test.ts`
Expected: PASS, 6 tests passing.

- [ ] **Step 5: Create `src/components/LeadForm.tsx`**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { submitLead } from "@/lib/leadForm";

type Status = "idle" | "submitting" | "success" | "error";

export default function LeadForm({
  source,
  productSlug,
}: {
  source: string;
  productSlug?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const endpoint = process.env.NEXT_PUBLIC_LEAD_FORM_ENDPOINT;

    if (!endpoint) {
      setStatus("error");
      setErrorMessage("Chưa cấu hình nơi nhận thông tin.");
      return;
    }

    setStatus("submitting");
    try {
      await submitLead(endpoint, {
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        note: String(formData.get("note") ?? ""),
        productSlug,
        source,
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-xl bg-gold/20 p-4 text-sm">
        Cảm ơn bạn! Đội ngũ ELYSIDERM sẽ liên hệ tư vấn trong thời gian sớm nhất.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        required
        placeholder="Họ và tên"
        className="w-full rounded-full border border-black/10 px-4 py-3 text-sm"
      />
      <input
        name="phone"
        required
        placeholder="Số điện thoại"
        className="w-full rounded-full border border-black/10 px-4 py-3 text-sm"
      />
      <textarea
        name="note"
        placeholder="Bạn cần tư vấn điều gì?"
        className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm"
      />
      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-ivory disabled:opacity-50"
      >
        {status === "submitting" ? "Đang gửi..." : "Gửi thông tin tư vấn"}
      </button>
    </form>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/leadForm.ts src/lib/leadForm.test.ts src/components/LeadForm.tsx
git commit -m "feat: add lead form logic and component with tests"
```

---

### Task 5: Root layout, Header, Footer, sitemap, robots

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `rosario`/`montserrat` from `@/lib/fonts` (Task 2); `getAllProducts` from `@/lib/products` (Task 3).
- Produces: every page from Task 6 onward renders inside this layout automatically (Header/Footer are not imported per-page).

- [ ] **Step 1: Create `src/components/Header.tsx`**

```tsx
import Link from "next/link";

const NAV_LINKS = [
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/lien-he", label: "Liên hệ" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-heading text-xl tracking-wide">
          ELYSIDERM
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-gold-dark">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/lien-he"
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-ivory hover:bg-gold-dark"
        >
          Tư vấn ngay
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/components/Footer.tsx`**

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg">ELYSIDERM</p>
          <p className="mt-2 text-sm text-black/70">
            Dược mỹ phẩm cao cấp lấy cảm hứng từ khoa học chăm sóc da Hàn Quốc.
          </p>
        </div>
        <div>
          <p className="font-medium">Liên hệ</p>
          <p className="mt-2 text-sm text-black/70">Hotline: 1900 0000</p>
          <p className="text-sm text-black/70">Email: hello@elysiderm.vn</p>
        </div>
        <div>
          <p className="font-medium">Khám phá</p>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            <li>
              <Link href="/san-pham">Sản phẩm</Link>
            </li>
            <li>
              <Link href="/ve-chung-toi">Về chúng tôi</Link>
            </li>
            <li>
              <Link href="/lien-he">Liên hệ</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-black/5 py-4 text-center text-xs text-black/50">
        © {new Date().getFullYear()} ELYSIDERM. All rights reserved.
      </p>
    </footer>
  );
}
```

Note for the human operator (not a plan placeholder — real business info to supply before launch): replace the hotline/email above with ELYSIDERM's real contact details.

- [ ] **Step 3: Replace `src/app/layout.tsx` with the full layout**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { rosario, montserrat } from "@/lib/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://elysiderm.vn"),
  title: {
    default: "ELYSIDERM | Eirlys' — Dược mỹ phẩm cao cấp chuẩn Hàn Quốc",
    template: "%s | ELYSIDERM",
  },
  description:
    "ELYSIDERM | Eirlys' mang đến giải pháp chăm sóc da khoẻ mạnh, sáng mịn và cân bằng dựa trên nền tảng khoa học da liễu Hàn Quốc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${rosario.variable} ${montserrat.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ELYSIDERM",
              url: "https://elysiderm.vn",
              description:
                "ELYSIDERM là thương hiệu dược mỹ phẩm cao cấp lấy cảm hứng từ khoa học chăm sóc da Hàn Quốc.",
            }),
          }}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";

const BASE_URL = "https://elysiderm.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/san-pham", "/ve-chung-toi", "/lien-he"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const productRoutes = getAllProducts().map((product) => ({
    url: `${BASE_URL}/san-pham/${product.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
```

- [ ] **Step 5: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://elysiderm.vn/sitemap.xml",
  };
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: exit code 0, `out/sitemap.xml` and `out/robots.txt` exist.

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.tsx src/components/Header.tsx src/components/Footer.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add root layout with header, footer, sitemap and robots"
```

---

### Task 6: Homepage

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/ProductCard.tsx`

**Interfaces:**
- Consumes: `getFeaturedProducts` from `@/lib/products` (Task 3); `LeadForm` from `@/components/LeadForm` (Task 4).
- Produces: `<ProductCard product={Product} />`, reused by Task 7 (listing page) and Task 8 (related products).

- [ ] **Step 1: Create `src/components/ProductCard.tsx`**

```tsx
import Link from "next/link";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white"
    >
      <img
        src={product.images[0]}
        alt={product.name}
        width={480}
        height={480}
        className="aspect-square w-full object-cover transition group-hover:scale-105"
      />
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-gold-dark">{product.collection}</p>
        <h3 className="mt-1 font-heading text-lg">{product.name}</h3>
        <p className="mt-2 text-sm text-black/70">{product.shortDescription}</p>
        <p className="mt-3 font-medium">{product.price.toLocaleString("vi-VN")}₫</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Replace `src/app/page.tsx` with the full homepage**

```tsx
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import { getFeaturedProducts } from "@/lib/products";

const STRENGTHS = [
  {
    title: "Tinh Tế Lành Tính",
    body: "Công thức dịu nhẹ, được kiểm nghiệm phù hợp với làn da nhạy cảm.",
  },
  {
    title: "Hiệu Quả Rõ Nét Theo Thời Gian",
    body: "Ưu tiên hiệu quả bền vững thay vì kết quả tức thời.",
  },
  {
    title: "Đồng Hành Chuyên Sâu",
    body: "Được phát triển trên nền tảng khoa học chăm sóc da Hàn Quốc.",
  },
];

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-heading text-4xl md:text-5xl">Vẻ đẹp tinh tế bắt đầu từ làn da khoẻ</h1>
        <p className="mx-auto mt-4 max-w-2xl text-black/70">
          ELYSIDERM mang đến giải pháp chăm sóc da khoẻ mạnh, sáng mịn và cân bằng, dựa trên nền
          tảng khoa học da liễu Hàn Quốc.
        </p>
        <Link
          href="/san-pham"
          className="mt-8 inline-block rounded-full bg-black px-8 py-3 text-sm font-medium text-ivory"
        >
          Khám phá sản phẩm
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">Chạm đến vẻ đẹp tự nhiên</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STRENGTHS.map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6 text-center">
              <h3 className="font-heading text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">Liệu thức sáng khoẻ tinh khôi</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section id="tu-van" className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">Sẵn sàng bắt đầu hành trình chăm sóc da?</h2>
        <p className="mt-3 text-center text-sm text-black/70">
          Để lại thông tin, đội ngũ ELYSIDERM sẽ tư vấn miễn phí cho bạn.
        </p>
        <div className="mt-8">
          <LeadForm source="homepage" />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 4: Start dev server and manually check homepage**

Run: `npm run dev`, open `http://localhost:3000`
Expected: hero, 3 strengths, featured product grid, and lead form render without console errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/ProductCard.tsx
git commit -m "feat: build homepage"
```

---

### Task 7: Product listing page

**Files:**
- Create: `src/app/san-pham/page.tsx`

**Interfaces:**
- Consumes: `getAllProducts` from `@/lib/products` (Task 3); `ProductCard` from `@/components/ProductCard` (Task 6).

- [ ] **Step 1: Create `src/app/san-pham/page.tsx`**

```tsx
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Khám phá toàn bộ sản phẩm chăm sóc da ELYSIDERM | Eirlys'.",
};

export default function ProductListPage() {
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-heading text-4xl">Sản phẩm</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit code 0, `out/san-pham/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add src/app/san-pham/page.tsx
git commit -m "feat: add product listing page"
```

---

### Task 8: Product detail page

**Files:**
- Create: `src/app/san-pham/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllProducts`, `getProductBySlug`, `getRelatedProducts` from `@/lib/products`; `ProductCard` from `@/components/ProductCard`; `LeadForm` from `@/components/LeadForm`.

- [ ] **Step 1: Create `src/app/san-pham/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/products";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images,
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product.slug);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <img
          src={product.images[0]}
          alt={product.name}
          width={600}
          height={600}
          className="w-full rounded-2xl object-cover"
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-gold-dark">{product.collection}</p>
          <h1 className="mt-2 font-heading text-3xl">{product.name}</h1>
          <p className="mt-4 text-black/70">{product.description}</p>
          <p className="mt-4 text-2xl font-medium">{product.price.toLocaleString("vi-VN")}₫</p>

          <div className="mt-6">
            <h2 className="font-medium">Thành phần chính</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient} className="rounded-full bg-gold/20 px-3 py-1 text-xs">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-heading text-lg">Mua ngay / Tư vấn ngay</h2>
            <div className="mt-4">
              <LeadForm source="product-detail" productSlug={product.slug} />
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">Sản phẩm cùng bộ sưu tập</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} />
            ))}
          </div>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            offers: {
              "@type": "Offer",
              priceCurrency: "VND",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </section>
  );
}
```

- [ ] **Step 2: Verify build pre-renders every product**

Run: `npm run build`
Expected: exit code 0, `out/san-pham/eirlys-alpha-melight-intensive-cream/index.html` (and one folder per product slug) exist.

- [ ] **Step 3: Manually check a detail page**

Run: `npm run dev`, open `http://localhost:3000/san-pham/eirlys-alpha-melight-intensive-cream`
Expected: gallery image, price, ingredients, lead form (with hidden productSlug wired), and related products from the same collection render without console errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/san-pham/[slug]/page.tsx
git commit -m "feat: add product detail page with JSON-LD"
```

---

### Task 9: About page and Contact page

**Files:**
- Create: `src/app/ve-chung-toi/page.tsx`
- Create: `src/app/lien-he/page.tsx`

**Interfaces:**
- Consumes: `LeadForm` from `@/components/LeadForm` (Task 4).

- [ ] **Step 1: Create `src/app/ve-chung-toi/page.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description: "Tầm nhìn, sứ mệnh và giá trị cốt lõi của ELYSIDERM | Eirlys'.",
};

const CORE_VALUES = [
  { title: "Science First", body: "Lấy khoa học làm nền tảng cho mọi giải pháp chăm sóc da." },
  { title: "Integrity in Quality", body: "Cam kết chất lượng, minh bạch và đáng tin cậy trong mọi sản phẩm." },
  { title: "Purposeful Innovation", body: "Đổi mới có định hướng để tạo ra giá trị thực và hiệu quả lâu dài." },
  { title: "Timeless Elegance", body: "Theo đuổi sự tinh tế trong thiết kế, trải nghiệm và triết lý thương hiệu." },
  { title: "Lasting Impact", body: "Kiến tạo những giá trị bền vững cho khách hàng, đối tác và cộng đồng." },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">Về ELYSIDERM</h1>
      <p className="mt-4 text-black/70">
        ELYSIDERM là thương hiệu dược mỹ phẩm cao cấp lấy cảm hứng từ khoa học chăm sóc da Hàn
        Quốc, mang đến các giải pháp nuôi dưỡng làn da khoẻ mạnh, sáng mịn và cân bằng một cách an
        toàn, bền vững.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl">Tầm nhìn</h2>
          <p className="mt-2 text-sm text-black/70">
            Trở thành thương hiệu chăm sóc da và làm đẹp được tin cậy trên toàn cầu, nâng tầm trải
            nghiệm chăm sóc da hằng ngày thông qua đổi mới khoa học, thẩm mỹ tinh tế và chất lượng.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-xl">Sứ mệnh</h2>
          <p className="mt-2 text-sm text-black/70">
            Kiến tạo những giải pháp chăm sóc da dựa trên nền tảng khoa học hiện đại, kết hợp công
            nghệ tiên tiến, nghiên cứu chuyên sâu và tiêu chuẩn chất lượng quốc tế.
          </p>
        </div>
      </div>

      <h2 className="mt-12 font-heading text-2xl">Giá trị cốt lõi</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {CORE_VALUES.map((value) => (
          <div key={value.title} className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="font-medium">{value.title}</h3>
            <p className="mt-2 text-sm text-black/70">{value.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/app/lien-he/page.tsx`**

```tsx
import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ với ELYSIDERM để được tư vấn chăm sóc da.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-4xl">Liên hệ</h1>
      <p className="mt-4 text-black/70">
        Để lại thông tin, đội ngũ ELYSIDERM sẽ liên hệ tư vấn cho bạn trong thời gian sớm nhất.
      </p>
      <p className="mt-2 text-sm text-black/70">Hotline: 1900 0000 · Email: hello@elysiderm.vn</p>
      <div className="mt-8">
        <LeadForm source="contact-page" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit code 0, `out/ve-chung-toi/index.html` and `out/lien-he/index.html` exist.

- [ ] **Step 4: Commit**

```bash
git add src/app/ve-chung-toi/page.tsx src/app/lien-he/page.tsx
git commit -m "feat: add about and contact pages"
```

---

### Task 10: Cloudflare Pages deployment docs

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing (documentation only).

- [ ] **Step 1: Create `README.md`**

```markdown
# ELYSIDERM / Eirlys' Website

Static marketing + product website for ELYSIDERM, built with Next.js (static export).

## Local development

\`\`\`bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_LEAD_FORM_ENDPOINT
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build   # outputs static files to out/
\`\`\`

## Deploy to Cloudflare Pages

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, create a Pages project connected to the GitHub repo.
3. Build settings:
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `next build`
   - Build output directory: `out`
4. Environment variables (Production and Preview): `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` set to the deployed Google Apps Script Web App URL.
5. Trigger a deploy — every push to the connected branch redeploys automatically.

## Lead form data

Every "Mua ngay" / "Tư vấn ngay" submission posts directly from the browser to the Google Apps
Script Web App URL above, which appends a row to a Google Sheet. See `src/lib/leadForm.ts` for the
payload shape.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Cloudflare Pages deployment instructions"
```
