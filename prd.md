# RideShare — Product Requirements Document

## 1. Përmbledhje

RideShare është një aplikacion i thjeshtë për studentët që kërkojnë ose
publikojnë udhëtime drejt AAB. Versioni i parë fokusohet te gjetja e një
udhëtimi, shikimi i detajeve dhe dërgimi i një kërkese për vend.

## 2. Problemi

Studentët shpesh nuk e dinë shpejt nëse ka makinë me vende të lira, nga niset
ajo dhe në cilën orë. Informacioni i shpërndarë e bën të vështirë koordinimin
mes udhëtarit dhe shoferit.

## 3. Përdoruesit

### Udhëtari

Udhëtari kërkon një udhëtim për në AAB, kontrollon nëse ka vende të lira dhe
i dërgon shoferit kërkesë për një vend.

### Shoferi

Shoferi publikon vendin e nisjes, destinacionin, orën dhe numrin e vendeve të
lira. Në një version të ardhshëm ai mund të pranojë ose refuzojë kërkesat.

## 4. Qëllimi dhe MVP-ja

Qëllimi është që një udhëtar ta gjejë një udhëtim dhe të dërgojë kërkesë për
vend pa pasur nevojë për komunikim të paqartë jashtë aplikacionit.

MVP-ja përfshin vetëm këto veçori:

1. Lista e udhëtimeve për në AAB.
2. Faqja e detajeve të një udhëtimi.
3. Kërkesa për vend me statusin **“Në pritje”**.

## 5. Kërkesat funksionale

- Sistemi duhet të shfaqë vendin e nisjes, destinacionin, orën dhe vendet e
  lira për çdo udhëtim.
- Përdoruesi duhet të mund të hapë një udhëtim nga lista.
- Faqja e detajeve duhet të shfaqë edhe vendtakimin.
- Kur ka vende të lira, përdoruesi duhet të mund të zgjedhë **“Kërko vend”**.
- Pas kërkesës duhet të shfaqet statusi **“Në pritje”**.
- Kur nuk ka vende të lira, sistemi duhet të shfaqë **“Nuk ka vende të lira”**
  dhe të çaktivizojë ose fshehë veprimin për kërkesë.
- Përdoruesi duhet të mund të kthehet nga detajet te lista e udhëtimeve.

## 6. Kërkesat jofunksionale

- Faqet duhet të jenë të përdorshme në ekran telefoni.
- Teksti dhe veprimet kryesore duhet të jenë të kuptueshme në shqip.
- Ndërfaqja nuk duhet të ketë lëvizje horizontale në gjerësi tipike telefoni.
- Një ID udhëtimi që nuk ekziston duhet të shfaqë mesazh të qartë dhe lidhje
  për kthim te lista.

## 7. Rrjedha kryesore e përdorimit

Arta hap listën e udhëtimeve, zgjedh një udhëtim me vende të lira, hap
detajet, kontrollon vendtakimin dhe klikon **“Kërko vend”**. Aplikacioni
shfaq **“Në pritje”** dhe tregon se kërkesa duhet të pranohet nga shoferi.

## 8. Çfarë nuk përfshihet tani

Pagesat online, harta live, konfirmimi real nga shoferi dhe njoftimet
automatike nuk janë pjesë e MVP-së. Këto mund të planifikohen pas testimit të
rrjedhës bazë.

## 9. Kriteret e pranimit

- Përdoruesi mund të shohë listën e udhëtimeve.
- Përdoruesi mund të hapë detajet e një udhëtimi.
- Një udhëtim me vende të lira lejon kërkesën për vend.
- Kërkesa shfaqet me statusin **“Në pritje”**.
- Një udhëtim pa vende nuk lejon kërkesë të re.
- Një udhëtim që nuk ekziston shfaq faqe të kuptueshme gabimi.

## 10. Matja e suksesit

Versioni i parë konsiderohet i suksesshëm nëse një student mund të kalojë
rrjedhën **lista → detajet → kërkesa në pritje** pa ndihmë dhe pa u hutuar.
Prova kryesore bëhet me një koleg në pamjen e telefonit.
