# Java 7: Provo, korrigjo dhe shpjego RideShare-in tënd

## Rasti im
Rasti im: P7-730, GitHub: Argjentselimi
Rasti: 1 — Lista dhe detajet

## Parashikimi
Pres që kur të hap ID 2 nga lista, faqja e detajeve të tregojë të njëjtin udhëtim. Një ID që nuk ekziston duhet të shfaqë 404. Me 0 vende, kërkesa nuk duhet të jetë aktive. Kur lista është bosh, duhet të shfaqet mesazhi përkatës dhe një mundësi për rifreskim.

## Dy probleme
1. Lista bosh tregonte mesazhin se nuk kishte udhëtime, por nuk kishte veprim për ta rifreskuar listën.
2. Faqja e detajeve nuk e shfaq ID-në në përmbajtjen e dukshme; ID-ja shihet vetëm në adresë, ndaj konfirmimi vizual i udhëtimit është më i paqartë.

## Ndryshimi i ri
Ndryshimi i ri: U shtua lidhja “Rifresko listen” në gjendjen kur lista nuk ka udhëtime.

## Korrigjimi
Korrigjimi: U shtua lidhja “Rifresko listen” në gjendjen kur lista është bosh.
Arsyeja: Pa këtë veprim, përdoruesi nuk mund ta riprovonte ngarkimin nga ekrani bosh.
Skedari: aplikacioni/src/app/page.tsx

Para: https://github.com/Argjentselimi/rideshare-mobile/commit/ff9c4994cc059e719eb3cbac20c067ec79151ea0
Pas: https://github.com/Argjentselimi/rideshare-mobile/commit/dc3d5cdd4805d64f646bd06b819292d224c28221

## Prova 1
Hapat: U hapën `/`, `/udhetimi/2`, `/udhetimi/2/kerkesa` dhe `/udhetimi/999999`.
Pritshmëria: Lista dhe detajet i referohen të njëjtit udhëtim; kërkesa shënohet si simulim dhe ID-ja që mungon kthen 404.
Vëzhgimi: Lista, detajet dhe kërkesa u përgjigjën me HTTP 200. Faqja e kërkesës shfaqi “Simulim: Në pritje”. ID 999999 u përgjigj me HTTP 404. Nuk u krye rezervim dhe nuk u ndryshuan të dhënat.

## Prova 2
Hapat: Për një kontroll lokal, query-ja e leximit u ndryshua përkohësisht që të kthente zero rreshta. U hap `/`, pastaj skedari i query-së u rikthye byte për byte.
Pritshmëria: Faqja shfaq mesazhin se nuk ka udhëtime dhe lidhjen “Rifresko listen”.
Vëzhgimi: Faqja u përgjigj me HTTP 200 dhe shfaqi mesazhin e listës bosh bashkë me lidhjen “Rifresko listen”. Query-ja nuk shkroi në databazë dhe skedari origjinal u rikthye.

## Prova 3
Hapat: Hyrja u ndryshua nga ID 2 në ID 3. U hapën `/udhetimi/3` dhe `/udhetimi/3/kerkesa`.
Pritshmëria: Me 0 vende, veprimi i kërkesës është joaktiv dhe faqja nuk premton rezervim.
Vëzhgimi: Detajet u përgjigjën me HTTP 200 dhe butoni ishte i çaktivizuar. Faqja e kërkesës tregoi se nuk kishte vende të lira.

## Ndihma nga AI
AI ndihmoi në shqyrtimin e kodit, gjetjen e mungesës së veprimit të rifreskimit, zbatimin e korrigjimit dhe kontrollet lokale HTTP. Parashikimi më sipër është pritshmëria për sjelljen e aplikacionit.

## Ndryshimi i hyrjes
Në provën 3 u përdor ID 3 në vend të ID 2; udhëtimi ID 3 ka 0 vende.