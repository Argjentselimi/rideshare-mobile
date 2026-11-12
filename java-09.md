# RideShare — Java 9

## Çfarë ndërtova

Shtova ruajtjen e një udhëtimi te të preferuarat për përdoruesin e kyçur. Preferimi lidhet me ID-në e GitHub-it të profilit dhe ID-në e udhëtimit; nuk krijon rezervim dhe nuk ndryshon vendet e lira.

Pas klikimit, ylli dhe numri përditësohen menjëherë, butoni çaktivizohet gjatë pritjes dhe suksesi shfaqet vetëm pas përgjigjes së serverit. Në gabim, ylli dhe numri kthehen në vlerat e mëparshme dhe shfaqet mundësia për riprovim. API-ja përdor `INSERT ... ON CONFLICT DO NOTHING`, ndërsa databaza zbaton një çelës unik për çiftin përdorues–udhëtim.

## Skema dhe databaza

`aplikacioni/schema-java09.sql` krijon tabelën `udhetimet_preferuara`, me lidhje te `profilet` dhe `udhetimet`. Migrimi u aplikua në Neon-in e konfiguruar në projekt. Rreshtat e përdoruesit prove dhe preferimet e përkohshme u fshinë pas kontrolleve.

## Tri provat

Provat u kryen në Chrome headless kundrejt aplikacionit lokal dhe Neon-it, me sesion dhe profil prove.

### Prova 1 — Ruajtja dhe rifreskimi

**Hapat:** Nisa me 0 preferime, ruajta udhëtimin me ID 2 dhe rifreskova faqen.

**Rezultati real:** Gjatë pritjes, ylli u mbush dhe numri u bë 1. Pas konfirmimit të serverit, butoni tregoi gjendjen e ruajtur. Pas rifreskimit, udhëtimi mbeti i ruajtur dhe numri ishte 1.

### Prova 2 — Refuzimi dhe riprovimi

**Hapat:** Për udhëtimin me ID 1, ndala kërkesën përpara se të arrinte te API-ja dhe ktheva përgjigje prove 503. Më pas e lejova kërkesën e dytë të shkonte te serveri.

**Rezultati real:** Gjatë pritjes, numri u rrit përkohësisht në 2 dhe butoni u çaktivizua. Pas refuzimit, ylli u zbraz, numri u kthye në 1 dhe u shfaq mesazhi i gabimit. Riprovimi ruajti preferimin; numri u bë 2.

### Prova 3 — Klikime të shpejta dhe dublikatat

**Hapat:** Për udhëtimin me ID 3, mbajta kërkesën në pritje dhe klikova edhe dy herë. Pas suksesit, dërgova edhe dy kërkesa të tjera për të njëjtin preferim dhe rifreskova faqen.

**Rezultati real:** Butoni i çaktivizuar lejoi vetëm një kërkesë gjatë pritjes. Kërkesat e përsëritura të API-së mbetën idempotente; pas rifreskimit numri i preferimeve ishte 3, me vetëm një rresht për atë çift përdorues–udhëtim.

## Skedarët

- `aplikacioni/src/components/PreferimiUdhetimit.tsx` — butoni, gjendja optimiste, pritja, rikthimi dhe riprovimi.
- `aplikacioni/src/app/api/udhetimet/[id]/preferim/route.ts` — ruajtja në server për përdoruesin e kyçur.
- `aplikacioni/src/lib/preferimet.ts` — leximi i preferimit dhe numrit për përdoruesin aktual.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx` dhe `aplikacioni/src/app/globals.css` — shfaqja dhe stilet.
- `aplikacioni/schema-java09.sql` — migrimi i databazës.
- `java-09.md` — ky raport.

## Verifikime dhe kufizime

- `npm.cmd run build` përfundoi me sukses.
- Tri rastet u provuan në ndërfaqe kundrejt Neon-it; përdoruesi prove dhe rreshtat e tij u pastruan.
- Migrimi Java 9 kërkon tabelat ekzistuese `profilet` dhe `udhetimet` nga javët e mëparshme.
- Heqja e preferimit ishte zgjerim opsional dhe nuk u zbatua.
- Prova me koleg dhe kontrolli i përdoruesit të dytë mbeten për t'u bërë në klasë.
- Pas commit/push-it, duhet dorëzuar formulari Java 9 me linkun e repository-t dhe lexuar përgjigjja automatike në Issue.

## Ndihma nga AI

AI ndihmoi në leximin e kërkesave, zbatimin e ndërfaqes/API-së dhe përgatitjen e migrimit. Kontrollet e sjelljes u ekzekutuan me profil prove. Duhet ta shpjegoj vetë pse ylli i mbushur gjatë pritjes nuk provon ruajtjen dhe si migrimi parandalon kopjet.
