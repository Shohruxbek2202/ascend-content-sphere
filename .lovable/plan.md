## Maqsad
Til uchun URL prefikslari:
- `/` , `/blog`, `/about` … → **English** (default, prefiksz)
- `/uz`, `/uz/blog`, `/uz/about` … → **O'zbek**
- `/ru`, `/ru/blog`, `/ru/about` … → **Русский**

Har til uchun alohida URL bo'ladi — SEO uchun `hreflang` va sitemap'ga to'g'ri kiritiladi.

## O'zgarishlar

### 1. Routing (`src/App.tsx`)
Barcha marshrutlarni bir marta `AppRoutes` komponentiga chiqarib, uch marta ishlataman:
```tsx
<Routes>
  <Route path="/uz/*" element={<LangProvider lang="uz"><AppRoutes/></LangProvider>} />
  <Route path="/ru/*" element={<LangProvider lang="ru"><AppRoutes/></LangProvider>} />
  <Route path="/*"   element={<LangProvider lang="en"><AppRoutes/></LangProvider>} />
</Routes>
```
Admin panel prefikssiz qoladi (`/admin/*` faqat root'da).

### 2. `LanguageContext`
- URL prefiksidan tilni oladi (localStorage'dan emas).
- `setLanguage(lang)` — hozirgi path'ni saqlab, prefiksni almashtiradi va `navigate` qiladi.
- Yordamchi `localizedPath(path)` funksiyasi eksport qilinadi.

### 3. `LanguageSwitcher`
Til tanlanganda `/blog/foo` → `/uz/blog/foo` ga o'tadi.

### 4. Internal linklar
- **Header, Footer, PublicPageHero, CTABanner, BlogCard, RelatedPosts, NewsletterPopup, GlobalSearch, Hero, SubscribeSection** — `to` qiymatlarini `localizedPath()` orqali o'raymen.
- **Sahifa ichidagi `navigate()` chaqiruvlar** (Auth, Post, Subscribe va h.k.) — shu helper bilan yangilanadi.
- Post slug'lari o'zgarmaydi (til bo'yicha kontent bir xil DB'da, faqat interfeys tili farq qiladi).

### 5. SEO
- `index.html`'dagi `hreflang` allaqachon bor — canonical'ni per-route qilib qo'yaman (Helmet allaqachon ishlatilmasa, `SEOHead` komponentini yangilayman).
- **Sitemap edge function** (`supabase/functions/sitemap/index.ts`) — har URL uchun 3 ta til varianti (yoki `hreflang` alternates bilan bir yozuv). Bosh version: har sahifa 3 marta chiqadi.
- `robots.txt` — o'zgarmaydi.

### 6. 404 va noto'g'ri prefikslar
`/de/blog` kabi noma'lum prefikslar `NotFound`'ga tushadi (allaqachon `path="*"`).

## Nima o'zgarmaydi
- Kontent tarkibi (`title_en/uz/ru` maydonlari) — o'sha holida.
- Admin panel URL'lari.
- DB, edge functions'ning ichki logikasi.

## Xavflar
- Ko'p fayl tegiladi (~15-20). Har birida `<Link to="…">` qidiraman va `localizedPath` bilan o'rayman. Bir necha yurishda bo'lishi mumkin.
- Eski `localStorage` orqali til tanlovi endi ishlamaydi — URL yagona manba bo'ladi. Foydalanuvchi til tanlagan bo'lsa, birinchi kelishida `/` da qoladi, lekin `LanguageSwitcher`'da o'zgartira oladi. (Ixtiyoriy: birinchi tashrifda `Accept-Language` yoki eski localStorage'dan avto-redirect qilish mumkin.)

## Tasdiqlang
1. **Default (prefiksz) = English** — to'g'rimi, yoki `/en` ham bo'lsinmi?
2. **Birinchi tashrifda auto-redirect** qilaymi (masalan, brauzer tili ruscha bo'lsa `/ru` ga)? Yoki hech qachon avto-redirect qilinmasin?
