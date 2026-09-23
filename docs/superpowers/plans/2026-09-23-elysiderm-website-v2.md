# ELYSIDERM / Eirlys' Website Implementation Plan v2 (i18n + full design fidelity)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Supersedes:** `docs/superpowers/plans/2026-09-23-elysiderm-website.md`. That plan's Task 1
(scaffold: `package.json`, `next.config.mjs`, `tsconfig.json`, Tailwind/PostCSS config, `.gitignore`,
`.env.example`) is **already implemented and committed** (commit `8ffcdb7`) and is reused as-is.
Everything else in this plan replaces the old plan's Tasks 2–10, because the design was updated
(`design.png`, `detail.png`, `header.png` all changed) and scope grew to include full i18n
(vi/en/ko) and much richer product-detail content.

**Goal:** Build the ELYSIDERM/Eirlys' marketing + product website as a fully static, trilingual
(vi/en/ko) Next.js site, deployable to Cloudflare Pages, faithfully matching `design.png` /
`detail.png` / `header.png`, with a client-side lead form that writes to Google Sheets.

**Architecture:** Next.js App Router with `output: 'export'`. All content routes live under
`/[locale]/...` (`locale ∈ {vi, en, ko}`); the true root `/` is a client-side redirect only
(no Middleware, since static export doesn't run it). Product and bundle content are static JSON
with per-field `{ vi, en, ko }` localization. UI copy (nav, buttons, section headings...) comes
from hand-rolled dictionaries (`src/i18n/dictionaries/*.json`) — no next-intl dependency. The only
"dynamic" behavior is a client component posting lead form submissions directly to an external
Google Apps Script Web App URL. "Add to cart" / quantity / stock-count elements from the design are
implemented as static/decorative UI (see `CLAUDE.md` § "Hành vi thương mại điện tử trong thiết
kế") — there is no real cart or checkout.

**Tech Stack:** Next.js 14 (App Router, static export), React 18, TypeScript, Tailwind CSS, Vitest
(unit tests for pure logic: i18n dictionary lookup, locale helpers, product/bundle data layer, lead
form validation — UI correctness is verified by build + manual dev-server check, not component
tests).

**Spec:** `CLAUDE.md` (project root)

## Global Constraints

- Static export only: `next.config.mjs` already has `output: 'export'` and `images.unoptimized:
  true`. No Route Handlers, Middleware, or ISR. Use plain `<img>` with explicit `width`/`height`.
- **Run all Node/npm commands through WSL native Node**, not Windows Node on the UNC path — see
  `CLAUDE.md` § "Lệnh thường dùng". Every verification step below assumes this invocation style:
  `wsl.exe -- bash -lc 'source ~/.nvm/nvm.sh && cd /home/<user>/Projects/elys_app && <command>'`.
- 3 locales: `vi` (default), `en`, `ko`, all prefixed (`/vi/...`, `/en/...`, `/ko/...`). No
  unprefixed default locale (would need Middleware).
- Colors: gold `#FFC871` (gradient `#C3A767 → #EDCA96 → #FFC871`), black `#000000`, ivory
  `#FBF6F2`. Fonts: Rosario (heading), Montserrat (body), both with generic serif/sans-serif
  fallback in the Tailwind font stack (handles Hangul glyphs automatically — no per-locale JS).
- Brand voice: avoid hype phrases ("trắng thần tốc" etc.); prefer Brightening, Radiance, Healthy
  Glow, Skin Confidence, Skin Harmony (and EN/KO equivalents already drafted in the dictionaries).
- No CMS, no database, no authentication, no real shopping cart/checkout — see CLAUDE.md's
  e-commerce-affordances section.
- Lead capture: client-side `fetch` to `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` (Google Apps Script Web
  App), no server proxy.
- Deploy target: Cloudflare Pages, build command `next build`, output directory `out`.
- No account/login icon in the header (explicitly removed from the design).

---

### Task 1: i18n foundation — locale types, dictionaries, lookup helpers (TDD)

**Files:**
- Create: `src/types/i18n.ts`
- Create: `src/i18n/dictionaries/vi.json`
- Create: `src/i18n/dictionaries/en.json`
- Create: `src/i18n/dictionaries/ko.json`
- Create: `src/i18n/get-dictionary.ts`
- Create: `src/i18n/get-dictionary.test.ts`
- Create: `src/lib/locale.ts`
- Create: `src/lib/locale.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `LOCALES`, `DEFAULT_LOCALE`, `Locale` type from `@/types/i18n`; `getDictionary(locale):
  Dictionary` and `Dictionary` type from `@/i18n/get-dictionary`; `isLocale(value)`,
  `localizedPath(locale, path)`, `replaceLocaleInPath(pathname, nextLocale)` from `@/lib/locale`.
  Every later task (layout, header, footer, every page) consumes these.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 2: Create `src/types/i18n.ts`**

```ts
export const LOCALES = ["vi", "en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

export interface LocalizedText {
  vi: string;
  en: string;
  ko: string;
}
```

- [ ] **Step 3: Write the failing test `src/lib/locale.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { isLocale, localizedPath, replaceLocaleInPath } from "./locale";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ko")).toBe(true);
  });

  it("rejects unsupported locales", () => {
    expect(isLocale("fr")).toBe(false);
  });
});

describe("localizedPath", () => {
  it("builds the home path for a locale", () => {
    expect(localizedPath("vi", "/")).toBe("/vi");
  });

  it("prefixes a nested path with the locale", () => {
    expect(localizedPath("en", "/collections")).toBe("/en/collections");
  });

  it("adds a leading slash when missing", () => {
    expect(localizedPath("ko", "contact")).toBe("/ko/contact");
  });
});

