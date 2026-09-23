# ELYSIDERM / Eirlys' — Website mỹ phẩm

Website giới thiệu & bán hàng cho ELYSIDERM (master brand) / Eirlys' (sub-brand sản phẩm) —
dược mỹ phẩm cao cấp, định vị "Luxury Korean Dermocosmetic". Site tĩnh, tối ưu SEO, đa ngôn ngữ
(Việt / Anh / Hàn), responsive (mobile + desktop), không có backend/CMS — mọi lượt "Mua ngay" /
"Tư vấn ngay" đổ dữ liệu về một Google Sheet để chủ shop xem.

Thiết kế tham chiếu (đã cập nhật):
- `header.png` — header/nav dùng chung cho mọi trang.
- `design.png` — trang chủ đầy đủ.
- `detail.png` — trang chi tiết sản phẩm đầy đủ.
- `BRAND GUIDELINE.pdf` — hệ nhận diện thương hiệu.

Mục tiêu: bám sát thiết kế ở trên về bố cục, nội dung từng section và các thành phần UI (badge,
breadcrumb, tab, rating...). Phần nào thiết kế thể hiện hành vi "thương mại điện tử" (giỏ hàng, số
lượng...) được xử lý theo hướng đơn giản hoá vì site không có backend đặt hàng — xem mục "Hành vi
thương mại điện tử trong thiết kế" bên dưới.

## Tech stack

- **Next.js (App Router)** với `output: 'export'` → build ra HTML/CSS/JS tĩnh hoàn toàn, không cần Node server khi chạy.
- **Tailwind CSS** cho styling, responsive theo mobile-first (breakpoint mặc định của Tailwind), cấu hình theo design system bên dưới.
- **TypeScript**.
- **i18n tự viết** (không dùng next-intl) — lý do: `output: 'export'` không chạy Middleware, nên
  không thể tự động phát hiện/redirect ngôn ngữ phía server. Giải pháp: tự route theo
  `/[locale]/...` và detect ngôn ngữ ở client cho trang gốc `/` (xem mục Internationalization).
- **Không có backend/DB.** Dữ liệu sản phẩm là file tĩnh trong repo; lead form gọi thẳng tới Google Apps Script Web App (client-side fetch).
- **Deploy**: push lên GitHub → Cloudflare Pages build tự động.
  - Build command: `next build`
  - Output directory: `out`
  - Vì dùng static export, **không dùng** các API cần Node runtime (Image Optimization mặc định, Route Handlers động, Middleware, ISR). Dùng ảnh đã tối ưu sẵn + khai báo `width`/`height` thay vì phụ thuộc `next/image` optimizer.

## Lệnh thường dùng

```bash
npm run dev       # chạy dev server
npm run build     # build static export ra thư mục out/
npm run test      # chạy unit test (vitest)
npm run lint      # lint
```

**Lưu ý môi trường (Windows + WSL):** thư mục dự án nằm trong WSL nhưng được truy cập từ Windows
qua UNC path (`\\wsl.localhost\Ubuntu\...`). Next.js/webpack **không build được** khi chạy bằng
Node của Windows trên đường dẫn UNC này (lỗi `Can't resolve 'next-app-loader'` và tương tự). Luôn
chạy `npm`/`npx`/`node` của dự án này **bên trong WSL**, trên đường dẫn Linux gốc
(`/home/<user>/Projects/elys_app`), ví dụ:

```bash
wsl.exe -- bash -lc 'source ~/.nvm/nvm.sh && cd /home/<user>/Projects/elys_app && npm run build'
```

## Internationalization (VI / EN / KO)

- 3 ngôn ngữ: **Tiếng Việt (mặc định)**, **English**, **한국어**.
- Routing: mọi trang nội dung nằm dưới `/[locale]/...` với `locale ∈ {vi, en, ko}` — kể cả tiếng
  Việt cũng có prefix `/vi/...` (không dùng "default locale không prefix", để tránh phải dùng
  Middleware — thứ không chạy được với static export).
- `/` (route gốc, không có locale) chỉ là một trang **redirect phía client**: đọc
  `navigator.language`, nếu khớp `en`/`ko` thì chuyển tới `/en` hoặc `/ko`, mặc định còn lại chuyển
  tới `/vi`. Trang này không mang nội dung SEO thật — nội dung thật nằm ở `/vi`, `/en`, `/ko`.
- Bản dịch lưu trong `src/i18n/dictionaries/{vi,en,ko}.json` (một object phẳng theo namespace,
  ví dụ `nav.home`, `home.hero.title`...), truy xuất qua `getDictionary(locale)` +
  hàm `t(dict, key)`.
