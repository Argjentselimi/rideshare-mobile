# Java 6 — PWA dhe lexim offline

## Zbatimi

- U shtuan manifesti RideShare AAB dhe ikonat PNG 192×192 dhe 512×512.
- Endpoint-i GET /api/udhetimet kthen vetëm ID-në, nisjen, destinacionin, orën, vendtakimin dhe vendet.
- Service worker ruan faqen offline, ikonat dhe përgjigjen publike të listës. Paneli, hyrja dhe kërkesat POST nuk ruhen.
- Faqja offline tregon burimin dhe kohën e kopjes. Butoni i rezervimit mbetet i çaktivizuar.
- Komponenti Pwa regjistron worker-in dhe ngroh kopjen pasi shfletuesi kontrollohet prej tij.

## Prova 1 — Manifesti dhe vizita online

**Hapat:** Hapa manifestin, ikonat dhe API-n, pastaj aplikacionin në Chrome me gjerësi 375 px. Kontrollova Service Worker dhe Cache Storage.

**Pritja:** Manifesti dhe ikonat hapen, API-ja jep tri udhëtime me gjashtë fushat publike, worker-i bëhet aktiv dhe faqja nuk ka lëvizje horizontale.

**Rezultati real:** Të gjitha kërkesat u përgjigjën me HTTP 200. API-ja dha tri udhëtime dhe saktësisht fushat destinacioni, id, nisja, ora, vende, vendtakimi. Cache Storage përmbante /offline.html, të dy ikonat dhe /api/udhetimet. Në ekranin 375 px u shfaqën tri karta; gjerësia e dokumentit ishte 375 px. Worker-i kontrollonte faqen.

## Prova 2 — Pa internet dhe pas rifreskimit

**Hapat:** Me Network Offline të aktivizuar në tab-in RideShare, hapa dhe rifreskova /, pastaj shtypa Rifresko listën.

**Pritja:** Shfaqen tri karta nga kopja e ruajtur, shënohet se lista mund të jetë e vjetruar dhe rezervimi mbetet i çaktivizuar.

**Rezultati real:** Shfletuesi ishte offline; pas navigimit dhe rifreskimit u shfaqën tri karta. Mesazhi tregoi se lista erdhi nga kopja e ruajtur, u shfaq koha e ruajtjes dhe butoni i rezervimit ishte i çaktivizuar.

## Prova 3 — Rikthimi i lidhjes dhe të dhënat e reja

**Hapat:** Në Neon ndryshova përkohësisht orën e udhëtimit ID 2 në 08:25. Riktheva lidhjen në RideShare dhe shtypa Rifresko listën. Pastaj verifikova rikthimin e vlerës fillestare.

**Pritja:** Lista e rifreskuar tregon 08:25, burimin server dhe kohën e re të ruajtjes; pas provës databaza kthehet te vlera fillestare.

**Rezultati real:** Neon kishte 08:18 para provës, megjithëse fletëudhëzimi dhe raporti i Javës 5 shënojnë 08:15. Për provën, ID 2 u ndryshua në 08:25; shfletuesi tregoi orën e re, burimin server dhe kohën e re të kopjes. Pastaj ora u rikthye dhe u verifikua si 08:18 në Neon dhe në aplikacion. Vlera ekzistuese u ruajt; mospërputhja me 08:15 duhet sqaruar me profesorin.

## Verifikime teknike

- npm.cmd run build përfundoi me sukses.
- Ikonat u verifikuan si PNG me përmasat e kërkuara.
- Asnjë sekret nuk u shtua në raport.