describe("replaceLocaleInPath", () => {
  it("swaps the locale segment while keeping the rest of the path", () => {
    expect(replaceLocaleInPath("/vi/collections/eirlys-x", "en")).toBe("/en/collections/eirlys-x");
  });

  it("works for the locale root path", () => {
    expect(replaceLocaleInPath("/vi", "ko")).toBe("/ko");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/lib/locale.test.ts`
Expected: FAIL — `Cannot find module './locale'`.

- [ ] **Step 5: Create `src/lib/locale.ts`**

```ts
import { LOCALES, type Locale } from "@/types/i18n";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  segments[1] = nextLocale;
  return segments.join("/") || `/${nextLocale}`;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/lib/locale.test.ts`
Expected: PASS, 7 tests passing.

- [ ] **Step 7: Create the dictionary files**

`src/i18n/dictionaries/vi.json`:

```json
{
  "meta": {
    "siteName": "ELYSIDERM",
    "defaultTitle": "ELYSIDERM | Eirlys' — Dược mỹ phẩm cao cấp chuẩn Hàn Quốc",
    "defaultDescription": "ELYSIDERM | Eirlys' mang đến giải pháp chăm sóc da khoẻ mạnh, sáng mịn và cân bằng dựa trên nền tảng khoa học da liễu Hàn Quốc."
  },
  "header": { "subtitle": "VIỆT NAM", "ctaConsult": "Tư vấn ngay" },
  "nav": {
    "home": "Trang chủ",
    "about": "Về Elysiderm",
    "collections": "Bộ sưu tập",
    "technology": "Công nghệ & Thành phần",
    "why": "Vì sao chọn Elysiderm",
    "contact": "Liên hệ"
  },
  "footer": {
    "description": "Dược mỹ phẩm cao cấp lấy cảm hứng từ khoa học chăm sóc da Hàn Quốc.",
    "exploreTitle": "Khám phá",
    "policyTitle": "Chính sách & Hỗ trợ",
    "careTitle": "Trung tâm chăm sóc",
    "addressValue": "Tầng 18, Saigon Centre, 65 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    "hotlineLabel": "Hotline",
    "hotlineValue": "1800 8998",
    "emailLabel": "Email",
    "emailValue": "concierge@elysiderm.vn",
    "hoursValue": "Thứ 2 – Chủ nhật: 09:00 – 21:00",
    "privacy": "Chính sách bảo mật",
    "returns": "Chính sách đổi trả",
    "terms": "Quy định sử dụng",
    "copyright": "© {year} ELYSIDERM Việt Nam. Toàn bộ quyền thuộc về tập đoàn Elysiderm-Cosmetics Korea."
  },
  "home": {
    "hero": {
      "tag": "Chăm sóc da chuẩn Hàn Quốc",
      "titleLine1": "Vẻ đẹp tinh tế bắt đầu",
      "titleLine2Emphasis": "từ làn da khoẻ",
      "description": "Khám phá giải pháp chăm sóc da chuẩn Hàn Quốc cùng ELYSIDERM — nâng niu làn da mỗi ngày bằng những sản phẩm được lựa chọn kỹ lưỡng dành cho vẻ đẹp hiện đại, tự nhiên và thuần khiết.",
      "ctaPrimary": "Khám phá bộ sưu tập",
      "ctaSecondary": "Nhận tư vấn da miễn phí",
      "trustBadges": ["Chăm sóc da", "Tinh tế & Dịu nhẹ", "Khoa học hiện đại", "Made in Korea"]
    },
    "strengths": {
      "tag": "Đặc quyền dành riêng ELYSIDERM",
      "title": "Chạm đến vẻ đẹp tự nhiên nguyên bản",
      "description": "ELYSIDERM tin rằng vẻ đẹp đích thực khởi nguồn từ một làn da khoẻ mạnh, được nuôi dưỡng đúng cách và thấu hiểu tận gốc rễ.",
      "items": [
        { "title": "Tinh Tế & Lành Tính", "body": "Công thức dịu nhẹ với Glutathione, Ceramide NP và Panthenol, phù hợp cả làn da nhạy cảm." },
        { "title": "Hiệu Quả Rõ Nét Theo Thời Gian", "body": "Ưu tiên hiệu quả bền vững, nuôi dưỡng làn da khoẻ mạnh từ bên trong thay vì kết quả tức thời." },
        { "title": "Đồng Hành Tận Tâm", "body": "Đội ngũ tư vấn da liễu đồng hành cùng bạn trong suốt hành trình chăm sóc da." }
      ]
    },
    "products": {
      "tag": "Bộ sưu tập nổi bật",
      "title": "Liệu thức sáng khoẻ tinh khôi",
      "description": "Những sản phẩm chủ đạo được yêu thích nhất, chọn lọc từ hệ sinh thái Eirlys'.",
      "viewAll": "Xem tất cả sản phẩm"
    },
    "spotlight": {
      "tag": "Đột phá khoa học da",
      "title": "Chăm sóc da theo cách tinh tế hơn mỗi ngày",
      "description": "Sự hoà quyện giữa dưỡng chất tái tạo và công nghệ chống nắng giúp làn da luôn được nuôi dưỡng và bảo vệ trước tác động của môi trường, ngay cả khi bận rộn nhất.",
      "spfBadgeTitle": "SPF 50+",
      "spfBadgeDescription": "Bảo vệ phổ rộng, kết cấu mỏng nhẹ.",
      "cta": "Đăng ký nhận ưu đãi dành riêng cho bạn",
      "ingredients": [
        { "name": "Ceramide NP", "description": "Củng cố hàng rào bảo vệ da." },
        { "name": "Panthenol (B5)", "description": "Làm dịu và phục hồi tức thì." },
        { "name": "Niacinamide", "description": "Cải thiện đều màu da." },
        { "name": "Arbutin & Adenosine", "description": "Hỗ trợ sáng da và tái tạo." }
      ]
    },
    "why": {
      "title": "Vì sao phụ nữ tin chọn Elysiderm",
      "description": "Sự khác biệt đến từ chuẩn mực Hàn Quốc và sự thấu hiểu làn da người Việt.",
      "items": [
        { "title": "Phong Cách Hàn Quốc", "body": "Công thức phát triển theo tiêu chuẩn dermocosmetic Hàn Quốc." },
        { "title": "Thiết Kế Tinh Tế", "body": "Bao bì và trải nghiệm sử dụng tối giản, sang trọng." },
        { "title": "Dễ Dàng Sử Dụng", "body": "Quy trình chăm sóc da đơn giản, phù hợp nhịp sống hiện đại." },
        { "title": "Đồng Hành Chuyên Sâu", "body": "Tư vấn 1:1 cùng đội ngũ chuyên môn xuyên suốt hành trình." }
      ]
    },
    "ctaBanner": {
      "tag": "Trải nghiệm chăm sóc da",
      "title": "Khoảnh khắc dành riêng cho làn da của bạn",
      "description": "Mỗi bước chăm sóc da là một khoảng thời gian quý giá để bạn chậm lại, lắng nghe làn da và trân trọng chính mình theo cách riêng.",
      "button": "Bắt đầu quy trình ngay"
    },
    "testimonials": {
      "title": "Lời tâm sự từ phụ nữ hiện đại",
      "items": [
        { "quote": "Làn da mình sáng và đều màu rõ rệt sau vài tuần sử dụng. Kết cấu sản phẩm nhẹ, dễ chịu.", "name": "Phương Linh", "role": "Nhân viên văn phòng" },
        { "quote": "Chống nắng Crystal Tone Up rất hợp với da dầu của mình, không gây bí và nâng tone tự nhiên.", "name": "Thảo Nguyên", "role": "Chủ tiệm hoa" },
        { "quote": "Phần tư vấn rất tận tình, giúp mình chọn đúng sản phẩm phù hợp với làn da nhạy cảm.", "name": "Mai Anh", "role": "Giáo viên" }
      ]
    },
    "leadForm": {
      "title": "Sẵn sàng bắt đầu hành trình chăm sóc làn da?",
      "description": "Để lại thông tin để đội ngũ ELYSIDERM tư vấn miễn phí lộ trình phù hợp với làn da của bạn.",
      "bullets": ["Nhận tư vấn miễn phí trong 24h", "Ưu đãi độc quyền dành cho khách hàng mới", "Bảo mật thông tin cá nhân tuyệt đối"]
    }
  },
  "product": {
    "breadcrumbHome": "Trang chủ",
    "breadcrumbCollections": "Bộ sưu tập Eirlys'",
    "badges": { "best-seller": "Bán chạy nhất", "korean-patent-formula": "Công thức bằng sáng chế Hàn Quốc" },
    "labInfo": "ELYSIDERM Korea Derma-Lab · Sub-brand Eirlys'",
    "ratingLabel": "{rating} · {count} đánh giá xác thực",
    "soldLabel": "Đã bán {count}+ tại Việt Nam và Hàn Quốc",
    "krwReferenceLabel": "Giá niêm yết tại Hàn Quốc",
    "philosophyLabel": "Triết lý sản phẩm",
    "keyActivesLabel": "Hoạt chất đột phá được chứng minh",
    "stockLabel": "Còn lại {count} sản phẩm trong đợt hàng từ Seoul tháng này",
    "addToCart": "Thêm vào giỏ",
    "consultAndBuy": "Tư vấn & đặt mua ngay",
    "trust": [
      { "title": "Miễn phí giao hàng", "body": "Cho đơn hàng từ 500.000 VNĐ" },
      { "title": "100% Chính hãng", "body": "Nhập khẩu chính ngạch Seoul" },
      { "title": "Bác sĩ da liễu 1:1", "body": "Theo dõi lộ trình tận tình" }
    ],
    "routineTitle": "Liệu trình 3 bước đánh thức làn da thuỷ tinh",
    "routineDescription": "Bộ sản phẩm cộng hưởng tối đa theo chu trình khép kín: tinh chất tái tạo – kem dưỡng ẩm màng sinh học – kem chống nắng bảo vệ toàn diện.",
    "routineStepLabel": "Bước {n}",
    "routineSelected": "Đang chọn",
    "routineViewDetail": "Xem chi tiết",
    "bundleCta": "Mua combo chỉ",
    "tabs": { "technology": "Công nghệ & Thành phần", "usage": "Hướng dẫn sử dụng", "reviews": "Đánh giá thực tế" },
    "scienceFirstTitle": "Science First",
    "scienceFirstBody": "Lấy khoa học làm nền tảng cho mọi giải pháp chăm sóc da. Minh bạch từng % độ hoạt chất.",
    "inciLabel": "Bảng thành phần toàn diện (INCI)",
    "relatedTitle": "Sản phẩm trong cùng bộ sưu tập"
  },
  "leadForm": {
    "fields": {
      "name": "Họ và tên",
      "phone": "Số điện thoại",
      "email": "Email",
      "interest": "Sản phẩm quan tâm",
      "interestOther": "Khác / Chưa chắc chắn",
      "note": "Ghi chú (tuỳ chọn)"
    },
    "submit": "Gửi yêu cầu tư vấn ngay",
    "submitting": "Đang gửi...",
    "success": "Cảm ơn bạn! Đội ngũ ELYSIDERM sẽ liên hệ tư vấn trong thời gian sớm nhất.",
    "errors": {
      "name": "Vui lòng nhập họ tên",
      "phone": "Số điện thoại không hợp lệ",
      "generic": "Có lỗi xảy ra, vui lòng thử lại",
      "missingEndpoint": "Chưa cấu hình nơi nhận thông tin.",
      "submitFailed": "Gửi thông tin thất bại, vui lòng thử lại"
    }
  },
  "collections": { "title": "Bộ sưu tập", "description": "Khám phá toàn bộ sản phẩm chăm sóc da ELYSIDERM | Eirlys'." },
  "about": {
    "title": "Về Elysiderm",
    "intro": "ELYSIDERM là thương hiệu dược mỹ phẩm cao cấp lấy cảm hứng từ khoa học chăm sóc da Hàn Quốc, mang đến các giải pháp nuôi dưỡng làn da khoẻ mạnh, sáng mịn và cân bằng một cách an toàn, bền vững.",
    "visionTitle": "Tầm nhìn",
    "vision": "Trở thành thương hiệu chăm sóc da và làm đẹp được tin cậy trên toàn cầu, nâng tầm trải nghiệm chăm sóc da hằng ngày thông qua đổi mới khoa học, thẩm mỹ tinh tế và chất lượng.",
    "missionTitle": "Sứ mệnh",
    "mission": "Kiến tạo những giải pháp chăm sóc da dựa trên nền tảng khoa học hiện đại, kết hợp công nghệ tiên tiến, nghiên cứu chuyên sâu và tiêu chuẩn chất lượng quốc tế.",
    "valuesTitle": "Giá trị cốt lõi",
    "values": [
      { "title": "Science First", "body": "Lấy khoa học làm nền tảng cho mọi giải pháp chăm sóc da." },
      { "title": "Integrity in Quality", "body": "Cam kết chất lượng, minh bạch và đáng tin cậy trong mọi sản phẩm." },
      { "title": "Purposeful Innovation", "body": "Đổi mới có định hướng để tạo ra giá trị thực và hiệu quả lâu dài." },
      { "title": "Timeless Elegance", "body": "Theo đuổi sự tinh tế trong thiết kế, trải nghiệm và triết lý thương hiệu." },
      { "title": "Lasting Impact", "body": "Kiến tạo những giá trị bền vững cho khách hàng, đối tác và cộng đồng." }
    ]
  },
  "technology": {
    "title": "Công nghệ & Thành phần",
    "intro": "Mọi sản phẩm ELYSIDERM | Eirlys' đều bắt đầu từ nghiên cứu thành phần minh bạch và công nghệ bào chế hiện đại của Hàn Quốc.",
    "pillarsTitle": "Ba trụ cột công nghệ",
    "pillars": [
      { "title": "Nghiên cứu lâm sàng", "body": "Kiểm nghiệm da liễu độc lập trước khi thương mại hoá mọi công thức." },
      { "title": "Hoạt chất minh bạch", "body": "Công bố rõ tỷ lệ % của các hoạt chất chủ đạo trong từng sản phẩm." },
      { "title": "Công nghệ màng sinh học", "body": "Kết cấu tương thích sinh học giúp dưỡng chất thẩm thấu sâu mà không gây kích ứng." }
    ]
  },
  "why": {
    "title": "Vì sao chọn Elysiderm",
    "intro": "Không chạy theo xu hướng, ELYSIDERM lựa chọn đồng hành cùng khách hàng bằng những giải pháp khoa học đáng tin cậy.",
    "items": [
      { "title": "Phong Cách Hàn Quốc", "body": "Công thức phát triển theo tiêu chuẩn dermocosmetic Hàn Quốc." },
      { "title": "Thiết Kế Tinh Tế", "body": "Bao bì và trải nghiệm sử dụng tối giản, sang trọng." },
      { "title": "Dễ Dàng Sử Dụng", "body": "Quy trình chăm sóc da đơn giản, phù hợp nhịp sống hiện đại." },
      { "title": "Đồng Hành Chuyên Sâu", "body": "Tư vấn 1:1 cùng đội ngũ chuyên môn xuyên suốt hành trình." }
    ]
  },
  "contact": { "title": "Liên hệ", "description": "Để lại thông tin, đội ngũ ELYSIDERM sẽ liên hệ tư vấn cho bạn trong thời gian sớm nhất." },
  "policies": {
    "privacyTitle": "Chính sách bảo mật",
    "privacyBody": "ELYSIDERM cam kết bảo mật thông tin khách hàng, chỉ sử dụng dữ liệu liên hệ để tư vấn và chăm sóc khách hàng, không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.",
    "returnsTitle": "Chính sách đổi trả",
    "returnsBody": "Sản phẩm được đổi trả trong vòng 7 ngày nếu còn nguyên tem, chưa qua sử dụng và có hoá đơn mua hàng.",
    "termsTitle": "Quy định sử dụng",
    "termsBody": "Nội dung trên website thuộc quyền sở hữu của ELYSIDERM. Vui lòng liên hệ trước khi sao chép hoặc sử dụng cho mục đích thương mại."
  }
}
```

`src/i18n/dictionaries/en.json`:

```json
{
  "meta": {
    "siteName": "ELYSIDERM",
    "defaultTitle": "ELYSIDERM | Eirlys' — Premium K-Dermocosmetics",
    "defaultDescription": "ELYSIDERM | Eirlys' delivers healthy, radiant, balanced skin care grounded in Korean dermatological science."
  },
  "header": { "subtitle": "VIETNAM", "ctaConsult": "Consult Now" },
  "nav": {
    "home": "Home",
    "about": "About Elysiderm",
    "collections": "Collections",
    "technology": "Technology & Ingredients",
    "why": "Why Elysiderm",
    "contact": "Contact"
  },
  "footer": {
    "description": "Premium dermocosmetics inspired by Korean skin care science.",
    "exploreTitle": "Explore",
    "policyTitle": "Policies & Support",
    "careTitle": "Care Center",
    "addressValue": "18th Floor, Saigon Centre, 65 Le Loi, Ben Nghe, District 1, Ho Chi Minh City",
    "hotlineLabel": "Hotline",
    "hotlineValue": "1800 8998",
    "emailLabel": "Email",
    "emailValue": "concierge@elysiderm.vn",
    "hoursValue": "Mon – Sun: 09:00 – 21:00",
    "privacy": "Privacy Policy",
    "returns": "Return Policy",
    "terms": "Terms of Use",
    "copyright": "© {year} ELYSIDERM Vietnam. All rights belong to Elysiderm-Cosmetics Korea Group."
  },
  "home": {
    "hero": {
      "tag": "Korean-standard skin care",
      "titleLine1": "Refined beauty begins",
      "titleLine2Emphasis": "with healthy skin",
      "description": "Discover Korean-standard skin care with ELYSIDERM — nurturing your skin every day with carefully curated products for a modern, natural and pure beauty.",
      "ctaPrimary": "Explore Collections",
      "ctaSecondary": "Get a Free Skin Consultation",
      "trustBadges": ["Skin Care", "Refined & Gentle", "Modern Science", "Made in Korea"]
    },
    "strengths": {
      "tag": "Exclusively ELYSIDERM",
      "title": "Reveal Your Natural Radiance",
      "description": "ELYSIDERM believes true beauty starts from healthy skin, nurtured the right way and understood at its core.",
      "items": [
        { "title": "Refined & Gentle", "body": "Gentle formulas with Glutathione, Ceramide NP and Panthenol, suitable even for sensitive skin." },
        { "title": "Lasting, Visible Results", "body": "We prioritize sustainable results that nurture healthy skin from within, not instant fixes." },
        { "title": "Dedicated Guidance", "body": "Our dermatology consultants walk with you throughout your skin care journey." }
      ]
    },
    "products": {
      "tag": "Featured Collection",
      "title": "Pure, Radiant Skin Rituals",
      "description": "Our most loved signature products, curated from the Eirlys' ecosystem.",
      "viewAll": "View all products"
    },
    "spotlight": {
      "tag": "Skin Science Breakthrough",
      "title": "Skin care, refined for everyday life",
      "description": "A blend of regenerative nourishment and sun protection technology keeps skin nourished and protected against environmental stress, even on your busiest days.",
      "spfBadgeTitle": "SPF 50+",
      "spfBadgeDescription": "Broad-spectrum protection, feather-light texture.",
      "cta": "Sign up for offers made for you",
      "ingredients": [
        { "name": "Ceramide NP", "description": "Strengthens the skin barrier." },
        { "name": "Panthenol (B5)", "description": "Soothes and repairs instantly." },
        { "name": "Niacinamide", "description": "Improves skin tone evenness." },
        { "name": "Arbutin & Adenosine", "description": "Supports brightening and renewal." }
      ]
    },
    "why": {
      "title": "Why Women Trust Elysiderm",
      "description": "The difference comes from Korean standards paired with a deep understanding of Vietnamese skin.",
      "items": [
        { "title": "Korean Standard", "body": "Formulas developed to Korean dermocosmetic standards." },
        { "title": "Refined Design", "body": "Minimal, elevated packaging and product experience." },
        { "title": "Effortless to Use", "body": "A simple routine that fits modern, busy lifestyles." },
        { "title": "In-depth Guidance", "body": "1:1 consultation with our specialists throughout your journey." }
      ]
    },
    "ctaBanner": {
      "tag": "The Skin Care Experience",
      "title": "A Moment Made for Your Skin",
      "description": "Every skin care step is a precious moment to slow down, listen to your skin, and cherish yourself in your own way.",
      "button": "Start Your Routine Now"
    },
    "testimonials": {
      "title": "Notes From Modern Women",
      "items": [
        { "quote": "My skin became noticeably brighter and more even after a few weeks. The texture is light and comfortable.", "name": "Phuong Linh", "role": "Office Employee" },
        { "quote": "Crystal Tone Up sunscreen suits my oily skin perfectly — no clogging, and a natural tone-up finish.", "name": "Thao Nguyen", "role": "Flower Shop Owner" },
        { "quote": "The consultation was so attentive, helping me choose exactly what my sensitive skin needed.", "name": "Mai Anh", "role": "Teacher" }
      ]
    },
    "leadForm": {
      "title": "Ready to start your skin care journey?",
      "description": "Leave your details so the ELYSIDERM team can give you a free consultation tailored to your skin.",
      "bullets": ["Free consultation within 24h", "Exclusive offers for new customers", "Absolute privacy for your information"]
    }
  },
  "product": {
    "breadcrumbHome": "Home",
    "breadcrumbCollections": "Eirlys' Collections",
    "badges": { "best-seller": "Best Seller", "korean-patent-formula": "Korean Patent Formula" },
    "labInfo": "ELYSIDERM Korea Derma-Lab · Sub-brand Eirlys'",
    "ratingLabel": "{rating} · {count} verified reviews",
    "soldLabel": "{count}+ sold in Vietnam and Korea",
    "krwReferenceLabel": "Listed price in Korea",
    "philosophyLabel": "Product Philosophy",
    "keyActivesLabel": "Proven Breakthrough Actives",
    "stockLabel": "Only {count} left from this month's Seoul shipment",
    "addToCart": "Add to Cart",
    "consultAndBuy": "Consult & Buy Now",
    "trust": [
      { "title": "Free Shipping", "body": "For orders over 500,000 VND" },
      { "title": "100% Authentic", "body": "Officially imported from Seoul" },
      { "title": "1:1 Dermatologist", "body": "Dedicated routine follow-up" }
    ],
    "routineTitle": "3-Step Ritual for Glass Skin",
    "routineDescription": "A synergistic 3-step set: regenerating serum – biomimetic moisture cream – full-spectrum sun protection.",
    "routineStepLabel": "Step {n}",
    "routineSelected": "Selected",
    "routineViewDetail": "View details",
    "bundleCta": "Get the bundle for only",
    "tabs": { "technology": "Technology & Ingredients", "usage": "How to Use", "reviews": "Real Reviews" },
    "scienceFirstTitle": "Science First",
    "scienceFirstBody": "Science is the foundation of every skin care solution — transparent down to the exact percentage of every active.",
    "inciLabel": "Full Ingredient List (INCI)",
    "relatedTitle": "More From This Collection"
  },
  "leadForm": {
    "fields": {
      "name": "Full name",
      "phone": "Phone number",
      "email": "Email",
      "interest": "Product of interest",
      "interestOther": "Other / Not sure yet",
      "note": "Note (optional)"
    },
    "submit": "Send Consultation Request",
    "submitting": "Sending...",
    "success": "Thank you! The ELYSIDERM team will reach out to you shortly.",
    "errors": {
      "name": "Please enter your name",
      "phone": "Invalid phone number",
      "generic": "Something went wrong, please try again",
      "missingEndpoint": "Submission endpoint is not configured.",
      "submitFailed": "Submission failed, please try again"
    }
  },
  "collections": { "title": "Collections", "description": "Explore the full ELYSIDERM | Eirlys' skin care range." },
  "about": {
    "title": "About Elysiderm",
    "intro": "ELYSIDERM is a premium dermocosmetics brand inspired by Korean skin care science, delivering solutions that nurture healthy, radiant, balanced skin safely and sustainably.",
    "visionTitle": "Vision",
    "vision": "To become a globally trusted skin care and beauty brand, elevating everyday skin care through scientific innovation, refined aesthetics and quality.",
    "missionTitle": "Mission",
    "mission": "To create skin care solutions grounded in modern science, combining advanced technology, in-depth research and international quality standards.",
    "valuesTitle": "Core Values",
    "values": [
      { "title": "Science First", "body": "Science is the foundation of every skin care solution." },
      { "title": "Integrity in Quality", "body": "Committed to quality, transparency and trust in every product." },
      { "title": "Purposeful Innovation", "body": "Innovating with intent to create real, lasting value." },
      { "title": "Timeless Elegance", "body": "Pursuing refinement in design, experience and brand philosophy." },
      { "title": "Lasting Impact", "body": "Building sustainable value for customers, partners and community." }
    ]
  },
  "technology": {
    "title": "Technology & Ingredients",
    "intro": "Every ELYSIDERM | Eirlys' product starts with transparent ingredient research and modern Korean formulation technology.",
    "pillarsTitle": "Three Technology Pillars",
    "pillars": [
      { "title": "Clinical Research", "body": "Independent dermatological testing before any formula goes to market." },
      { "title": "Transparent Actives", "body": "We disclose the exact percentage of key actives in every product." },
      { "title": "Biomimetic Technology", "body": "Biocompatible textures that let nutrients absorb deeply without irritation." }
    ]
  },
  "why": {
    "title": "Why Choose Elysiderm",
    "intro": "Rather than chasing trends, ELYSIDERM stands with our customers through reliable, science-backed solutions.",
    "items": [
      { "title": "Korean Standard", "body": "Formulas developed to Korean dermocosmetic standards." },
      { "title": "Refined Design", "body": "Minimal, elevated packaging and product experience." },
      { "title": "Effortless to Use", "body": "A simple routine that fits modern, busy lifestyles." },
      { "title": "In-depth Guidance", "body": "1:1 consultation with our specialists throughout your journey." }
    ]
  },
  "contact": { "title": "Contact", "description": "Leave your details and the ELYSIDERM team will reach out to you shortly." },
  "policies": {
    "privacyTitle": "Privacy Policy",
    "privacyBody": "ELYSIDERM is committed to protecting customer data, using contact information only for consultation and customer care, and never sharing it with third parties without consent.",
    "returnsTitle": "Return Policy",
    "returnsBody": "Products may be returned within 7 days if the seal is intact, unused, and accompanied by a proof of purchase.",
    "termsTitle": "Terms of Use",
    "termsBody": "All content on this website is owned by ELYSIDERM. Please contact us before copying or using it for commercial purposes."
  }
}
```

`src/i18n/dictionaries/ko.json`:

```json
{
  "meta": {
    "siteName": "ELYSIDERM",
    "defaultTitle": "ELYSIDERM | Eirlys' — 프리미엄 한국 더모코스메틱",
    "defaultDescription": "ELYSIDERM | Eirlys'는 한국 피부과학을 기반으로 건강하고 빛나는 균형 잡힌 피부를 위한 솔루션을 제공합니다."
  },
  "header": { "subtitle": "베트남", "ctaConsult": "지금 상담하기" },
  "nav": {
    "home": "홈",
    "about": "엘리시더미 소개",
    "collections": "컬렉션",
    "technology": "기술 & 성분",
    "why": "엘리시더미를 선택하는 이유",
    "contact": "문의하기"
  },
  "footer": {
    "description": "한국 피부과학에서 영감을 받은 프리미엄 더모코스메틱.",
    "exploreTitle": "둘러보기",
    "policyTitle": "정책 & 고객지원",
    "careTitle": "고객센터",
    "addressValue": "호치민시 1군 벤응에동 레러이 65번지, 사이공센터 18층",
    "hotlineLabel": "고객센터",
    "hotlineValue": "1800 8998",
    "emailLabel": "이메일",
    "emailValue": "concierge@elysiderm.vn",
    "hoursValue": "월요일 – 일요일: 09:00 – 21:00",
    "privacy": "개인정보 처리방침",
    "returns": "교환 및 환불 정책",
    "terms": "이용약관",
    "copyright": "© {year} ELYSIDERM 베트남. 모든 권리는 Elysiderm-Cosmetics Korea 그룹에 있습니다."
  },
  "home": {
    "hero": {
      "tag": "한국 스킨케어 표준",
      "titleLine1": "세련된 아름다움은",
      "titleLine2Emphasis": "건강한 피부에서 시작됩니다",
      "description": "ELYSIDERM과 함께 한국 스킨케어 표준을 경험하세요 — 현대적이고 자연스러우며 순수한 아름다움을 위해 엄선된 제품으로 매일 피부를 가꿔보세요.",
      "ctaPrimary": "컬렉션 둘러보기",
      "ctaSecondary": "무료 피부 상담 받기",
      "trustBadges": ["스킨케어", "섬세하고 순한", "현대 과학", "메이드 인 코리아"]
    },
    "strengths": {
      "tag": "ELYSIDERM만의 특별함",
      "title": "본연의 자연스러운 아름다움을 만나다",
      "description": "ELYSIDERM은 진정한 아름다움은 올바르게 관리되고 깊이 이해된 건강한 피부에서 시작된다고 믿습니다.",
      "items": [
        { "title": "섬세하고 순한 케어", "body": "글루타치온, 세라마이드 NP, 판테놀이 함유된 순한 제형으로 민감성 피부에도 적합합니다." },
        { "title": "시간이 증명하는 효과", "body": "즉각적인 효과보다 피부 속부터 건강해지는 지속 가능한 결과를 우선합니다." },
        { "title": "세심한 동행", "body": "피부과 상담 전문가가 스킨케어 여정 내내 함께합니다." }
      ]
    },
    "products": {
      "tag": "인기 컬렉션",
      "title": "맑고 빛나는 스킨 리추얼",
      "description": "Eirlys' 에코시스템에서 엄선한 가장 사랑받는 시그니처 제품들입니다.",
      "viewAll": "전체 상품 보기"
    },
    "spotlight": {
      "tag": "피부 과학의 혁신",
      "title": "매일이 더 세심해지는 스킨케어",
      "description": "재생 영양 성분과 자외선 차단 기술의 조화로, 가장 바쁜 하루에도 피부는 충분히 영양을 공급받고 보호받습니다.",
      "spfBadgeTitle": "SPF 50+",
      "spfBadgeDescription": "광범위 자외선 차단, 깃털처럼 가벼운 발림성.",
      "cta": "나만을 위한 혜택 받아보기",
      "ingredients": [
        { "name": "세라마이드 NP", "description": "피부 장벽을 강화합니다." },
        { "name": "판테놀 (B5)", "description": "즉각적인 진정과 재생 효과." },
        { "name": "나이아신아마이드", "description": "피부 톤을 고르게 정돈합니다." },
        { "name": "알부틴 & 아데노신", "description": "브라이트닝과 재생을 돕습니다." }
      ]
    },
    "why": {
      "title": "여성들이 엘리시더미를 신뢰하는 이유",
      "description": "한국의 표준과 베트남 피부에 대한 깊은 이해가 만든 차이입니다.",
      "items": [
        { "title": "한국 스타일", "body": "한국 더모코스메틱 표준에 따라 개발된 제형." },
        { "title": "세련된 디자인", "body": "미니멀하고 고급스러운 패키지와 사용 경험." },
        { "title": "간편한 사용법", "body": "바쁜 현대인의 라이프스타일에 맞는 간단한 루틴." },
        { "title": "깊이 있는 케어", "body": "전문가와의 1:1 상담이 여정 내내 함께합니다." }
      ]
    },
    "ctaBanner": {
      "tag": "스킨케어 경험",
      "title": "당신의 피부를 위한 특별한 순간",
      "description": "스킨케어의 매 순간은 속도를 늦추고, 피부의 소리에 귀 기울이며, 자신을 아끼는 소중한 시간입니다.",
      "button": "지금 루틴 시작하기"
    },
    "testimonials": {
      "title": "현대 여성들의 진솔한 이야기",
      "items": [
        { "quote": "몇 주 사용 후 피부가 눈에 띄게 밝아지고 톤이 고르게 되었어요. 발림성도 가볍고 편안합니다.", "name": "프엉 린", "role": "직장인" },
        { "quote": "크리스탈 톤업 선크림이 제 지성 피부에 정말 잘 맞아요, 답답하지 않고 자연스럽게 톤업됩니다.", "name": "타오 응우옌", "role": "플라워샵 운영자" },
        { "quote": "상담이 정말 세심해서 제 민감성 피부에 꼭 맞는 제품을 고를 수 있었어요.", "name": "마이 아잉", "role": "교사" }
      ]
    },
    "leadForm": {
      "title": "스킨케어 여정을 시작할 준비가 되셨나요?",
      "description": "정보를 남겨주시면 ELYSIDERM 팀이 당신의 피부에 맞는 무료 상담을 제공해드립니다.",
      "bullets": ["24시간 이내 무료 상담", "신규 고객 전용 혜택", "개인정보 철저히 보호"]
    }
  },
  "product": {
    "breadcrumbHome": "홈",
    "breadcrumbCollections": "Eirlys' 컬렉션",
    "badges": { "best-seller": "베스트셀러", "korean-patent-formula": "한국 특허 포뮬러" },
    "labInfo": "ELYSIDERM Korea Derma-Lab · 서브 브랜드 Eirlys'",
    "ratingLabel": "{rating} · 검증된 리뷰 {count}개",
    "soldLabel": "베트남·한국 누적 판매 {count}개+",
    "krwReferenceLabel": "한국 정가",
    "philosophyLabel": "제품 철학",
    "keyActivesLabel": "입증된 혁신 활성 성분",
    "stockLabel": "이번 달 서울 입고분 중 {count}개 남음",
    "addToCart": "장바구니에 담기",
    "consultAndBuy": "상담 및 바로 구매",
    "trust": [
      { "title": "무료 배송", "body": "50만 동 이상 주문 시" },
      { "title": "100% 정품", "body": "서울 정식 수입" },
      { "title": "1:1 피부과 상담", "body": "세심한 루틴 관리" }
    ],
    "routineTitle": "유리 피부를 깨우는 3단계 리추얼",
    "routineDescription": "재생 세럼 – 생체모방 보습 크림 – 전방위 자외선 차단으로 이어지는 시너지 3단계 세트.",
    "routineStepLabel": "{n}단계",
    "routineSelected": "선택됨",
    "routineViewDetail": "자세히 보기",
    "bundleCta": "번들 특가",
    "tabs": { "technology": "기술 & 성분", "usage": "사용 방법", "reviews": "실제 리뷰" },
    "scienceFirstTitle": "Science First",
    "scienceFirstBody": "과학은 모든 스킨케어 솔루션의 기초입니다 — 모든 활성 성분의 정확한 함량까지 투명하게 공개합니다.",
    "inciLabel": "전체 성분 목록 (INCI)",
    "relatedTitle": "이 컬렉션의 다른 제품"
  },
  "leadForm": {
    "fields": {
      "name": "이름",
      "phone": "전화번호",
      "email": "이메일",
      "interest": "관심 제품",
      "interestOther": "기타 / 아직 미정",
      "note": "메모 (선택)"
    },
    "submit": "상담 요청 보내기",
    "submitting": "전송 중...",
    "success": "감사합니다! ELYSIDERM 팀이 곧 연락드리겠습니다.",
    "errors": {
      "name": "이름을 입력해 주세요",
      "phone": "전화번호가 올바르지 않습니다",
      "generic": "오류가 발생했습니다. 다시 시도해 주세요",
      "missingEndpoint": "제출 엔드포인트가 설정되지 않았습니다.",
      "submitFailed": "전송에 실패했습니다. 다시 시도해 주세요"
    }
  },
  "collections": { "title": "컬렉션", "description": "ELYSIDERM | Eirlys'의 전체 스킨케어 라인을 만나보세요." },
  "about": {
    "title": "엘리시더미 소개",
    "intro": "ELYSIDERM은 한국 피부과학에서 영감을 받은 프리미엄 더모코스메틱 브랜드로, 안전하고 지속 가능한 방식으로 건강하고 빛나는 균형 잡힌 피부를 위한 솔루션을 제공합니다.",
    "visionTitle": "비전",
    "vision": "과학적 혁신, 세련된 심미성, 품질을 통해 일상적인 스킨케어 경험을 높이는, 전 세계가 신뢰하는 스킨케어·뷰티 브랜드가 되는 것입니다.",
    "missionTitle": "미션",
    "mission": "첨단 기술, 심도 있는 연구, 국제 품질 기준을 결합한 현대 과학 기반의 스킨케어 솔루션을 만듭니다.",
    "valuesTitle": "핵심 가치",
    "values": [
      { "title": "Science First", "body": "과학은 모든 스킨케어 솔루션의 기초입니다." },
      { "title": "Integrity in Quality", "body": "모든 제품에서 품질, 투명성, 신뢰를 지킵니다." },
      { "title": "Purposeful Innovation", "body": "진정한 가치를 만드는 목적 있는 혁신을 추구합니다." },
      { "title": "Timeless Elegance", "body": "디자인, 경험, 브랜드 철학에서 세련됨을 추구합니다." },
      { "title": "Lasting Impact", "body": "고객, 파트너, 커뮤니티를 위한 지속 가능한 가치를 만듭니다." }
    ]
  },
  "technology": {
    "title": "기술 & 성분",
    "intro": "모든 ELYSIDERM | Eirlys' 제품은 투명한 성분 연구와 현대적인 한국 제형 기술에서 시작됩니다.",
    "pillarsTitle": "3대 기술 기둥",
    "pillars": [
      { "title": "임상 연구", "body": "모든 포뮬러는 출시 전 독립적인 피부과 테스트를 거칩니다." },
      { "title": "투명한 활성 성분", "body": "모든 제품의 핵심 활성 성분 함량을 정확히 공개합니다." },
      { "title": "생체모방 기술", "body": "자극 없이 영양분이 깊이 흡수되는 생체 적합 텍스처." }
    ]
  },
  "why": {
    "title": "엘리시더미를 선택하는 이유",
    "intro": "트렌드를 좇기보다, ELYSIDERM은 신뢰할 수 있는 과학 기반 솔루션으로 고객과 함께합니다.",
    "items": [
      { "title": "한국 스타일", "body": "한국 더모코스메틱 표준에 따라 개발된 제형." },
      { "title": "세련된 디자인", "body": "미니멀하고 고급스러운 패키지와 사용 경험." },
      { "title": "간편한 사용법", "body": "바쁜 현대인의 라이프스타일에 맞는 간단한 루틴." },
      { "title": "깊이 있는 케어", "body": "전문가와의 1:1 상담이 여정 내내 함께합니다." }
    ]
  },
  "contact": { "title": "문의하기", "description": "정보를 남겨주시면 ELYSIDERM 팀이 곧 연락드리겠습니다." },
  "policies": {
    "privacyTitle": "개인정보 처리방침",
    "privacyBody": "ELYSIDERM은 고객 정보를 보호하며, 연락처 정보는 상담 및 고객 관리 목적으로만 사용하고 동의 없이 제3자와 공유하지 않습니다.",
    "returnsTitle": "교환 및 환불 정책",
    "returnsBody": "봉인이 훼손되지 않고 미사용 상태이며 구매 영수증이 있는 경우 7일 이내 교환 및 환불이 가능합니다.",
    "termsTitle": "이용약관",
    "termsBody": "본 웹사이트의 모든 콘텐츠는 ELYSIDERM의 소유입니다. 복제 또는 상업적 사용 전에 반드시 문의해 주세요."
  }
}
```

- [ ] **Step 8: Create `src/i18n/get-dictionary.ts`**

```ts
import vi from "./dictionaries/vi.json";
import en from "./dictionaries/en.json";
import ko from "./dictionaries/ko.json";
import type { Locale } from "@/types/i18n";

const dictionaries = { vi, en, ko };

export type Dictionary = typeof vi;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
```

- [ ] **Step 9: Write the failing test `src/i18n/get-dictionary.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getDictionary } from "./get-dictionary";
import { LOCALES } from "@/types/i18n";

describe("getDictionary", () => {
  it("returns a dictionary for every supported locale", () => {
    for (const locale of LOCALES) {
      expect(getDictionary(locale).nav.home).toBeTruthy();
    }
  });

  it("returns locale-appropriate content", () => {
    expect(getDictionary("vi").nav.home).toBe("Trang chủ");
    expect(getDictionary("en").nav.home).toBe("Home");
    expect(getDictionary("ko").nav.home).toBe("홈");
  });

  it("keeps the same nav keys across all locales", () => {
    const viKeys = Object.keys(getDictionary("vi").nav).sort();
    const enKeys = Object.keys(getDictionary("en").nav).sort();
    const koKeys = Object.keys(getDictionary("ko").nav).sort();
    expect(enKeys).toEqual(viKeys);
    expect(koKeys).toEqual(viKeys);
  });
});
```

- [ ] **Step 10: Run tests to verify everything passes**

Run: `npx vitest run`
Expected: PASS, all tests from Steps 3–9 passing (TypeScript will also fail to compile later, in
Task 2's build step, if `en.json`/`ko.json` are missing a key `vi.json` has — the `Dictionary =
typeof vi` return-type annotation enforces structural parity at compile time).

- [ ] **Step 11: Commit**

```bash
git add vitest.config.ts src/types/i18n.ts src/lib/locale.ts src/lib/locale.test.ts src/i18n/dictionaries src/i18n/get-dictionary.ts src/i18n/get-dictionary.test.ts
git commit -m "feat: add i18n foundation (locale types, dictionaries, lookup helpers)"
```

---

### Task 2: Locale routing skeleton — fonts, root redirect, `[locale]` layout, Header/Footer

**Files:**
- Create: `src/lib/fonts.ts`
- Modify: `tailwind.config.ts` (font fallback stacks)
- Modify: `src/app/layout.tsx` (minimal true root layout)
- Modify: `src/app/page.tsx` (client-side locale redirect, replaces old placeholder)
- Create: `src/components/HtmlLangSetter.tsx`
- Create: `src/components/LanguageSwitcher.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `LOCALES`, `DEFAULT_LOCALE`, `Locale` (Task 1); `getDictionary`, `Dictionary` (Task 1);
  `isLocale`, `localizedPath`, `replaceLocaleInPath` (Task 1).
- Produces: `<Header locale dict />`, `<Footer locale dict />` consumed by `[locale]/layout.tsx`
  and reused nowhere else (every page renders inside this layout automatically).

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

- [ ] **Step 2: Update `tailwind.config.ts` with color tokens and font fallback stacks**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#FFC871", dark: "#C3A767", light: "#EDCA96" },
        ivory: "#FBF6F2",
        ink: "#000000",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Replace `src/app/page.tsx` with the client-side locale redirect**

```tsx
"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, LOCALES } from "@/types/i18n";

export default function RootRedirectPage() {
  useEffect(() => {
    const browserLanguages = navigator.languages ?? [navigator.language];
    const match = browserLanguages
      .map((lang) => lang.slice(0, 2))
      .find((lang) => (LOCALES as readonly string[]).includes(lang));

    window.location.replace(`/${match ?? DEFAULT_LOCALE}`);
  }, []);

  return null;
}
```

- [ ] **Step 4: Keep `src/app/layout.tsx` as the minimal true root layout**

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

- [ ] **Step 5: Create `src/components/HtmlLangSetter.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import type { Locale } from "@/types/i18n";

export default function HtmlLangSetter({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
```

- [ ] **Step 6: Create `src/components/LanguageSwitcher.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/types/i18n";
import { replaceLocaleInPath } from "@/lib/locale";

const LABELS: Record<Locale, string> = { vi: "VN", en: "EN", ko: "KO" };

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 p-1 text-xs">
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={replaceLocaleInPath(pathname, code)}
          className={`rounded-full px-2 py-1 ${code === locale ? "bg-black text-ivory" : "text-black/60"}`}
        >
          {LABELS[code]}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/Header.tsx`**

```tsx
import Link from "next/link";
import type { Locale } from "@/types/i18n";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/lib/locale";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const navItems = [
    { href: localizedPath(locale, "/"), label: dict.nav.home },
    { href: localizedPath(locale, "/about"), label: dict.nav.about },
    { href: localizedPath(locale, "/collections"), label: dict.nav.collections },
    { href: localizedPath(locale, "/technology"), label: dict.nav.technology },
    { href: localizedPath(locale, "/why-elysiderm"), label: dict.nav.why },
    { href: localizedPath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href={localizedPath(locale, "/")} className="leading-tight">
          <span className="block font-heading text-xl tracking-wide">ELYSIDERM</span>
          <span className="block text-[10px] tracking-[0.2em] text-black/60">{dict.header.subtitle}</span>
        </Link>

        <nav className="hidden flex-1 justify-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-gold-dark">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href={localizedPath(locale, "/contact")}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-ivory hover:bg-gold-dark"
          >
            {dict.header.ctaConsult}
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="list-none rounded-full border border-black/10 px-3 py-2 text-sm">☰</summary>
          <div className="absolute right-0 top-full mt-2 w-64 space-y-4 rounded-2xl border border-black/5 bg-ivory p-5 shadow-lg">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium">
                  {item.label}
                </Link>
              ))}
            </nav>
            <LanguageSwitcher locale={locale} />
            <Link
              href={localizedPath(locale, "/contact")}
              className="block rounded-full bg-black px-5 py-2 text-center text-sm font-medium text-ivory"
            >
              {dict.header.ctaConsult}
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create `src/components/Footer.tsx`**

```tsx
import Link from "next/link";
import type { Locale } from "@/types/i18n";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/lib/locale";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="font-heading text-lg">ELYSIDERM</p>
          <p className="mt-2 text-sm text-black/70">{dict.footer.description}</p>
        </div>
        <div>
          <p className="font-medium">{dict.footer.exploreTitle}</p>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            <li><Link href={localizedPath(locale, "/about")}>{dict.nav.about}</Link></li>
            <li><Link href={localizedPath(locale, "/collections")}>{dict.nav.collections}</Link></li>
            <li><Link href={localizedPath(locale, "/technology")}>{dict.nav.technology}</Link></li>
            <li><Link href={localizedPath(locale, "/why-elysiderm")}>{dict.nav.why}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium">{dict.footer.policyTitle}</p>
          <ul className="mt-2 space-y-1 text-sm text-black/70">
            <li><Link href={localizedPath(locale, "/privacy")}>{dict.footer.privacy}</Link></li>
            <li><Link href={localizedPath(locale, "/returns")}>{dict.footer.returns}</Link></li>
            <li><Link href={localizedPath(locale, "/terms")}>{dict.footer.terms}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium">{dict.footer.careTitle}</p>
          <p className="mt-2 text-sm text-black/70">{dict.footer.addressValue}</p>
          <p className="mt-1 text-sm text-black/70">{dict.footer.hotlineLabel}: {dict.footer.hotlineValue}</p>
          <p className="text-sm text-black/70">{dict.footer.emailLabel}: {dict.footer.emailValue}</p>
          <p className="text-sm text-black/70">{dict.footer.hoursValue}</p>
        </div>
      </div>
      <p className="border-t border-black/5 py-4 text-center text-xs text-black/50">
        {dict.footer.copyright.replace("{year}", String(year))}
      </p>
    </footer>
  );
}
```

- [ ] **Step 9: Create `src/app/[locale]/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { rosario, montserrat } from "@/lib/fonts";
import { LOCALES, type Locale } from "@/types/i18n";
import { isLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HtmlLangSetter from "@/components/HtmlLangSetter";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);

  return {
    metadataBase: new URL("https://elysiderm.vn"),
    title: { default: dict.meta.defaultTitle, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    alternates: {
      languages: { vi: "/vi", en: "/en", ko: "/ko", "x-default": "/vi" },
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <div className={`${rosario.variable} ${montserrat.variable} font-body`}>
      <HtmlLangSetter locale={locale} />
      <Header locale={locale} dict={dict} />
      <main>{children}</main>
      <Footer locale={locale} dict={dict} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: dict.meta.siteName,
            url: "https://elysiderm.vn",
            description: dict.meta.defaultDescription,
          }),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 10: Create a temporary `src/app/[locale]/page.tsx` placeholder (replaced fully in Task 5)**

```tsx
export default function HomePagePlaceholder() {
  return <p className="mx-auto max-w-6xl px-4 py-16">ELYSIDERM</p>;
}
```

- [ ] **Step 11: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { LOCALES } from "@/types/i18n";

const BASE_URL = "https://elysiderm.vn";
const STATIC_ROUTES = ["", "/collections", "/about", "/technology", "/why-elysiderm", "/contact", "/privacy", "/returns", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
    })),
  );
}
```

(Product URLs are added to this function in Task 3, once `getAllProducts` exists.)

- [ ] **Step 12: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://elysiderm.vn/sitemap.xml",
  };
}
```

