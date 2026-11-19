# RideShare — Java 10

## Çfarë u ndërtua

Shtova kërkesa reale për vende në udhëtim. Udhëtari i kyçur krijon një kërkesë që ruhet në Neon. Shoferi pronar e sheh kërkesën dhe mund ta pranojë. Pranimi ndryshon statusin e kërkesës dhe numrin e vendeve në të njëjtin transaksion; kërkesa e pranuar përsëri nuk i ul vendet edhe një herë.

Faqja e udhëtimit rilexon gjendjen nga serveri menjëherë dhe pastaj çdo 5 sekonda. Leximet nuk mbivendosen; timer-i dhe kërkesa aktive pastrohen kur largohet nga faqja. Udhëtimi dhe kërkesat lexohen në një snapshot të vetëm të databazës. Në dështim shfaqet paralajmërimi i rilidhjes dhe ruhen vlerat e fundit në ekran. Rikthimi online nis lexim të menjëhershëm. Kërkesa nuk ruhet në `localStorage`.

Identiteti merret nga sesioni GitHub në server. Udhëtari sheh vetëm kërkesën e vet; listën e kërkesave e sheh vetëm shoferi i caktuar te udhëtimi. Rruga e pranimit kontrollon pronësinë në server. Tabela ka kufizim unik për çiftin udhëtim–udhëtar.

## Skema dhe përgatitja e udhëtimit prove

`aplikacioni/schema-java10.sql` krijon tabelën `udhetim_kerkesa`. Migrimi u aplikua dhe u verifikua në bazën Neon të projektit; kodi i migrimit është i sigurt për përsëritje.

Udhëtimi prove duhet të ketë shofer pronar të lidhur me profilin e tij GitHub. Paneli `/panel` tregon ID-në numerike të profilit. Për një udhëtim fiktiv, cakto atë ID si pronar dhe vendos dy vende në Neon; përdor një llogari tjetër GitHub si udhëtar. Mos përdor udhëtime ose të dhëna personale reale. ID-ja e pronarit nuk dërgohet nga shfletuesi si provë autorizimi.

Shembull për SQL Editor të Neon-it, pasi të kesh zgjedhur udhëtimin fiktiv: `UPDATE udhetimet SET shofer_id = '<ID nga Paneli>', vende = 2 WHERE id = '<ID e udhëtimit>';`

## Tri provat

Provat ndërmjet dy sesioneve të veçanta GitHub dhe ndërprerja e rrjetit nuk u kryen gjatë këtij zbatimi, ndaj nuk raportohen si të kaluara. Për t’i plotësuar me vëzhgime reale, përdor dy dritare me sesione të ndara dhe shëno ID-në e udhëtimit:

### Prova 1 — Kërkesa arrin te shoferi

Nis me dy vende. Nga llogaria e udhëtarit dërgo kërkesën. Pa rifreskim manual, pas leximit të radhës shoferi duhet ta shohë kërkesën në pritje; të dy ekranet duhet të tregojnë dy vende.

**Rezultati në këtë zbatim:** Rrjedha është lidhur me API-në e Neon-it; prova në dy sesione mbetet për t’u kryer.

### Prova 2 — Pranimi dhe dublikatat

Shoferi pranon kërkesën. Pas leximit të radhës të dy ekranet duhet të tregojnë “U pranua” dhe një vend. Dërgo sërish të njëjtin pranim dhe kontrollo që vendet të mbeten një. Me udhëtim prove, provo që kërkesa tjetër nuk pranohet kur vendet janë zero.

**Rezultati në këtë zbatim:** Pranimi dhe ulja e vendeve janë në transaksion; prova me dy përdorues dhe kontrolli në Neon mbeten për t’u kryer.

### Prova 3 — Offline dhe rilidhja

Me një kërkesë të re në pritje, vendose vetëm dritaren e udhëtarit në Offline te DevTools. Pas dështimit të leximit, ajo duhet të ruajë vlerat e fundit dhe të shfaqë paralajmërimin. Prano kërkesën nga shoferi online; rilidhe udhëtarin pa rifreskim manual dhe kontrollo që leximi i suksesshëm të tregojë pranimin dhe një vend.

**Rezultati në këtë zbatim:** Trajtimi i gabimit, paralajmërimi dhe rileximi pas rikthimit janë shtuar; simulimi real offline mbetet për t’u kryer.

## Skedarët

- `aplikacioni/schema-java10.sql` — tabela dhe indeksi i kërkesave.
- `aplikacioni/src/lib/gjendja-udhetimit.ts` — tipi i përgjigjes së leximit.
- `aplikacioni/src/lib/kerkesat.ts` — leximet, ruajtja dhe pranimi në server.
- `aplikacioni/src/app/api/udhetimet/[id]/gjendja/route.ts` — leximi pa cache.
- `aplikacioni/src/app/api/udhetimet/[id]/kerkesa/route.ts` — krijimi i kërkesës.
- `aplikacioni/src/app/api/udhetimet/[id]/kerkesa/[kerkesaId]/prano/route.ts` — pranimi i pronarit.
- `aplikacioni/src/components/GjendjaUdhetimit.tsx` — sinkronizimi periodik, veprimet dhe gjendja offline.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx` — paneli në faqen e udhëtimit.

## Verifikime dhe kufizime

- `npm.cmd run build` përfundoi me sukses; Next.js krijoi edhe tri API-routat e Java 10.
- Migrimi Java 10 u aplikua dhe u verifikua në Neon.
- Udhëtimet pa shofer pronar të caktuar nuk pranojnë kërkesa; cakto pronarin e provës në Neon.
- Dy provat me llogari të ndara dhe prova offline kërkojnë kryerje në shfletues.
- Nuk u bë commit ose push.

## Ndihma nga AI

AI ndihmoi në zbatimin e API-së, sinkronizimit periodik dhe migrimit. Duhet ta shpjegoj vetë pse kontrolli i pronarit bëhet në server dhe pse pranimi bashkë me uljen e vendeve ruhet në një transaksion.