- **Dữ liệu sản phẩm đa ngôn ngữ**: các trường hiển thị cho người dùng (`name`,
  `shortDescription`, `description`, nội dung hướng dẫn sử dụng, review...) là object
  `{ vi, en, ko }` ngay trong `products.json`, không tách file riêng theo locale — giữ 1 sản phẩm
  = 1 entry duy nhất, dễ đối chiếu khi sửa.
- **Tên hoạt chất/INCI** (`Niacinamide`, `Alpha-Arbutin`...) giữ nguyên, **không dịch** theo
  locale — đúng thông lệ ngành mỹ phẩm quốc tế.
- Slug route (`/vi/collections`, `/en/collections`, `/ko/collections`...) dùng **chung 1 bộ slug
  tiếng Anh** cho cả 3 locale (không dịch URL) để đơn giản hoá routing; nội dung trang vẫn dịch đầy
  đủ theo locale. Slug sản phẩm (`/collections/[slug]`) cũng cố định, không đổi theo locale.
- SEO: mỗi trang khai báo `alternates.languages` (hreflang) trỏ tới 3 phiên bản locale +
  `x-default` trỏ tới `/vi`.
- **Bản dịch EN/KO trong lần triển khai đầu tiên là do AI dịch** (không phải bản dịch chuyên
  nghiệp) — cần người bản ngữ rà soát lại nội dung tiếng Hàn trước khi site lên production chính
  thức.

## Cấu trúc trang (routes)

Toàn bộ nằm dưới `/[locale]/...`:

- `/[locale]` — Trang chủ.
- `/[locale]/collections` — Danh sách toàn bộ sản phẩm ("Bộ sưu tập").
- `/[locale]/collections/[slug]` — Chi tiết sản phẩm.
- `/[locale]/about` — "Về Elysiderm" (tầm nhìn, sứ mệnh, giá trị cốt lõi).
- `/[locale]/technology` — "Công nghệ & Thành phần" (trang tổng quan khoa học/công nghệ của
  thương hiệu — khác với tab "Công nghệ & Thành phần" trong từng trang sản phẩm, vốn nói riêng về
  sản phẩm đó).
- `/[locale]/why-elysiderm` — "Vì sao chọn Elysiderm".
- `/[locale]/contact` — "Liên hệ".
- `/[locale]/privacy`, `/[locale]/returns`, `/[locale]/terms` — 3 trang chính sách tối giản, để
  liên kết footer không bị chết (nội dung ngắn gọn, không cần chi tiết pháp lý đầy đủ ở giai đoạn
  này).
- `/` — chỉ redirect client-side, không phải trang nội dung (xem mục Internationalization).

Mỗi route sản phẩm dùng `generateStaticParams` (kết hợp `locale` × `slug`) để pre-render toàn bộ
tại build time.

## Header & Footer (theo `header.png` / `design.png`)

**Header** (dùng chung mọi trang, responsive: menu rút gọn thành hamburger trên mobile):
- Logo 2 dòng: "ELYSIDERM" + dòng phụ theo locale ("VIỆT NAM" / "VIETNAM" / "베트남").
- Nav: Trang chủ · Về Elysiderm · Bộ sưu tập · Công nghệ & Thành phần · Vì sao chọn Elysiderm · Liên hệ (nhãn dịch theo locale, route giữ nguyên slug).
- Bộ chuyển ngôn ngữ: VN / EN / KO (giữ nguyên slug trang hiện tại, chỉ đổi phần `[locale]` trong URL).
- Nút CTA "Tư vấn ngay" (dịch theo locale).
- **Không có icon tài khoản/đăng nhập** — site không có hệ thống tài khoản người dùng.

**Footer**: 4 cột trên desktop, xếp dọc trên mobile — (1) Giới thiệu ngắn + social icon, (2) "Khám phá" (link tới About/Collections/Technology/Why us), (3) "Chính sách & Hỗ trợ" (link Privacy/Returns/Terms), (4) "Trung tâm chăm sóc" (địa chỉ, hotline, email, giờ làm việc — thông tin thật cần chủ shop cung cấp, hiện để placeholder rõ ràng). Dòng cuối: copyright + link chính sách.

## Dữ liệu sản phẩm

Không dùng CMS. Sản phẩm khai báo trong `src/data/products.json`. Có 2 mức field:

**Field bắt buộc** (mọi sản phẩm phải có, phục vụ card sản phẩm + trang danh sách):

```json
{
  "slug": "eirlys-alpha-melight-intensive-cream",
  "collection": "alpha-melight",
  "routineStep": 2,
  "price": 680000,
  "images": ["/images/products/alpha-melight-intensive-cream-1.jpg"],
  "featured": true,
  "rating": 5.0,
  "reviewCount": 128,
  "name": { "vi": "Eirlys' Alpha-Melight™ Intensive Cream", "en": "...", "ko": "..." },
  "shortDescription": { "vi": "...", "en": "...", "ko": "..." }
}
```