- [ ] **Step 13: Verify build**

Run: `wsl.exe -- bash -lc 'source ~/.nvm/nvm.sh && cd /home/<user>/Projects/elys_app && npm run build'`
Expected: exit code 0; `out/vi/index.html`, `out/en/index.html`, `out/ko/index.html` all exist;
`out/index.html` exists (the redirect shell).

- [ ] **Step 14: Manually check locale redirect and language switcher**

Run: `npm run dev`, open `http://localhost:3000/`
Expected: redirects to `/vi` (or `/en`/`/ko` depending on browser language). Open `/en` directly —
header/footer/nav render in English; clicking "KO" in the language switcher goes to `/ko` (same
page); no console errors; no account icon in the header; mobile width (`<1024px`) collapses nav
into the `☰` disclosure.

- [ ] **Step 15: Commit**

```bash
git add src/lib/fonts.ts tailwind.config.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css src/components/HtmlLangSetter.tsx src/components/LanguageSwitcher.tsx src/components/Header.tsx src/components/Footer.tsx src/app/\[locale\]/layout.tsx src/app/\[locale\]/page.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add locale routing skeleton with header, footer and language switcher"
```

---

### Task 3: Product & bundle data layer (TDD)

**Files:**
- Create: `src/types/product.ts`
- Create: `src/data/products.json`
- Create: `src/data/bundles.json`
- Create: `src/lib/products.ts`
- Create: `src/lib/products.test.ts`
- Modify: `src/app/sitemap.ts` (add product routes)

