slug:pico-pirmi-įspūdžiai
header:Pico - pirmi įspūdžiai
subheader:kaip viskas prasidėjo
date:2024-12-13
tags:Pico

# Pradžia

Porą 90-ųjų vasarų esu praleidęs pas tėvą darbe - neveikiančioje ar beveik neveikiančioje sunkvežimių kolonėlėje.

![2012 Google Maps matomos kolonėlės liekanos](images/kolonele.avif)

Smagu buvo parkour'int per industrinius vamzdžius, tiltelius. Bet smagiausia - ten buvęs valdymo pultas su krūva jungiklių. Atsisėsdavau ir žaisdavau - junginėji, įsivaizduoji esąs erdvėlaivio kapitonas. Nereikėjo ir šviečiančių lempučių.

![Asociatyvi nuotrauka](images/target_design.avif)

Lankantis Lemonoje užmačiau tumblerius, kasdien matau žaidžiantį sūnų ir kilo idėja padaryti žaislą panašų į tą valdymo bloką. Galima viską paprastai padaryti - prie baterijos prijungi tumblerį, prie jo LEDą - įjungi - šviečia. Bet aš - programuotojas, t.y. paprastoms problemoms išspręsti darau sudėtingus sprendimus (*job security*).

![Tumbleris](images/tumbleris.avif)

Mikrokontroleriai. Žinau apie Arduino, toje pačioje Lemonoje pardavinėjami įvairūs [kits](https://www.lemona.lt/mikrovaldiklio-rinkinys-pradedantiems-arduino.html) - susirinkti ir susiprogramuoti važinėjantį robotuką ir pan. Kodėl nepradėjus dar vieno hobio, kai su mažamečiu vaiku laiko ir taip nėra? Ir man smagu, ir vaikui bus smagu.

Taip gimė planas pirmam žaislui - ale valdymo blokui su tumbleriais, LEDais, kokiu ekranėliu. Kad būtų ką maigyti ir gauti feedback.

# Raspberry Pi Pico

Renkamės mikrokontrolerį: Arduino - brangus, turi specifinę Arduino kalbą programuoti su Arduino IDE. Eh, paieškojus alternatyvų - Pico. Pigesnis, programuojamas su C/C++. Žvėris - 150 mHz, DUAL CORE, 520 kB RAM. Kaip penkių eurų mikrokontroleriui - belekiek resursų, kad mirksėtum keletą LEDų.

Gavus nustebino dydis. Žiūri e-parduotuvėje nuotraukas, ten per visą ekraną, o realybėje - mažas, mažas af. Na, **mikro**kontroleris, makes sense, duh.

![](images/pico.avif)

Prilitavau strypus (tech. terminas *headers*) - mažai ką litavęs, bet practice makes perfect - kairė pusė gavosi šūdinai, o jau dešinė - šūdinai, bet geriau.

Produktas skirtas "entuziastams" - moksleiviams, studentams, kažkuom užimti vakarus. Taip, čia ne rimtas daiktas, kurį kištum į medicinos prietaisus. Kas yra gerai - prieinamas hobis lavinti mąstymą, gauti naudingų įgūdžių. Bet aš - ne eilinis entuziastas. Aš per daug savimi pasitikintis programuotojas, tad viską darysim "teisingai".

![](images/engineer_myself.avif)

Pico programavimo kalba. Visos knygos, dauguma tutorials - siūlo [MicroPython](https://www.raspberrypi.com/documentation/microcontrollers/micropython.html) (paaiškina, kam tokiam prietaisėliui 150 mHz dual core procesorius - kad sugebėtų interpretuoti Python :)). Mes - ne vaikai, mes - tikri vyrai, tad kaip toj dainoj - [WE WILL WRITE IN C](https://www.youtube.com/watch?v=1S1fISh-pag).

Programavimo aplinkos setup. Rekomendacija - atsisiųsti VisualStudio Code ir sudiegti vieną extension. Bet [getting started gidas](https://datasheets.raspberrypi.com/pico/getting-started-with-pico.pdf) turi "manual setup instructions". Pico SDK sukompiliavau, įtraukiau į PATH; cmake, Ninja, picotools, OpenOCD ir t.t. - taip pat įdiegti. Pabandžiau tą extension - nors viską turiu, bet vis tiek 1.8 gigabaitų to paties parsiuntė. Pradinukams patogu, vienas įrankis ir viską paruošia. Ištryniau ir niekada nebandysim daugiau.

![](images/much_pico_trash.avif)

Ir pradėsim projektą. Ar ką nors žinau apie mikrokontrolerių programavimą? Fuck all. But how hard can it be? Čia visai kaip web programavimas. Yra frontendas - tik ne puslapis, o įvairūs LEDai, displays ir pan. Ir netgi planą turiu "išrenderinti" frontendą sekant vienintelio gero web frontend pavyzdžiu - React. Turi current state, turi desired state. Varai per visą state, su if'ais lygini, ar reikia ką pakeisti ir įjungi/išjungi LEDą. Paprasta, efektyvu, galvos neskauda su kažkokiais eventais (kontroleryje tai būtų hardware interrupt, kuomet paspaudi mygtuką) daryti spaghetti kodą. We'll see how that'll work out...
