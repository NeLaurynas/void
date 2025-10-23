slug: pico-2-w-ir-žaislų-taisymas
header: Pico 2 W ir žaislų taisymas
subheader: new life for broken things
date: 2025-01-23
tags: Pico,Pico W,RC

Sidetrack nuo pirmo Pico projekto - RC tanko taisymas. Turim radijo bangomis valdomą tanką ir vaikas sudaužė pultelį. Ne bėda, galvoju, turi būti kažkokie universalūs pulteliai, kuriuos galima sukonfigūruoti. Bet - kainos prasideda nuo kelių šimtų ir nėra taip paprasta konfigūruoti - reikia reverse engineerinti protokolą, kad tankas suprastų komandas, blergh.

# Pico 2 W

![Pico 2 W šalia Pico 2](images/pico_w.avif "small")

Pico 2 turi brolį - Pico 2 *W*. W reiškia Wi-Fi... plius BT - Bluetooth. BT naudoja xBox, Playstation ir pigiausi 15 eurų pulteliai. Planas kaip ir aiškus - įdedi Pico 2 W į tanką, prijungi keletą laidų, paimi bet kurį belaidį pultelį ir važiuoji. 5 minučių darbas.

# Jungiam Pico

Pradedam skaityti Bluetooth specifikaciją - kaip prisijungti prie pultelio ir nuskaityti jo duomenis. Oh my god, 5 mėnesių, o ne minučių, darbas. Bet kažkas šį darbą jau padarė - [Bluepad32](https://bluepad32.readthedocs.io/en/latest/) biblioteka. *Standing on the shoulders of giants*.

Išsiardžius tanką - viena plokštė su radijo ir logikos mikroschemom ir po du laidelius į lemputes ir visus varikliukus. Bokštelio valdymo varikliukai - standartiniai, 1998 metais visos turėtos mašinytės naudojo. Vikšrų du varikliai - didesni. Nematavau, kiek voltų siunčia į mažus varikliukus, bet mes duosim full beans - visus 7.4 baterijos voltus - sudegs tai sudegs, *it's better to burn out than fade away yolo*.

Pradžiai - du laidai į variklį. Reikia paleisti + - arba - +, kad važiuotų pirmyn - atgal. Pasižiūrim, ką kiti *giants* sugalvojo šiai problemai - [H-bridge](https://en.wikipedia.org/wiki/H-bridge). Su mano 2 mėnesių elektronikos patirtimi - suprojektuoti ir sulituoti tokį pasirodė paprasta.

![mano H-tilto schema](images/hbridge_small_motors.avif)

Pamatuojam, kiek srovės tie dideli varikliai ima. 0.8-1.0 ampero, į pagalvę kylant - ir visus 1.5 ampero. Ohohoho, didelių vyrų skaičiai, nebe mili zona, kur iki šiol dirbau. Čia 11 vatų.

![big boys](images/IMG_2420.avif "small")

Dažniausiai mano naudojami transistoriai - greiti ir pigūs - skirti 200 mA max (0.2 ampero). Bėda. Turiu "išeiginių gerųjų" - bet ir jie 600 mA max. Galbūt čia tik konservatyvi rekomendacija? Sukonstravau vieną H-tiltą, prijungiau - ne, ne rekomendacija, gan greit sudegė. Lol.

Alternatyvos? MOSFET gali atlaikyti daugiau, bet jie vis dar brungūs, cannot afford. Radau [SN754410](https://www.duino.lt/h-bridge/13616-varikliu-valdymo-mikroschema-sn754410-l293d-2xh-bridge.html) - du H-bridges (techniškai keturi half H-bridges) mikroschemoje. Skirti max 1 amperui (bet atlaiko 3 amperų šuolius), tai uždėsim [58 centų aušintuvą](https://www.duino.lt/kiti-el-komponentai/14505-arduino-11-x-11-mm-ausintuvas.html) - *it will be fine*. Yra ir naujesnių alternatyvų - pvz. TB6612FNG ar DRV8833, bet Lietuvoje pavienių mikroschemų neradau. :(

![mano H-tiltas ir SN754410 - abu daro tą patį, *size does matter*](images/IMG_2437.avif)

# Važiuojam

Veikia puikiai: [youtube](https://www.youtube.com/watch?v=e4Rm1Y5-mbw). Pico programa: [https://github.com/NeLaurynas/PicoRC/tree/main/tank](https://github.com/NeLaurynas/PicoRC/tree/main/tank)

![](images/IMG_2441.avif "small")

![](images/IMG_2440.avif "small")

# Architektūra

Beje, React įkvėpta architektūra (turėti state ir current state, nuskaityti visų Inputs values, palyginti su state ir nustatyti pasikeitusią state, tuomet eiti per current state ir lyginti su state ir nustatyti visus Outputs) veikia puikiai per abu projektus - sukasi sau kas 10 milisekundžių ciklas ir apie jį negalvoji. Niekada joks I/O nepasimetė ir nereikėjo debuginti. [renderer.c](https://github.com/NeLaurynas/NuclearBriefcase/blob/master/src/renderer.c) - set_state ir render_state metodai.

Veikia greitai - if'ai yra pigūs - vienas-trys CPU ciklas (jei duomenys jau registruose ir jump į if'ą) arba 3-5 ciklai - ant Pico ARM Cortex-M33 veikiančio 18 mHz tai užtrunka nuo 55 iki 277 nanosekundžių (jei veiktų standartiniu 150 mHz greičiu - nuo 6 ns iki 33 ns). Palyginimui duomenų nusiuntimas į MCP23017 mikroschemą užtrunka 0.3 ms (300  000 nanosekundžių), tad kiekvieną ciklą siųsti, kad būtų užtikrintai atvaizduojami duomenys - brangu.
