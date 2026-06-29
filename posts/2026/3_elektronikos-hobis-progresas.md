slug: elektronikos-hobis-progresas
header: Elektronikos hobis - progresas
subheader: kaip pasistūmėta per pusantrų metų
date: 2026-06-29
tags: Pico,RC

Sugedo prieš pusantrų metų sutaisytas RC tankas - teko tą patį darbą atlikti antrąkart, tik šį kartą su pusantrų metų papildoma patirtimi. Retrospektyva.

# Pirmas blynas

![Tanko logic board v1](images/old_tank_board.avif)

Veikė ~~puikiai~~ ~~patenkinamai~~ pakenčiamai, kurį laiką. Keletas pastebėjimų:
1. Originali baterija - Li-Ion 2S. Tankas veikia 15-20 minučių.
1. Baterijos įtampos nuskaitymo nėra, prijungta per [H tiltą](https://en.wikipedia.org/wiki/H-bridge) tiesiai į variklius, tad pilnai įkrauta (8.4 V) - tankas važiuoja greičiau, artėjant prie išsikrovimo (6.4 V - 6.6 V) - lėčiau. Vienintelis indikatorius, kad reikėtų įkrauti - keletą kartų tikrai over discharged buvo.
1. Pico 5 V gauna per [LM7805](https://www.lemona.lt/search.html?query=7805) voltage regulator - ~68% efficiency, trečdalis energijos Pico, LED'ams ir bokštelio varikliukams paverčiama į karštį.
1. Logic board išdėstymas - tiesiog ant [breadboard](https://en.wikipedia.org/wiki/Breadboard) prisijungi su [DuPont kabeliais](https://en.wikipedia.org/wiki/Jump_wire) komponentus ir viską perkeli ant [perfboard](https://en.wikipedia.org/wiki/Perfboard). Ant perfboard su naujais komponentais, breadboard palieki sujungtą, nes tai - vienintelė elektrinė schema. :) DuPont kabeliai *production'e* - tingėjau lituoti normalius laidus.
1. Datasheet: continuous current, peak current - buvo laikoma kaip rekomendacijos, jei amperų mažiau nei maximum current ir prijungus veikia - **it is fine**. Spoiler alert - **it wasn't fine**.
1. Software architektūra - veikia puikiai, grįžus ir po metų susigaudyti lengva. Tiesiog kopijavau [React](https://react.dev/) modelį. Vienintelė JS biblioteka, kuri man patinka ir veikia gerai.

Gana mid fr fr rezultatas no cap skibidi.

# Antras dublis

1. Baterija - pakeičiau talpesne LiPo 2S. LiPo dar namų nesudegino, gan pigios, patvarios. [HRB](https://hrb-power.com/) gamintojas, mid tier brand, perku aliexpress oficialioje parduotuvėje, siunčia iš Vokietijos - visąlaik naujos, storage voltage gal 0.1 V per didelė nuo idealios, bet niekada nesiunčiamos pilnai įkrautos/iškrautos, rekomenduoju. Deklaruojamas 100C discharge rate mano LiPo 2S 2200 mAh, turiu įtarimų, gan optimistiškas, bet čia yra 220 amperų, tiek net pasirinktas XT60 connector neatlaikys, vienu žodžiu amperų pakankamai gali atiduoti. Dabar važinėti galima apie 150 minučių.

	Taip pat pakeičiau ir abu vikšrų motorus į greičiau besisukančius 280 DC motoriukus. Tankas lekia apie 2.5 karto greičiau.
1. Pico matuoja baterijos įtampą - išmokau naudotis Pico [ADC](https://en.wikipedia.org/wiki/Analog-to-digital_converter) ir kas yra [voltage divider](https://en.wikipedia.org/wiki/Voltage_divider). Prie 6.6 V (dažniausiai under load) - išjungimas. [BMS](https://en.wikipedia.org/wiki/Battery_management_system) nedėjau, hardware cut off irgi nedariau, tik software Pico išjungimas. Tad du buck converters ir power on LED toliau veikia ir siurbia ~10-15 mA, kas duoda parą buferio, kol baterija nuo išjungimo įtampos pasieks kritinę over discharge įtampą. Not great, not terrible. Tiesiog tankui sustojus jį reikia rankutėmis išjungti. 3.5 metų vaikas tą supranta, kad nereikia palikti su šviečiančiu power on LED'u.
1. LM7805 išmestas, vietoje jo - du [buck converters](https://en.wikipedia.org/wiki/Buck_converter) - vienas mažiau galingas [MP1584EN](https://www.aliexpress.com/w/wholesale-MP1584EN.html) tiekia 4 V Pico ir bokštelio dviem motorams (Pico dar tiesiai tiekia tanko lempų LED'ukams), kitas galingesnis [XL4015](https://www.aliexpress.com/w/wholesale-XL4015.html) tiekia 6 V dviem vikšrų motorams. 85-95% efficiency (vs 68% lol).
1. Schemos. Pirmi projektai jų neturi, atsidarius gadgetą po metų ir žiūrint į DuPont laidus - *what the fuck?* Dabar naudoju [KiCad](https://www.kicad.org/discover/schematic-capture/) ir prieš pradedant lituoti pasidarau [schemą](https://github.com/NeLaurynas/PicoRC2/blob/master/schematics/Tank%20Schema.pdf). Lituoti paprasčiau, vėliau *troubleshootinti* paprasčiau. DuPont laidų taip pat atsisakyta - jie tik ant breadboard prototipams skirti, truputį daugiau srovės ir sudega ir užtrumpina viską. Turiu skirtingų [AWG](https://en.wikipedia.org/wiki/American_wire_gauge) laidų rites ir naudoju juos. Beje, juokiamės iš amerikietiškų *units* (mylios, coliai, svarai) - bet laidų storiui naudojame amerikietiškus. Ir ekranų, ratų/padangų, vamzdžių ir žarnų dydžiams colius, hm.

	![ima real engineer now](images/new_tank_board.avif)
1. Kreipiu dėmesį į datasheets. Pasimatuoji peak (tai DC motoro startas/stall) ir continuous ir renkiesi komponentus pagal tai. Nes tas "veikia" - kartais veikia valandą, dieną, savaitę, kartais ir mėnesį ištraukia, bet ardyt ir perlituoti idant vėl sugestų - užtenka. Tad bokštelio motorams vienas [TB6612](https://www.aliexpress.com/w/wholesale-TB6612.html), vikšrų motorams - du [DRV8874](https://www.aliexpress.com/w/wholesale-DRV8874.html) H tiltai. Ir todėl du buck converters - vienas būtų apkrautas.
1. Namų gamybos software architektūra veikia, viskas gerai su ja, galėjau ir toliau naudoti. Bet progresuojam ir nutariau pasimokyti labiau *industry standard* - [FreeRTOS](https://freertos.org/). Praktiškai scheduler, ne "tikra" desktop lygio OS. Na ir pagaliau egzistuoja *stack overflow*, o ne tylus atminties gadinimas. Tik jei stack overflow būna on function init - viskas užstringa be jokių pranešimų, kas vis tiek yra geriau, nei silent memory corruption. Taip pat reikia *storage solution* - seku, kiek kartų įjungtas tankas, saugau nustatymus. Anksčiau naudojau savo storage solution - veikė, bet su patirtimi mažėja noras išradinėti ratą, tad naudoju taip pat industrijos standartą - [LittleFS](https://github.com/littlefs-project/littlefs).

# Bonus

Perprogramuojant į FreeRTOS ir per *serial port* skaitant *debug logs* kilo idėja - jau turiu Bluetooth, kodėl gi nepasidarius *companion app*, kuris prisijungtų prie Pico ir rodytų tuos logus, taip pat baterijos lygį ir pan. Problema - neturiu entuziazmo mokytis [BLE GATT](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/host/generic-attribute-profile--gatt-.html) - visą energiją sunaudojau ieškodamas, ko man reikėtų Pico <-> App komunikacijai. Sprendimas - AI slop. iOS app pilnai suprogramavo, su SwiftUI padarė *passable* UI, logotipas ne kažką. Praktiškai visą C kodą Pico pusėje taip pat parašė.

Bet 2026 metai ir AI dar ne viską sugeba - daug deadlocks, freezes, connection issues. Bet su mano [CYW43439](https://www.infineon.com/part/CYW43439) ir Pico žiniomis duodant suggestions kur tikrai yra blogai - pramušė. Veikia puikiai, per du ilgus vakarus nuo nulio BLE GATT iki companion app.

![hail AI slop](images/picorc_app.webm "noautoplay")