**Field mở rộng** (optional — chỉ điền đầy đủ cho các sản phẩm "hero" xuất hiện chi tiết như
trong `detail.png`; sản phẩm khác vẫn hiển thị đúng nhưng bỏ qua các khối UI tương ứng nếu thiếu
dữ liệu): `originalPrice`, `krwReferencePrice`, `soldCount`, `stockCount`, `badges` (mã cố định,
nhãn hiển thị tra theo dictionary, ví dụ `"best-seller"`, `"korean-patent-formula"`),
`description` (dài, đa ngôn ngữ), `philosophyQuote` (đa ngôn ngữ), `keyActives` (mảng
`{ name, percentage?, description }` đa ngôn ngữ phần mô tả), `fullIngredientList` (mảng string,
không dịch), `usageSteps` (mảng đa ngôn ngữ), `ingredientStats` (mảng `{ label, value }` đa ngôn
ngữ phần label), `reviews` (mảng review tĩnh, xem mục dưới).

Sản phẩm cùng `collection` và có `routineStep` tạo thành một "liệu trình" — hiển thị ở block
"Korean Daily Routine" trên trang chi tiết, sắp xếp theo `routineStep` tăng dần.

**Bundle/combo**: khai báo riêng trong `src/data/bundles.json`, mỗi bundle có `id`, `collection`
(liên kết tới sản phẩm cùng collection), `name` (đa ngôn ngữ), `bundlePrice`, `discountLabel` (đa
ngôn ngữ). Trang chi tiết sản phẩm hiển thị banner bundle nếu tồn tại bundle khớp `collection` của
sản phẩm đang xem.

**Reviews**: tĩnh, do chủ shop cung cấp trước (không có hệ thống gửi review thật — xem mục dưới),
mỗi review có `author`, `rating`, `text` (đa ngôn ngữ), hiển thị trong tab "Đánh giá thực tế".
`reviewCount` trên sản phẩm là số hiển thị marketing, không nhất thiết bằng số phần tử trong mảng
`reviews` (đó là toàn bộ số liệu, review chỉ hiển thị vài cái tiêu biểu).

Khi thêm/sửa sản phẩm: sửa trực tiếp file JSON này, không tạo cơ chế quản trị nội dung riêng
(không cần thiết cho quy mô site hiện tại — YAGNI).

## Hành vi thương mại điện tử trong thiết kế (quyết định phạm vi)

Thiết kế `detail.png` có các yếu tố trông giống thương mại điện tử thật: nút "Thêm vào giỏ", bộ
đếm số lượng, điểm thành viên "E-Member", số lượng tồn kho giảm dần. Vì site **không có backend
đặt hàng/thanh toán**, các yếu tố này được triển khai như sau:

- Nút "Thêm vào giỏ" và "Tư vấn & Đặt mua ngay" đều dẫn tới **cùng một hành động**: cuộn tới/mở
  form tư vấn (`LeadForm`) với sản phẩm được điền sẵn — không có giỏ hàng, không có checkout thật.
- Bộ đếm số lượng là UI tĩnh (client state trong component, không ảnh hưởng gì tới đơn hàng thật)
  — chỉ để đúng bố cục thiết kế, giá trị số lượng được gửi kèm trong lead form như một ghi chú.
- `soldCount`, `stockCount`, điểm loyalty (`krwReferencePrice`/loyalty note) là **nội dung
  marketing tĩnh** do chủ shop cung cấp trong `products.json`, không phải số liệu tính toán thời
  gian thực.
- Nếu sau này cần giỏ hàng/thanh toán thật, đây là thay đổi kiến trúc lớn (cần backend) — phải bàn
  lại trước khi làm, không nằm trong phạm vi hiện tại.

## Thu thập lead (Mua ngay / Tư vấn ngay)

- Mọi form (trang chủ, trang chi tiết sản phẩm, trang liên hệ) dùng chung 1 component, submit bằng `fetch` **client-side** thẳng tới URL Google Apps Script Web App đã deploy sẵn (ghi thẳng vào 1 Google Sheet cố định).
- Trường dữ liệu: họ tên, số điện thoại, email, sản phẩm quan tâm (chọn từ danh sách sản phẩm/collection, có tuỳ chọn "Khác"), ghi chú, ngôn ngữ đang dùng (`locale`), nguồn (trang nào submit).
- Vì Apps Script Web App chỉ **ghi** (không đọc dữ liệu nhạy cảm), gọi thẳng từ client là chấp nhận được và đơn giản nhất cho static site — không cần giấu qua serverless function.
- UI hiển thị trạng thái thành công/lỗi ngay tại chỗ, không redirect sang trang khác.
- URL Apps Script Web App lưu trong biến môi trường `NEXT_PUBLIC_LEAD_FORM_ENDPOINT` (build-time, vì static export không có server để inject runtime env).

