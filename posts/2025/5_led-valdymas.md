slug: led-valdymas
header: LED valdymas
subheader: R G B... maybe W
date: 2025-03-25
tags: LED,osciloskopas

![](images/wsleds.avif)

Postas daugiau skirtas pateisinti osciloskopo egzistavimą žmonai.

# WS2812B

![](images/ws_impostor.avif "small")

Vieni populiariausių spalvotų ledų - WS2812B, galima sujungti kelis ar keliasdešimt ir turėti gan lengvai valdomą LED juostą ar 8x8 masyvą ir naudoti kaip ekraną - ko man ir reikėjo. Parduotuvės aprašyme WS2812B, and LED masyvo atspausdinta WS2812B, tačiau sukodavus valdymą pagal datasheet - niekas neveikia.

# WS2812B - kaip turėtų veikti?

Valdymas per vieną laidą siunčiant RGB kodą pirmam, tuomet antram, ir t.t., LEDams. RGB kodas - raudonos, žalios ir mėlynos spalvos kiekis nuo 0 iki 255 (populiariausias formatas - 8 bitai per kanalą, HDR naudoja 12 bitų per kanalą - nuo 0 iki 4095).

Norint, kad LED šviestų oranžine spalva:

1. Gauti RGB kodą - 255 Red, 178 Green ir 0 Blue
![](images/color_picker.avif "small")
1. Paversti kodą į dvejetainę sistemą - 11111111 Red, 10110010 Green ir 00000000 Blue
1. Nusiųsti šį trijų skaičių kodą į per tą vieną laidą - LED turėtų šviesti oranžine spalva
	- vienas skaičius siunčiamas, pvz, 100 nano sekundžių - jei tai 1 - 66 ns siunčiama srovė ir 33 ns nesiunčiama, jei 0 - 33 ns siunčiama srovė ir 66 ns nesiunčiama. Prijungus osciloskopą tą ir matome - nusiųstas 1 ir 0.
	![](images/osci_1010101.avif "small")
1. Pakartoti kitiems LEDams. Po ilgesnio laiko nesiunčiant jokių signalų - kontroleris nusiresetina ir pradeda nuo pirmo LED.

# Apgaulė

Patestavus su osciloskopu - turi veikti. Pažaidus su timings - kiek laiko siųsti signalus - pradėjo veikti. Ir pirma bėda - WS priima GRB formatu - raudona sukeista su žalia. Tad nusiuntus testą, kad šviestų žaliai - švietė raudonai.

Paklausus ChatGPT kokie dar kontroleriai veikia su panašiais timings, bet RGB formatu - SK6812. Ir taip, mano paredaguoti timings atitiko šio kontrolerio specifikacijas ir formatas RGB, o ne GRB. Apgavo mane, čia SK6812. Arba dar koks nors SK6812 klonas. 🤷‍♂️
