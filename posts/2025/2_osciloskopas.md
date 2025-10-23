slug:osciloskopas
header:Osciloskopas
subheader:kažkokias linijas piešia
date:2025-01-09
tags:osciloskopas,Pico

![vo 👍 dalykas](images/osci1.avif)

# Problema

Du 7 segmentų ekranėliai. Siekiant sutaupyti laidų ir pins kiekį - multiplexinama. Įjungi vieną ekraną, įjungi segmentus, kad susiformuotų skaičius, išjungi - tą patį padarai kitam ekranėliui su kitu skaičiumi. Žmogaus akiai atrodo, kad šviečia abu.

Problema - išjungus ekranėlį, jis išsijungia ne iškart, o palaipsniui. Todėl prieš įjungiant kitą, reikia palaukti. Tad sumažėja duty cycle ir ekranai šviečia blausiau. Ir kur problema? Ar mano kodas blogai reguliuoja signalus? Ar Pico siunčia blogai signalus? Ar laidai blogi? Ar pirmas NPN tranzistorius neišsijungia greitai? Ar antras PNP? Blogai paskaičiuoti rezistoriai? Pats ekranas nesugeba išsijungti greitai - fosforescencija?

![įjungimas išjungimas kontroliuojamas NPN ir PNP tranzistorių poros - 3.3V yra Pico PIN siunčiamas signalas schemoje, 5V - pagrindinis power šaltinis](images/7disp_scheme.avif "small")

![](images/7display_start.avif "small")

Viską tikrinti keičiant komponentus bandant atspėti problemą - nesmagu ir neproduktyvu.

# Osciloskopas

Juos matau filmuose, elektronikos taisymo parduotuvėlėse - kažkokias bangeles paišo - good for them. Niekada neprireikė, galvos neskaudėjo - "kažkas su elektra". Bet dėl tos problemos (ir ateities problemų) - prireikė. Kita problema - kaina.

![pigiausi egzemplioriai](images/bonker_osci_prices.avif)

250+ eur, kai tai nėra darbo įrankis, o tik hobiui - daugoka. Pasižiūrėjus kažką <100 eur - arba vienas kanalas, arba labai lėti ir man netiks - pinigų išmetimas į balą. Ir prieš Kalėdas sekamas elektronikos youtuber'is parekomendavo [ZOYI ZT-703S](https://zotektools.com/products/triple-in-one-instrument-combining-oscilloscope-multimeter-and-signal-source/) - vienintelis <100 eur osciloskopas, kurį jis rekomenduotų. Šventinės akcijos, už 80 eur prigriebiau iš AliExpress. Gan greitas (man pakaks ilgam), du kanalai, momentinis matavimas, kursoriai pamatuoti laiko tarpus, daro screenshot'us vėlesniam palyginimui.

# Testuojam

Prijungiam prie Pico - geltonas kanalas pirmam ekranui, mėlynas - antram. Išsijungia iškart, pauzė, įsijungia kitas. Kodas veikia gerai, Pico - gerai. Prijungus prie sulituotos plokštės kontaktų - tas pats rezultatas, laidai - gerai.

![](images/osci_screenshot.avif "small")

Prijungiam prie NPN tranzistoriaus kolektoriaus - išsijungia taip pat iškart, jokio overlap, viskas gerai.

![](images/npn_ok.avif "small")

Prijungiam prie PNP tranzistoriaus kolektoriaus - bėda. Išjungus ne staigus srovės kritimas, bet palaipsniui. Kai įsijungia kitas ekranas, prieš tai buvęs dar turi srovės ir blausiai šviečia atvaizduodamas kito ekranėlio skaičius.

![](images/pnp_bad.avif "small")

# Ką daryt

ChatGPT į pagalbą - paklausiau "NPN transistor - base 10k resistor, connected to Pico pin 3.3volts, emitter to ground, collector to 1k resistor to PNP transistor's base. PNP transistor - emitter to 5.2 volts, collector to a LED (PWM signal), says 3.5 volts. Turning off power to Pico pin - instant off in pin, instant off in NPN transistor, but in PNP transistor it bleeds off in 3 ms, how to fix?".

Atsakymas:

![](images/answer_from_ai_insta.avif)

Gerai, pabandom pull up rezistorių prie vieno iš dviejų PNP tranzistorių bazės:

![](images/test_result_osci.avif "small")

Ir taip - geltonas kanalas beveik iškart išjungia srovę (palyginus su mėlynu). Ne tobulai - atkreipus ChatGPT dėmesį, pasiūlė naudoti 470 omų rezistorių. Neturėjau, palikau 1k, veikia good enough.

Galutinis rezultatas - beveik tobulai:

![](images/result_asdf.avif "small")

Ir atnaujinta diagrama:

![](images/updated_scheme.avif "small")