**Interfaces:**
- Consumes: `LocalizedText` (Task 1).
- Produces: `Product`, `Bundle`, `KeyActive`, `IngredientStat`, `ProductReview` types from
  `@/types/product`; `getAllProducts()`, `getFeaturedProducts()`, `getProductBySlug(slug)`,
  `getRelatedProducts(slug, limit?)`, `getRoutineProducts(collection)`,
  `getBundleForCollection(collection)` from `@/lib/products` — consumed by every page task from
  here on.

- [ ] **Step 1: Create `src/types/product.ts`**

```ts
import type { LocalizedText } from "./i18n";

export interface KeyActive {
  name: string;
  percentage?: string;
  description: LocalizedText;
}

export interface IngredientStat {
  label: LocalizedText;
  value: string;
}

export interface ProductReview {
  author: string;
  rating: number;
  text: LocalizedText;
}

export interface Product {
  slug: string;
  collection: string;
  routineStep?: number;
  price: number;
  originalPrice?: number;
  krwReferencePrice?: number;
  images: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  soldCount?: number;
  stockCount?: number;
  badges?: string[];
  name: LocalizedText;
  subtitle?: LocalizedText;
  shortDescription: LocalizedText;
  description?: LocalizedText;
  philosophyQuote?: LocalizedText;
  keyActives?: KeyActive[];
  ingredientStats?: IngredientStat[];
  fullIngredientList?: string[];
  usageSteps?: LocalizedText[];
  reviews?: ProductReview[];
}

export interface Bundle {
  id: string;
  collection: string;
  name: LocalizedText;
  description: LocalizedText;
  bundlePrice: number;
}
```