## SEO

- Dùng Next.js Metadata API khai báo `title`/`description`/OG image riêng cho từng trang, từng
  sản phẩm, **và từng locale**.
- `alternates.languages` (hreflang) trên mọi trang, trỏ tới bản `vi`/`en`/`ko` tương ứng +
  `x-default` → bản `vi`.
- JSON-LD: `Organization` ở layout gốc mỗi locale, `Product` (giá, ảnh, mô tả, rating nếu có) ở
  từng trang chi tiết sản phẩm.
- `sitemap.xml` và `robots.txt` sinh tự động qua Next.js file-based metadata (`app/sitemap.ts`, `app/robots.ts`), liệt kê đủ 3 locale × toàn bộ route.
- HTML semantic, heading hierarchy rõ ràng (1 `h1` mỗi trang), alt text ảnh viết theo locale có ngữ cảnh (không nhồi từ khóa).
- Ảnh sản phẩm nén trước khi đưa vào repo, luôn khai báo `width`/`height` để tránh layout shift.

## Responsive

- Mobile-first, dùng breakpoint mặc định của Tailwind (`sm`/`md`/`lg`/`xl`).
- Nav desktop đầy đủ ở `md:` trở lên; dưới `md` thu gọn thành menu hamburger (trạng thái mở/đóng
  là client state, không ảnh hưởng SEO vì nội dung nav vẫn nằm trong DOM).
- Grid sản phẩm: 1 cột (mobile) → 2 cột (`sm`) → 3–4 cột (`lg`) tuỳ trang.
- Trang chi tiết sản phẩm: layout 2 cột (ảnh trái/thông tin phải) trên `md:` trở lên, xếp dọc trên mobile.

## Design system (theo `BRAND GUIDELINE.pdf`)

**Màu:**
| Vai trò | Mã màu |
|---|---|
| Vàng ánh kim (accent chính) | `#FFC871` |
| Gradient vàng (kim loại) | `#C3A767 → #EDCA96 → #FFC871` |
| Đen tinh tế (text, tương phản) | `#000000` |
| Trắng ngà (nền chủ đạo) | `#FBF6F2` |

Thứ tự ưu tiên dùng màu: (1) vàng thương hiệu/gradient vàng làm điểm nhấn nhận diện, (2) trắng ngà làm nền chính tạo cảm giác sạch/tinh khiết, (3) đen chỉ dùng cho typography và tạo tương phản — không dùng đen làm nền lớn (ngoại trừ banner CTA tối trong trang chủ, đúng như thiết kế).

**Typography:**
- Heading: **Rosario** (serif, cảm giác thanh lịch/vượt thời gian).
- Body: **Montserrat** (sans-serif, hiện đại/chính xác).
- Cả hai font đều không có bộ ký tự Hangul. Không cần xử lý riêng theo locale: khai báo fallback
  chuẩn trong Tailwind (`ui-serif/serif` cho heading, `ui-sans-serif/system-ui/sans-serif` cho
  body) — trình duyệt tự động dùng font hệ thống cho từng ký tự Hangul mà font chính không hỗ trợ
  (hành vi fallback font theo từng glyph là mặc định của CSS, không cần JS/logic thêm).

**Tone & voice:**
- Thanh lịch, tối giản, khoa học, đáng tin cậy — không phóng đại.
- **Tránh** các cụm như "trắng thần tốc", "trắng bật tone", "trắng cấp tốc".
- **Ưu tiên** dùng: Brightening, Radiance, Healthy Glow, Skin Confidence, Skin Harmony (và tương đương ở bản EN/KO).
- Đối tượng mục tiêu: phụ nữ 28–45 tuổi, sự nghiệp ổn định, ưu tiên chất lượng và nền tảng khoa học hơn xu hướng ngắn hạn.

## Nguyên tắc chung

- Không thêm CMS, database, hay tài khoản đăng nhập — ngoài phạm vi site tĩnh hiện tại.
- Không xây giỏ hàng/thanh toán thật (xem mục "Hành vi thương mại điện tử trong thiết kế").
- Mọi thay đổi ảnh hưởng tới cách build/deploy (đổi sang SSR, thêm API route động, đổi nền tảng hosting, thêm Middleware) cần xác nhận trước vì sẽ phá vỡ giả định static export trên Cloudflare Pages.
- Bản dịch EN/KO ban đầu do AI tạo — cần rà soát trước khi công bố chính thức (đặc biệt tiếng Hàn).
