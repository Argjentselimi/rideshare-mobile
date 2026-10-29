# Java 7: Provo, korrigjo dhe shpjego RideShare-in tënd

> Draft pune: parashikimin personal dhe demonstrimin në çift duhet t’i plotësosh vetë para dorëzimit. Provat lokale HTTP më poshtë u kryen nga asistenti dhe janë shënuar si të tilla.

## Rasti im

**Rasti 1 — Lista dhe detajet.** U kontrolluan lista, detajet e ID 2, simulimi i kërkesës dhe një ID që nuk ekziston. ID 3 u përdor si hyrje alternative me 0 vende.

## Parashikimi fillestar

Nuk u regjistrua para korrigjimit. Shkruaje këtu vetë, me fjalët e tua; udhëzimi i Java 7 kërkon që parashikimi fillestar të bëhet pa AI.

## Dy probleme ose paqartësi

1. **Lista bosh nuk ofronte veprim për rifreskim.** Në degën e listës bosh shfaqej vetëm mesazhi se nuk kishte udhëtime. U shtua lidhja “Rifresko listen”.
2. **ID-ja nuk shfaqet në përmbajtjen e faqes së detajeve.** ID-ja përdoret në adresën e faqes, por përdoruesi nuk e sheh në ekran; kjo e bën më të vështirë të konfirmojë vizualisht se është i njëjti udhëtim. Nuk u ndryshua në këtë korrigjim.

## Korrigjimi

**Skedari:** `aplikacioni/src/app/page.tsx`

Në degën kur lista është bosh u shtua lidhja “Rifresko listen”, e cila e hap përsëri faqen dinamike të listës.

**Para:** https://github.com/Argjentselimi/rideshare-mobile/commit/ff9c4994cc059e719eb3cbac20c067ec79151ea0
**Pas:** https://github.com/Argjentselimi/rideshare-mobile/commit/dc3d5cdd4805d64f646bd06b819292d224c28221

## Provat

Këto janë kontrolle lokale HTTP të kryera nga asistenti. Nuk janë demonstrim personal i studentit.

### Prova 1 — Rrjedha e udhëtimit dhe ID-ja që mungon

**Hapat:** U hapën `/`, `/udhetimi/2`, `/udhetimi/2/kerkesa` dhe `/udhetimi/999999`.

**Pritshmëria:** Lista dhe detajet i referohen të njëjtit udhëtim; kërkesa tregohet si simulim, ndërsa ID-ja që mungon kthen 404.

**Vëzhgimi:** Lista, detajet dhe kërkesa u përgjigjën me HTTP 200. Faqja e kërkesës shfaqi “Simulim: Në pritje”. ID 999999 u përgjigj me HTTP 404. Nuk u krye rezervim dhe nuk u ndryshuan të dhënat.

### Prova 2 — Korrigjimi i listës bosh

**Hapat:** Për një kontroll lokal, u ndryshua përkohësisht query-ja e leximit që të kthente zero rreshta, u hap `/`, pastaj u rikthye skedari i query-së byte për byte.

**Pritshmëria:** Shfaqet mesazhi se nuk ka udhëtime dhe lidhja “Rifresko listen”.

**Vëzhgimi:** Faqja u përgjigj me HTTP 200; mesazhi i listës bosh dhe lidhja “Rifresko listen” u shfaqën. Query-ja nuk shkroi në databazë dhe skedari origjinal u rikthye.

### Prova 3 — Hyrje alternative: 0 vende

**Hapat:** U hapën `/udhetimi/3` dhe `/udhetimi/3/kerkesa`, duke kaluar nga ID 2 te ID 3.

**Pritshmëria:** Me 0 vende, kërkesa nuk duhet të duket aktive dhe faqja nuk duhet të premtojë rezervim.

**Vëzhgimi:** Detajet u përgjigjën me HTTP 200 dhe butoni ishte i çaktivizuar; faqja e kërkesës tregoi se nuk kishte vende të lira.

## Ndryshimi i hyrjes

Në provën 3, hyrja ndryshoi nga ID 2 te ID 3; ID 3 ka 0 vende. Në provën 2 u simulua lista bosh me një query vetëm-lexuese, pa ndryshuar të dhënat.

## Ndihma nga AI

AI ndihmoi në shqyrtimin e kodit, identifikimin e mungesës së rifreskimit në listën bosh, zbatimin e korrigjimit dhe kontrollet lokale HTTP. Rezultatet e mësipërme janë shënuar si kontrolle të asistentit. Parashikimi fillestar nuk është shkruar nga AI.

## Dorëzimi në repository-n e lëndës

Issue-i për Java 7 nuk është krijuar ende: mungon adresa e repository-t të lëndës. Pas krijimit, vendose këtu lidhjen e Issue-it dhe shëno përgjigjen e botit. Nëse kërkohet korrigjim, bëje push dhe komento “rikontrollo” te i njëjti Issue.