- [ ] **Step 2: Write the failing test `src/lib/products.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  getRoutineProducts,
  getBundleForCollection,
} from "./products";

describe("products data layer", () => {
  it("returns all products", () => {
    expect(getAllProducts().length).toBeGreaterThan(0);
  });

  it("finds a product by slug", () => {
    const product = getProductBySlug("eirlys-alpha-melight-intensive-cream");
    expect(product?.name.en).toBe("Eirlys' Alpha-Melight™ Intensive Cream");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
  });

  it("returns only featured products", () => {
    const featured = getFeaturedProducts();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("returns related products from the same collection, excluding itself", () => {
    const related = getRelatedProducts("eirlys-alpha-melight-intensive-cream");
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.collection === "alpha-melight")).toBe(true);
    expect(related.some((p) => p.slug === "eirlys-alpha-melight-intensive-cream")).toBe(false);
  });

  it("returns routine products sorted by routineStep ascending", () => {
    const routine = getRoutineProducts("alpha-melight");
    expect(routine.map((p) => p.routineStep)).toEqual([1, 2, 3]);
  });

  it("finds the bundle matching a collection", () => {
    const bundle = getBundleForCollection("alpha-melight");
    expect(bundle?.bundlePrice).toBe(1440000);
  });

  it("returns undefined when no bundle exists for a collection", () => {
    expect(getBundleForCollection("cleanser")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/products.test.ts`
Expected: FAIL — `Cannot find module './products'`.

- [ ] **Step 4: Create `src/data/products.json`**

