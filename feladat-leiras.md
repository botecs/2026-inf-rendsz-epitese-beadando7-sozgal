# Orvosi törzsadat kezelés

## Általános leírás

A cél, egy olyan szoftver tervezése és megvalósítása, amely képes segítséget nyújtani egy háziorvosi praxis beteg adminisztrációjához: betegek nyílvántartása, vizitek adminisztrációja, szűrővizsgálatokra való kiértesítés adminisztrációja.

## Felhasználási esetek

### Betegek nyílvántartása

A háziorvos betegeit regisztrálni kell a programban. A tárolandó információk: név, szül. dátum, taj szám, kórtörténet: felírt gyógyszerek és kezelések listája.

### Vizit menedzselése

A beteg megjelenik az orvosnál a TAJ kártyájával. A program listázza a kórtörénetet. Az orvosnak lehetősége van egy új mezőbe beírni a diagnózist és a felirt gyógyszerek és kezelések listáját. Az orvos, a beteg által hozott leleteket is mentheti a rendszerrel.

### Szűrőviszgálatok

Megadott feltételek alapján a rendszer listát készít azokról a páciensekről, akiknek szűrőviszgálatokon kell résztvenniük. Pl. évente 1-szer tüdőszűrő vizsgálat a 18 évesnél idősebbeknek, nemtől függetlenül. 2 évente prosztata viszgálat a 35 évesnél idősebb férfiaknak (nem röhög!). 3 évente mammográfiai vizsgálat a 45 évesnél idősebb nőknek. 5 évente általános vizsgálat mindenkinek. A lista alapján az asszisztensek levelet küldenek az érintetteknek (ezt a részt nem kell implementálni).


## Technológiai követelmények
*A feladat megoldásához a gyakorlatokon bemutatott technológiákat kell alkalmazni. A megoldásnak maradéktalanul teljesítenie kell a feladatkiírásban meghatározottakat.*

1. Frontend:
* Angular 21 keretrendszer,
*  Bootstrap CSS könyvtár.

2. Backend:
* TypeScript programozási nyelv,
* Express.js szerver,
* TypeORM,
* MySQL relációs adatbázis.

3. Teszt:
* Postman
