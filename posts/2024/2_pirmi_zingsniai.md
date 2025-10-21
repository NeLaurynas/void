slug:pico-pirmi-žingsniai
header:Pico - pirmi žingsniai
subheader:'ere we go
date:2024-12-13
tags:Pico

![Easy - I know everything](images/ai_know_everything.avif)

# Lengva - aš viską žinau

Mikrokontrolerių veikimas paprastas: yra kontaktai - pins - ir jis juos išjungia arba įjungia. Prijungi LED anodą (+) prie pin - kode įjungi pin - šviečia. Easy. Projektas bus paprastas.

![](images/blink.avif)

# Fffffffff....

Bet viskas nėra taip parasta, besigilinant iškilo kelios problemos ir teko mokytis dar:

1. PINs kiekis. 28 pins. Atrodo daug, bet kiekvienam LEDui, kiekvienam jungikliui reikia po vieną pin, o jeigu nori naudoti [7 segment display](https://lt.farnell.com/c/optoelectronics-displays/displays/led-displays/7-segment-led-displays) - jam vienam reikės 7 pins. Dviems - 14 pins. Oof. Išmokau apie I2C protokolą, kad būtų galima valdyti [MCP23017](https://lt.farnell.com/microchip/mcp23017-e-sp/ic-io-expander-16bit-i2c-28dip/dp/1332088). Multiplexing - valdyti du 7 segment displays su 9 pins, kai trumpam įjungi vieną, paskui kitą - žmogaus akiai atrodo, jog šviečia abu.
1. Amperai. Vienas pin gali tiekti maks. 20 mA. Negerai, planas yra valdyti ir galingesnius LED masyvus. Plius - visų pin tiekimas negali viršyti 300 mA. Oof. Pats laikas išmokti apie transistorius - NPN, PNP, darlington. Ir MOSFET - IRL, IRF. MOSFET faini, bet brungūs - vienas kainuoja 81 centą, kai NPN - 2.3 cento (arba 1.7 cento, jei perki [penkis tūkstančius](https://lt.farnell.com/diotec/2n2222a/transistor-npn-40v-0-6a-to-92/dp/4555427)). [ULN2803A](https://lt.farnell.com/stmicroelectronics/uln2803a/darlington-array-8npn-2803-dip18/dp/1094428) - transistorių masyvas mikroschemoje. Cool.

Reikėjo išmokti Pico PIO - programuojamas Input/Output. Kai reikia itin tikslaus elektros valdymo - ne milisekundžių tikslumu, ne mikrosekundžių tikslumu, bet nanosekundžių tikslumu. Nes taip kontroliuojamos tos tiktok'e populiarios LED juostos - siunčiant nuliukus vienetukus. CPU to patikėti negalima, nes CPU gali būti užsiėmęs, pvz. handlinti interrupt'ą. PIO modulis turi state machines, kurios priima 32 instrukcijas maks. ir instrukcijų set'as - 9 instrukcijos.

![Kaip siųsti 0/1 į WS2812B LED'us](images/ws_spec.avif)

![PIO programa multiplexinti du 7 segment displays](images/pio_program.avif)

PWM - Pulse Width Modulation. Visąlaik galvojau, kad pritemstančios lemputės - tai tiesiog voltus prisuka. Pasirodo, įprastai, ne. Sumažina square wave duty cycle. Hm.

Ir galiausiai - fizinio mygtuko paspaudimas. Į pin prijungi vieną mygtuko kontaktą, o kitą - arba į žemę, arba į 3.3 voltus. Jei į žemę - reikia pull up rezistoriaus, kad kai mygtukas nepaspaustas ir grandinė atvira - Pico skaitytų HIGH reikšmę, o ne random garbage tarp LOW ir HIGH signalo. Jei į 3.3v - reikia pull down rezistoriaus, kad atvira grandinė skaitytų LOW reikšmę.

Software mygtukas labai paprastas - paspaudi ir gauni eventą. Be jokių klaidų, užtikrintai. Hardware mygtukas - turi du kontaktai viduje susiliesti. Spausti gali iš krašto, nenuspausti iki galo, spaudžiant mygtuką tie kontaktai artėja - vienu žodžiu, per nanosekundę gali gauti keliolika eventų, kad mygtukas buvo paspaustas, ypač su pigaus kaip Pico mikrokontrolerio ADC (analog to digital converter). Tad ir toks paprastas dalykas reikalauja daugiau pastangų.