```json
[
  {
    "slug": "eirlys-alpha-melight-refining-serum",
    "collection": "alpha-melight",
    "routineStep": 1,
    "price": 650000,
    "images": ["/images/products/alpha-melight-refining-serum-1.jpg"],
    "featured": false,
    "rating": 4.8,
    "reviewCount": 64,
    "name": {
      "vi": "Eirlys' Alpha-Melight™ Refining Serum",
      "en": "Eirlys' Alpha-Melight™ Refining Serum",
      "ko": "Eirlys' Alpha-Melight™ Refining Serum"
    },
    "shortDescription": {
      "vi": "Huyết thanh cô đặc lấp đầy rãnh nhăn, ức chế melanin và mở đường cho kem dưỡng thẩm thấu sâu hơn.",
      "en": "A concentrated serum that smooths fine lines, curbs melanin, and preps skin to absorb the next step more deeply.",
      "ko": "잔주름을 채우고 멜라닌을 억제하며, 다음 단계 크림이 더 깊이 흡수되도록 준비해주는 고농축 세럼입니다."
    }
  },
  {
    "slug": "eirlys-alpha-melight-intensive-cream",
    "collection": "alpha-melight",
    "routineStep": 2,
    "price": 680000,
    "originalPrice": 850000,
    "krwReferencePrice": 37000,
    "images": [
      "/images/products/alpha-melight-intensive-cream-1.jpg",
      "/images/products/alpha-melight-intensive-cream-2.jpg",
      "/images/products/alpha-melight-intensive-cream-3.jpg",
      "/images/products/alpha-melight-intensive-cream-4.jpg"
    ],
    "featured": false,
    "rating": 5.0,
    "reviewCount": 128,
    "soldCount": 3420,
    "stockCount": 15,
    "badges": ["best-seller", "korean-patent-formula"],
    "name": {
      "vi": "Eirlys' Alpha-Melight™ Intensive Cream",
      "en": "Eirlys' Alpha-Melight™ Intensive Cream",
      "ko": "Eirlys' Alpha-Melight™ Intensive Cream"
    },
    "subtitle": {
      "vi": "Kem Dưỡng Trắng & Căng Bóng Phục Hồi Chuyên Sâu (50ml / 1.69 fl. oz.)",
      "en": "Intensive Brightening & Plumping Repair Cream (50ml / 1.69 fl. oz.)",
      "ko": "속깊은 브라이트닝 & 탄력 리페어 크림 (50ml / 1.69 fl. oz.)"
    },
    "shortDescription": {
      "vi": "Kem dưỡng chuyên sâu, hỗ trợ ức chế melanin tận gốc.",
      "en": "An intensive cream that helps target melanin at its root.",
      "ko": "멜라닌을 근본적으로 억제하는 데 도움을 주는 집중 크림입니다."
    },
    "description": {
      "vi": "Trọng tâm của liệu trình Alpha-Melight™, kết hợp Alpha-Bisabolol, Glutathione và Ceramide NP giúp làn da khoẻ mạnh, đều màu và rạng rỡ hơn theo thời gian.",
      "en": "The centerpiece of the Alpha-Melight™ ritual, combining Alpha-Bisabolol, Glutathione and Ceramide NP for healthier, more even, more radiant skin over time.",
      "ko": "Alpha-Melight™ 리추얼의 핵심 제품으로, 알파비사보롤, 글루타치온, 세라마이드 NP가 결합되어 시간이 지날수록 더 건강하고 고르며 빛나는 피부로 가꿔줍니다."
    },
    "philosophyQuote": {
      "vi": "\"Reveal Your Natural Radiance – Khơi mở vẻ đẹp rạng rỡ tự nhiên\". Kết cấu vàng óng siêu thẩm thấu trong 30 giây, mang lại làn da bóng nước Glass Skin suốt 24 giờ mà không hề bết dính.",
      "en": "\"Reveal Your Natural Radiance.\" A golden, ultra-absorbing texture that sinks in within 30 seconds, delivering 24-hour Glass Skin glow without any stickiness.",
      "ko": "\"Reveal Your Natural Radiance – 자연스러운 빛을 깨우다\". 30초 만에 흡수되는 골든 텍스처로, 끈적임 없이 24시간 유리 피부 광채를 선사합니다."
    },
    "keyActives": [
      {
        "name": "Alpha-Melight™ (Alpha-Bisabolol)",
        "percentage": "0.5%",
        "description": {
          "vi": "Ức chế enzym sinh melanin, hỗ trợ làm mờ đốm nâu.",
          "en": "Inhibits melanin-producing enzymes, helping fade brown spots.",
          "ko": "멜라닌 생성 효소를 억제하여 갈색 반점을 옅어지게 돕습니다."
        }
      },
      {
        "name": "Glutathione 99%",
        "description": {
          "vi": "Chống oxy hoá mạnh, hỗ trợ da sáng đều màu.",
          "en": "A powerful antioxidant that supports brighter, more even skin.",
          "ko": "강력한 항산화 성분으로 피부 톤을 밝고 고르게 정돈합니다."
        }
      },
      {
        "name": "Ceramide NP",
        "description": {
          "vi": "Củng cố hàng rào lipid, giữ ẩm chuyên sâu.",
          "en": "Strengthens the lipid barrier for deep hydration.",
          "ko": "지질 장벽을 강화해 깊은 보습을 돕습니다."
        }
      },
      {
        "name": "Panthenol B5 & Niacinamide",
        "description": {
          "vi": "Làm dịu và phục hồi tức thì.",
          "en": "Soothes and repairs instantly.",
          "ko": "즉각적인 진정과 재생 효과."
        }
      }
    ],
    "ingredientStats": [
      { "label": { "vi": "Alpha-Bisabolol", "en": "Alpha-Bisabolol", "ko": "알파비사보롤" }, "value": "0.5%" },
      { "label": { "vi": "Glutathione Tinh Khiết", "en": "Pure Glutathione", "ko": "고순도 글루타치온" }, "value": "99%" },
      { "label": { "vi": "Ceramide NP Bio", "en": "Ceramide NP Bio", "ko": "세라마이드 NP 바이오" }, "value": "10.000ppm" },
      { "label": { "vi": "Sodium Hyaluronate", "en": "Sodium Hyaluronate", "ko": "소듐 히알루로네이트" }, "value": "5D" }
    ],
    "fullIngredientList": [
      "Water", "Butylene Glycol", "Glycerin", "Caprylic/Capric Triglyceride", "Alpha-Bisabolol",
      "Glutathione", "Ceramide NP", "Sodium Hyaluronate", "Panthenol", "Niacinamide", "Adenosine",
      "Camellia Sinensis Leaf Extract", "Centella Asiatica Extract", "1,2-Hexanediol", "Ethylhexylglycerin"
    ],
    "usageSteps": [
      {
        "vi": "Sau bước làm sạch và cân bằng da, lấy lượng vừa đủ ra lòng bàn tay.",
        "en": "After cleansing and toning, take an adequate amount into your palm.",
        "ko": "세안과 토너 사용 후 적당량을 손바닥에 덜어냅니다."
      },
      {
        "vi": "Thoa đều lên mặt và cổ, massage nhẹ nhàng theo chuyển động tròn.",
        "en": "Apply evenly to face and neck, gently massaging in circular motions.",
        "ko": "얼굴과 목에 고르게 바른 후 원을 그리듯 부드럽게 마사지합니다."
      },
      {
        "vi": "Sử dụng sáng và tối để đạt hiệu quả tối ưu.",
        "en": "Use morning and night for optimal results.",
        "ko": "아침저녁으로 사용하면 더욱 효과적입니다."
      }
    ],
    "reviews": [
      {
        "author": "Ngọc Hân",
        "rating": 5,
        "text": {
          "vi": "Da mình sáng và căng bóng thấy rõ chỉ sau 2 tuần, không hề gây bí da.",
          "en": "My skin visibly brightened and plumped in just 2 weeks, without feeling clogged.",
          "ko": "2주 만에 피부가 눈에 띄게 밝고 탱탱해졌어요, 답답함도 없었습니다."
        }
      },
      {
        "author": "Thu Trang",
        "rating": 5,
        "text": {
          "vi": "Kết cấu mỏng nhẹ, thấm nhanh, rất hợp với da hỗn hợp thiên dầu của mình.",
          "en": "Lightweight texture that absorbs quickly, great for my combination-oily skin.",
          "ko": "가볍고 빠르게 흡수되는 제형이라 복합성/지성 피부인 저에게 잘 맞아요."
        }
      },
      {
        "author": "Bảo Trâm",
        "rating": 4.5,
        "text": {
          "vi": "Sản phẩm tốt, giá hơi cao nhưng xứng đáng để đầu tư lâu dài.",
          "en": "Great product, a bit pricey but worth the long-term investment.",
          "ko": "제품은 좋지만 가격이 다소 있는 편이에요. 그래도 장기적으로 투자할 가치가 있습니다."
        }
      }
    ]
  },
  {
    "slug": "eirlys-crystal-tone-up-sunscreen",
    "collection": "alpha-melight",
    "routineStep": 3,
    "price": 590000,
    "images": ["/images/products/crystal-tone-up-sunscreen-1.jpg"],
    "featured": true,
    "rating": 4.9,
    "reviewCount": 96,
    "name": {
      "vi": "Eirlys' Crystal Tone Up Sunscreen",
      "en": "Eirlys' Crystal Tone Up Sunscreen",
      "ko": "Eirlys' 크리스탈 톤업 선크림"
    },
    "shortDescription": {
      "vi": "Màng lọc chống nắng phổ rộng SPF50+ PA++++, nâng tông nhẹ nhàng và kiểm soát dầu.",
      "en": "Broad-spectrum SPF50+ PA++++ sun filter that gently tones up and controls shine.",
      "ko": "부드럽게 톤업하고 유분을 조절하는 광범위 SPF50+ PA++++ 자외선 차단제."
    }
  },
  {
    "slug": "eirlys-glutathione-cream",
    "collection": "glutathione",
    "price": 650000,
    "images": ["/images/products/glutathione-cream-1.jpg"],
    "featured": true,
    "rating": 4.7,
    "reviewCount": 52,
    "name": {
      "vi": "Eirlys' Glutathione Tone-Up Cream",
      "en": "Eirlys' Glutathione Tone-Up Cream",
      "ko": "Eirlys' 글루타치온 톤업 크림"
    },
    "shortDescription": {
      "vi": "Kem dưỡng chuyên sâu hỗ trợ làn da sáng khoẻ, đều màu.",
      "en": "An intensive cream that supports brighter, more even-toned skin.",
      "ko": "더 밝고 고른 톤의 피부를 위한 집중 크림입니다."
    }
  },
  {
    "slug": "eirlys-sunscreen-box-set",
    "collection": "sunscreen",
    "price": 990000,
    "images": ["/images/products/sunscreen-box-set-1.jpg"],
    "featured": true,
    "rating": 4.8,
    "reviewCount": 41,
    "name": {
      "vi": "Eirlys' Sunscreen Box Set",
      "en": "Eirlys' Sunscreen Box Set",
      "ko": "Eirlys' 선크림 박스 세트"
    },
    "shortDescription": {
      "vi": "Bộ chống nắng phổ rộng dành cho cả gia đình, tiện lợi mang theo.",
      "en": "A broad-spectrum sunscreen set for the whole family, travel-friendly.",
      "ko": "온 가족을 위한 광범위 자외선 차단 세트, 휴대하기 편리합니다."
    }
  },
  {
    "slug": "eirlys-daily-cleanser-3t-care",
    "collection": "cleanser",
    "price": 320000,
    "images": ["/images/products/daily-cleanser-3t-care-1.jpg"],
    "featured": true,
    "rating": 4.6,
    "reviewCount": 38,
    "name": {
      "vi": "Eirlys' Daily Cleanser 3T Care",
      "en": "Eirlys' Daily Cleanser 3T Care",
      "ko": "Eirlys' 데일리 클렌저 3T 케어"
    },
    "shortDescription": {
      "vi": "Sữa rửa mặt dịu nhẹ, làm sạch sâu mà không làm khô da.",
      "en": "A gentle cleanser that clears deeply without drying out skin.",
      "ko": "피부를 건조하게 하지 않으면서 깊이 세정하는 순한 클렌저입니다."
    }
  }
]
```

- [ ] **Step 5: Create `src/data/bundles.json`**

```json
[
  {
    "id": "alpha-melight-glass-skin-ritual",
    "collection": "alpha-melight",
    "name": {
      "vi": "Bộ 3 Eirlys' Glass Skin Ritual",
      "en": "Eirlys' Glass Skin Ritual Trio",
      "ko": "Eirlys' 글래스 스킨 리추얼 3종 세트"
    },
    "description": {
      "vi": "Mua trọn bộ 3 sản phẩm (Cream + Serum + Sunscreen) nhận ngay ưu đãi giảm 25% và hộp quà tặng sang trọng.",
      "en": "Get all 3 products (Cream + Serum + Sunscreen) with an instant 25% discount plus a luxury gift box.",
      "ko": "3종 세트(크림+세럼+선크림)를 구매하면 즉시 25% 할인과 럭셔리 선물 상자를 드립니다."
    },
    "bundlePrice": 1440000
  }
]
```

- [ ] **Step 6: Create `src/lib/products.ts`**

```ts
import productsData from "@/data/products.json";
import bundlesData from "@/data/bundles.json";
import type { Product, Bundle } from "@/types/product";

const products = productsData as Product[];
const bundles = bundlesData as Bundle[];

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

export function getRoutineProducts(collection: string): Product[] {
  return products
    .filter((p) => p.collection === collection && p.routineStep !== undefined)
    .sort((a, b) => (a.routineStep ?? 0) - (b.routineStep ?? 0));
}

export function getBundleForCollection(collection: string): Bundle | undefined {
  return bundles.find((b) => b.collection === collection);
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run src/lib/products.test.ts`
Expected: PASS, 8 tests passing.

- [ ] **Step 8: Update `src/app/sitemap.ts` to include product routes**

```ts
import type { MetadataRoute } from "next";
import { LOCALES } from "@/types/i18n";
import { getAllProducts } from "@/lib/products";

const BASE_URL = "https://elysiderm.vn";
const STATIC_ROUTES = ["", "/collections", "/about", "/technology", "/why-elysiderm", "/contact", "/privacy", "/returns", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();

  return LOCALES.flatMap((locale) => [
    ...STATIC_ROUTES.map((route) => ({ url: `${BASE_URL}/${locale}${route}`, lastModified: new Date() })),
    ...products.map((product) => ({
      url: `${BASE_URL}/${locale}/collections/${product.slug}`,
      lastModified: new Date(),
    })),
  ]);
}
```

- [ ] **Step 9: Verify build still passes**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 10: Commit**

```bash
git add src/types/product.ts src/data/products.json src/data/bundles.json src/lib/products.ts src/lib/products.test.ts src/app/sitemap.ts
git commit -m "feat: add product and bundle data layer with tests"
```

---

### Task 4: Lead form logic + component (TDD)

**Files:**
- Create: `src/lib/leadForm.ts`
- Create: `src/lib/leadForm.test.ts`
- Create: `src/components/LeadForm.tsx`

**Interfaces:**
- Consumes: `Locale` (Task 1), `Dictionary` (Task 1), `Product` (Task 3).
- Produces: `LeadFormData` type, `validateLeadForm(data): "name" | "phone" | null`,
  `submitLead(endpoint, data): Promise<void>` from `@/lib/leadForm`; `<LeadForm locale dict source
  products defaultInterest? />` consumed by homepage, product detail, and contact page tasks.

- [ ] **Step 1: Write the failing tests `src/lib/leadForm.test.ts`**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/leadForm.test.ts`
Expected: FAIL — `Cannot find module './leadForm'`.

- [ ] **Step 3: Create `src/lib/leadForm.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/leadForm.test.ts`
Expected: PASS, 6 tests passing.

- [ ] **Step 5: Create `src/components/LeadForm.tsx`**

```tsx
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

### Task 5: Homepage

**Files:**
- Create: `src/components/ProductCard.tsx`
- Replace: `src/app/[locale]/page.tsx` (delete Task 2's placeholder)

**Interfaces:**
- Consumes: `getFeaturedProducts`, `getAllProducts` (Task 3); `LeadForm` (Task 4);
  `localizedPath` (Task 1).
- Produces: `<ProductCard product locale />`, reused by Tasks 6 and 7.

- [ ] **Step 1: Create `src/components/ProductCard.tsx`**

```tsx
import Link from "next/link";
import type { Locale } from "@/types/i18n";
import type { Product } from "@/types/product";
import { localizedPath } from "@/lib/locale";

export default function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Link
      href={localizedPath(locale, `/collections/${product.slug}`)}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white"
    >
      <img
        src={product.images[0]}
        alt={product.name[locale]}
        width={480}
        height={480}
        className="aspect-square w-full object-cover transition group-hover:scale-105"
      />
      <div className="p-4">
        <h3 className="font-heading text-lg">{product.name[locale]}</h3>
        <p className="mt-2 text-sm text-black/70">{product.shortDescription[locale]}</p>
        <p className="mt-3 font-medium">{product.price.toLocaleString("vi-VN")}₫</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Replace `src/app/[locale]/page.tsx` with the full homepage**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, localizedPath } from "@/lib/locale";
import { getAllProducts, getFeaturedProducts } from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.meta.defaultTitle, description: dict.meta.defaultDescription };
}

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const featuredProducts = getFeaturedProducts();
  const allProducts = getAllProducts();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.home.hero.tag}</p>
        <h1 className="mt-3 font-heading text-4xl md:text-5xl">
          {dict.home.hero.titleLine1}{" "}
          <em className="not-italic text-gold-dark">{dict.home.hero.titleLine2Emphasis}</em>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-black/70">{dict.home.hero.description}</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={localizedPath(locale, "/collections")}
            className="rounded-full bg-black px-8 py-3 text-sm font-medium text-ivory"
          >
            {dict.home.hero.ctaPrimary}
          </Link>
          <Link
            href={localizedPath(locale, "/contact")}
            className="rounded-full border border-black px-8 py-3 text-sm font-medium"
          >
            {dict.home.hero.ctaSecondary}
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-black/60">
          {dict.home.hero.trustBadges.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-xs uppercase tracking-widest text-gold-dark">{dict.home.strengths.tag}</p>
        <h2 className="mt-3 text-center font-heading text-3xl">{dict.home.strengths.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-black/70">{dict.home.strengths.description}</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {dict.home.strengths.items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6 text-center">
              <h3 className="font-heading text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.home.products.tag}</p>
            <h2 className="mt-3 font-heading text-3xl">{dict.home.products.title}</h2>
            <p className="mt-3 max-w-xl text-sm text-black/70">{dict.home.products.description}</p>
          </div>
          <Link href={localizedPath(locale, "/collections")} className="text-sm font-medium underline">
            {dict.home.products.viewAll}
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs uppercase tracking-widest text-gold-dark">{dict.home.spotlight.tag}</p>
        <h2 className="mt-3 font-heading text-3xl">{dict.home.spotlight.title}</h2>
        <p className="mt-3 max-w-2xl text-sm text-black/70">{dict.home.spotlight.description}</p>
        <div className="mt-6 inline-block rounded-2xl border border-black/5 bg-white p-4">
          <p className="font-heading text-lg">{dict.home.spotlight.spfBadgeTitle}</p>
          <p className="text-sm text-black/70">{dict.home.spotlight.spfBadgeDescription}</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.spotlight.ingredients.map((ingredient) => (
            <div key={ingredient.name} className="rounded-2xl border border-black/5 bg-white p-4">
              <p className="font-medium">{ingredient.name}</p>
              <p className="mt-1 text-sm text-black/70">{ingredient.description}</p>
            </div>
          ))}
        </div>
        <Link href={localizedPath(locale, "/contact")} className="mt-6 inline-block text-sm font-medium underline">
          {dict.home.spotlight.cta}
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.home.why.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-black/70">{dict.home.why.description}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.why.items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6 text-center">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black py-16 text-ivory">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gold">{dict.home.ctaBanner.tag}</p>
          <h2 className="mt-3 font-heading text-3xl">{dict.home.ctaBanner.title}</h2>
          <p className="mt-4 text-sm text-ivory/80">{dict.home.ctaBanner.description}</p>
          <Link
            href={localizedPath(locale, "/collections")}
            className="mt-8 inline-block rounded-full bg-gold px-8 py-3 text-sm font-medium text-black"
          >
            {dict.home.ctaBanner.button}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.home.testimonials.title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {dict.home.testimonials.items.map((item) => (
            <div key={item.name} className="rounded-2xl border border-black/5 bg-white p-6">
              <p className="text-sm text-black/70">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 font-medium">{item.name}</p>
              <p className="text-xs text-black/50">{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="lead-form" className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.home.leadForm.title}</h2>
        <p className="mt-3 text-center text-sm text-black/70">{dict.home.leadForm.description}</p>
        <ul className="mt-6 space-y-2 text-sm text-black/70">
          {dict.home.leadForm.bullets.map((bullet) => (
            <li key={bullet}>✓ {bullet}</li>
          ))}
        </ul>
        <div className="mt-8">
          <LeadForm locale={locale} dict={dict} source="homepage" products={allProducts} />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 4: Manually check the homepage in all 3 locales**

Run: `npm run dev`, open `/vi`, `/en`, `/ko`
Expected: hero, strengths, featured product grid, spotlight, why-us, dark CTA banner,
testimonials, and lead form all render with locale-correct copy; no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductCard.tsx src/app/\[locale\]/page.tsx
git commit -m "feat: build the full homepage"
```

---

### Task 6: Collections listing page

**Files:**
- Create: `src/app/[locale]/collections/page.tsx`

**Interfaces:**
- Consumes: `getAllProducts` (Task 3), `ProductCard` (Task 5).

- [ ] **Step 1: Create `src/app/[locale]/collections/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import { getAllProducts } from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.collections.title, description: dict.collections.description };
}

export default function CollectionsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.collections.title}</h1>
      <p className="mt-3 max-w-xl text-sm text-black/70">{dict.collections.description}</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit code 0; `out/vi/collections/index.html` (and `en`/`ko` equivalents) exist.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/collections/page.tsx
git commit -m "feat: add collections listing page"
```

---

### Task 7: Product detail page

**Files:**
- Create: `src/app/[locale]/collections/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllProducts`, `getProductBySlug`, `getRelatedProducts`, `getRoutineProducts`,
  `getBundleForCollection` (Task 3); `ProductCard` (Task 5); `LeadForm` (Task 4).

- [ ] **Step 1: Create `src/app/[locale]/collections/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import LeadForm from "@/components/LeadForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, localizedPath } from "@/lib/locale";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getRoutineProducts,
  getBundleForCollection,
} from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return [];
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const locale: Locale = params.locale;
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  return {
    title: product.name[locale],
    description: product.shortDescription[locale],
    openGraph: {
      title: product.name[locale],
      description: product.shortDescription[locale],
      images: product.images,
    },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product.slug);
  const routineProducts = getRoutineProducts(product.collection);
  const bundle = getBundleForCollection(product.collection);
  const allProducts = getAllProducts();
  const badgeDict = dict.product.badges as Record<string, string>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <nav className="text-xs text-black/50">
        <Link href={localizedPath(locale, "/")}>{dict.product.breadcrumbHome}</Link>
        {" / "}
        <Link href={localizedPath(locale, "/collections")}>{dict.product.breadcrumbCollections}</Link>
        {" / "}
        <span>{product.name[locale]}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div>
          {product.badges && product.badges.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <span key={badge} className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium">
                  {badgeDict[badge] ?? badge}
                </span>
              ))}
            </div>
          )}
          <img
            src={product.images[0]}
            alt={product.name[locale]}
            width={600}
            height={600}
            className="w-full rounded-2xl object-cover"
          />
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(1).map((image) => (
                <img
                  key={image}
                  src={image}
                  alt={product.name[locale]}
                  width={150}
                  height={150}
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gold-dark">{dict.product.labInfo}</p>
          <h1 className="mt-2 font-heading text-3xl">{product.name[locale]}</h1>
          {product.subtitle && <p className="mt-2 text-sm italic text-black/70">{product.subtitle[locale]}</p>}
          <p className="mt-2 text-sm text-black/60">
            {dict.product.ratingLabel
              .replace("{rating}", product.rating.toFixed(1))
              .replace("{count}", String(product.reviewCount))}
          </p>
          {product.soldCount && (
            <p className="text-sm text-black/60">
              {dict.product.soldLabel.replace("{count}", String(product.soldCount))}
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-medium">{product.price.toLocaleString("vi-VN")}₫</p>
            {product.originalPrice && (
              <p className="text-sm text-black/40 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}₫
              </p>
            )}
          </div>
          {product.krwReferencePrice && (
            <p className="mt-1 text-xs text-black/50">
              {dict.product.krwReferenceLabel}: {product.krwReferencePrice.toLocaleString("ko-KR")}₩
            </p>
          )}

          {product.philosophyQuote && (
            <blockquote className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-sm italic text-black/70">
              <p className="mb-2 text-xs font-medium not-italic uppercase tracking-wide text-gold-dark">
                {dict.product.philosophyLabel}
              </p>
              {product.philosophyQuote[locale]}
            </blockquote>
          )}

          {product.keyActives && product.keyActives.length > 0 && (
            <div className="mt-6">
              <h2 className="font-medium">{dict.product.keyActivesLabel}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {product.keyActives.map((active) => (
                  <li key={active.name} className="rounded-xl border border-black/5 bg-white p-3 text-sm">
                    <p className="font-medium">
                      {active.name}
                      {active.percentage ? ` (${active.percentage})` : ""}
                    </p>
                    <p className="mt-1 text-black/60">{active.description[locale]}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.stockCount && (
            <p className="mt-6 text-sm text-black/60">
              {dict.product.stockLabel.replace("{count}", String(product.stockCount))}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href="#consult" className="flex-1 rounded-full bg-black px-6 py-3 text-center text-sm font-medium text-ivory">
              {dict.product.consultAndBuy}
            </a>
            <a href="#consult" className="flex-1 rounded-full border border-black px-6 py-3 text-center text-sm font-medium">
              {dict.product.addToCart}
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {dict.product.trust.map((item) => (
              <div key={item.title} className="rounded-xl border border-black/5 bg-white p-3 text-center text-xs">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-black/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {routineProducts.length > 1 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.routineTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-black/70">{dict.product.routineDescription}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {routineProducts.map((step) => (
              <div
                key={step.slug}
                className={`rounded-2xl border p-5 ${
                  step.slug === product.slug ? "border-gold-dark bg-gold/10" : "border-black/5 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-black/50">
                  {dict.product.routineStepLabel.replace("{n}", String(step.routineStep))}
                </p>
                <h3 className="mt-2 font-medium">{step.name[locale]}</h3>
                <p className="mt-2 text-sm text-black/60">{step.price.toLocaleString("vi-VN")}₫</p>
                {step.slug === product.slug ? (
                  <p className="mt-3 text-xs font-medium text-gold-dark">{dict.product.routineSelected}</p>
                ) : (
                  <Link
                    href={localizedPath(locale, `/collections/${step.slug}`)}
                    className="mt-3 inline-block text-xs font-medium underline"
                  >
                    {dict.product.routineViewDetail}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {bundle && (
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-black p-6 text-ivory sm:flex-row sm:items-center">
              <div>
                <p className="font-heading text-lg">{bundle.name[locale]}</p>
                <p className="mt-1 text-sm text-ivory/70">{bundle.description[locale]}</p>
              </div>
              <a href="#consult" className="whitespace-nowrap rounded-full bg-gold px-6 py-3 text-sm font-medium text-black">
                {dict.product.bundleCta} {bundle.bundlePrice.toLocaleString("vi-VN")}₫
              </a>
            </div>
          )}
        </div>
      )}

      {product.ingredientStats && product.ingredientStats.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.tabs.technology}</h2>
          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gold-dark">{dict.product.scienceFirstTitle}</p>
            <p className="mt-2 text-sm text-black/70">{dict.product.scienceFirstBody}</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.ingredientStats.map((stat) => (
              <div key={stat.label[locale]} className="rounded-xl border border-black/5 bg-white p-4">
                <p className="font-heading text-2xl">{stat.value}</p>
                <p className="mt-1 text-sm text-black/60">{stat.label[locale]}</p>
              </div>
            ))}
          </div>
          {product.fullIngredientList && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-black/50">{dict.product.inciLabel}</p>
              <p className="mt-2 text-xs text-black/60">{product.fullIngredientList.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {product.usageSteps && product.usageSteps.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.tabs.usage}</h2>
          <ol className="mt-4 space-y-3 text-sm text-black/70">
            {product.usageSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="font-heading text-gold-dark">{index + 1}.</span>
                <span>{step[locale]}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.tabs.reviews}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {product.reviews.map((review) => (
              <div key={review.author} className="rounded-xl border border-black/5 bg-white p-4">
                <p className="text-sm font-medium">
                  {review.author} · {review.rating.toFixed(1)}★
                </p>
                <p className="mt-2 text-sm text-black/70">{review.text[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="font-heading text-2xl">{dict.product.relatedTitle}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} locale={locale} />
            ))}
          </div>
        </div>
      )}

      <div id="consult" className="mt-20 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-heading text-2xl">{dict.product.consultAndBuy}</h2>
        <div className="mt-6">
          <LeadForm
            locale={locale}
            dict={dict}
            source="product-detail"
            products={allProducts}
            defaultInterest={product.slug}
          />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name[locale],
            description: (product.description ?? product.shortDescription)[locale],
            image: product.images,
            offers: {
              "@type": "Offer",
              priceCurrency: "VND",
              price: product.price,
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
          }),
        }}
      />
    </section>
  );
}
```

- [ ] **Step 2: Verify build pre-renders every product in every locale**

Run: `npm run build`
Expected: exit code 0; `out/vi/collections/eirlys-alpha-melight-intensive-cream/index.html` and
its `en`/`ko` equivalents all exist (and likewise for every other product slug).

- [ ] **Step 3: Manually check the hero product page**

Run: `npm run dev`, open `/vi/collections/eirlys-alpha-melight-intensive-cream`
Expected: breadcrumb, badges, gallery, price with strikethrough original price, philosophy quote,
key actives, routine 3-step block (with this product highlighted as "Đang chọn"), bundle banner,
technology/usage/reviews sections, related products, and the lead form (pre-filled interest) all
render without console errors. Repeat quickly for `/en/...` and `/ko/...`.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/collections/\[slug\]/page.tsx
git commit -m "feat: add rich product detail page with routine, bundle and JSON-LD"
```

---

### Task 8: About, Technology, Why-Elysiderm, Contact pages

**Files:**
- Create: `src/app/[locale]/about/page.tsx`
- Create: `src/app/[locale]/technology/page.tsx`
- Create: `src/app/[locale]/why-elysiderm/page.tsx`
- Create: `src/app/[locale]/contact/page.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `isLocale` (Task 1); `getAllProducts` (Task 3); `LeadForm` (Task 4).

- [ ] **Step 1: Create `src/app/[locale]/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.about.title, description: dict.about.intro };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.about.title}</h1>
      <p className="mt-4 text-black/70">{dict.about.intro}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl">{dict.about.visionTitle}</h2>
          <p className="mt-2 text-sm text-black/70">{dict.about.vision}</p>
        </div>
        <div>
          <h2 className="font-heading text-xl">{dict.about.missionTitle}</h2>
          <p className="mt-2 text-sm text-black/70">{dict.about.mission}</p>
        </div>
      </div>

      <h2 className="mt-12 font-heading text-2xl">{dict.about.valuesTitle}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {dict.about.values.map((value) => (
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

- [ ] **Step 2: Create `src/app/[locale]/technology/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.technology.title, description: dict.technology.intro };
}

export default function TechnologyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.technology.title}</h1>
      <p className="mt-4 text-black/70">{dict.technology.intro}</p>

      <h2 className="mt-10 font-heading text-2xl">{dict.technology.pillarsTitle}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {dict.technology.pillars.map((pillar) => (
          <div key={pillar.title} className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="font-medium">{pillar.title}</h3>
            <p className="mt-2 text-sm text-black/70">{pillar.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/app/[locale]/why-elysiderm/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.why.title, description: dict.why.intro };
}

export default function WhyElysidermPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.why.title}</h1>
      <p className="mt-4 text-black/70">{dict.why.intro}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {dict.why.items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-black/5 bg-white p-6">
            <h3 className="font-medium">{item.title}</h3>
            <p className="mt-2 text-sm text-black/70">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `src/app/[locale]/contact/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";
import { getAllProducts } from "@/lib/products";
import type { Locale } from "@/types/i18n";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const dict = getDictionary(params.locale);
  return { title: dict.contact.title, description: dict.contact.description };
}

export default function ContactPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;
  const dict = getDictionary(locale);
  const products = getAllProducts();

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-4xl">{dict.contact.title}</h1>
      <p className="mt-4 text-black/70">{dict.contact.description}</p>
      <div className="mt-8">
        <LeadForm locale={locale} dict={dict} source="contact-page" products={products} />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exit code 0; all 4 pages exist under `out/vi/`, `out/en/`, `out/ko/`.

- [ ] **Step 6: Commit**

```bash
git add src/app/\[locale\]/about/page.tsx src/app/\[locale\]/technology/page.tsx src/app/\[locale\]/why-elysiderm/page.tsx src/app/\[locale\]/contact/page.tsx
git commit -m "feat: add about, technology, why-elysiderm and contact pages"
```

---

### Task 9: Policy pages (privacy, returns, terms)

**Files:**
- Create: `src/components/PolicyPage.tsx`
- Create: `src/app/[locale]/privacy/page.tsx`
- Create: `src/app/[locale]/returns/page.tsx`
- Create: `src/app/[locale]/terms/page.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `isLocale` (Task 1).
- Produces: `<PolicyPage title body />`, used only by these 3 pages.

- [ ] **Step 1: Create `src/components/PolicyPage.tsx`**

```tsx
export default function PolicyPage({ title, body }: { title: string; body: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl">{title}</h1>
      <p className="mt-4 whitespace-pre-line text-sm text-black/70">{body}</p>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/app/[locale]/privacy/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyPage from "@/components/PolicyPage";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return { title: getDictionary(params.locale).policies.privacyTitle };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = getDictionary(params.locale);
  return <PolicyPage title={dict.policies.privacyTitle} body={dict.policies.privacyBody} />;
}
```

- [ ] **Step 3: Create `src/app/[locale]/returns/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyPage from "@/components/PolicyPage";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return { title: getDictionary(params.locale).policies.returnsTitle };
}

export default function ReturnsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = getDictionary(params.locale);
  return <PolicyPage title={dict.policies.returnsTitle} body={dict.policies.returnsBody} />;
}
```

- [ ] **Step 4: Create `src/app/[locale]/terms/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyPage from "@/components/PolicyPage";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/lib/locale";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  return { title: getDictionary(params.locale).policies.termsTitle };
}

export default function TermsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const dict = getDictionary(params.locale);
  return <PolicyPage title={dict.policies.termsTitle} body={dict.policies.termsBody} />;
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/PolicyPage.tsx src/app/\[locale\]/privacy/page.tsx src/app/\[locale\]/returns/page.tsx src/app/\[locale\]/terms/page.tsx
git commit -m "feat: add privacy, returns and terms policy pages"
```

---

### Task 10: README / deployment docs

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# ELYSIDERM / Eirlys' Website

Static, trilingual (vi/en/ko) marketing + product website for ELYSIDERM, built with Next.js
(static export).

## Environment note (Windows + WSL)

This project lives inside WSL. Always run Node/npm from inside WSL, on the native Linux path —
running the Windows Node.exe against the `\\wsl.localhost\...` UNC path fails to build (webpack
can't resolve Next's internal loaders over UNC paths):

\`\`\`bash
wsl.exe -- bash -lc 'source ~/.nvm/nvm.sh && cd /home/<user>/Projects/elys_app && npm run dev'
\`\`\`

## Local development

\`\`\`bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_LEAD_FORM_ENDPOINT
npm run dev
npm run test                 # unit tests (vitest)
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
4. Environment variables (Production and Preview): `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` set to the
   deployed Google Apps Script Web App URL.
5. Trigger a deploy — every push to the connected branch redeploys automatically.

## Internationalization

- 3 locales: `vi` (default), `en`, `ko`, all under `/vi`, `/en`, `/ko`.
- `/` is a client-side redirect based on browser language (no Middleware, since static export
  doesn't run it) — see `src/app/page.tsx`.
- UI copy lives in `src/i18n/dictionaries/{vi,en,ko}.json`. Product copy is localized inline in
  `src/data/products.json` (`{ vi, en, ko }` per field).
- EN/KO copy in this repo was AI-translated — have a native speaker review it (especially Korean)
  before launch.

## Lead form data

Every "Tư vấn & Đặt mua ngay" / "Add to Cart" submission posts directly from the browser to the
Google Apps Script Web App URL above, which appends a row to a Google Sheet. See
`src/lib/leadForm.ts` for the payload shape.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Cloudflare Pages deployment and i18n notes"
```
