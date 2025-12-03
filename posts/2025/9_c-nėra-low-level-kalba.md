slug: c-nėra-low-level-kalba
header: C nėra low level kalba
subheader: it's pretty mid tbh
date: 2025-12-03
tags: clang,programming

Internete vis užduodamas klausimas "kokią programavimo kalbą mokytis" ir dažnai matau atsakymą "C/C++ - išmoksi, kaip veikia kompiuteriai". And I am confuse - rašau C ant `bare metal` - Pico 2 MCU (Micro Controller Unit) be OS, be MMU (Memory Management Unit). It is so bare, kad `stack overflow` neegzistuoja - kai viršiji stack size, tiesiog rašai į atmintį žemiau stacko, which leads to MCU crashing and burning. Neegzistuoja ir `segmentation fault` - gali rašyti į bet kurį atminties adresą (which leads to MCU crashing and burning). Ir nieko apie kompiuterius neišmokau. Ką išmokau, tai kaip C runtime ar linkeris ar w/e išdėlioja atmintį (kur randasi stack, kur .bss, .data ir .text) - which is nothinggggg.

Pažiūrėjus kelis [Core Dumped Youtube](https://www.youtube.com/@CoreDumpped/videos) video išmokstama daugiau, nei bet kokia C knyga papasakos. Labai geras kanalas - computor dalykai paaiškinti paprastai, bet gan giliai, pvz. [kaip veikia kernel mode ir user mode](https://www.youtube.com/watch?v=H4SDPLiUnv4) - po šito video turėtų atšokti noras įsirašinėti visokius Valorant ar kitus chinese backed žaidimus su kernel mode anti cheat į savo asmeninius kompiuterius. Before shit hits the fan - you will be fucked, royally and literally.

C nėra *low level language*, ką taip pat dažnai matau internete. And why would it be low level? Nuo pat pradžių buvo kuriama kaip abstrakcija, idant lengviau būtų portinti kodą tarp mašinų. C knygos sako, kad C yra *high level*, bet kadangi mes ne wikipedia, vien pacituoti knygą, kuri galbūt parašyta literal nacio, kad savo vardą whitewash'intų, neužtenka - argumentai vėliau.

![Programming in ANSI C (Third Edition), Ray Dawson](images/c_high_level.avif)

Ką išmokau - dirbdamas su PIO posisteme (tarkim labai primityvus "CPU" - daugiau programuojamas I/O kontroleris su keletu instrukcijų) ir rašydamas PIO ASM (*assembly*) supratau kaip veikia šitas PIO "procesoriukas". Bet čia ne C nuopelnas, ir tai tik vienas mažas Pico komponentas. Duomenis paduoti naudojau DMA (Direct Memory Access), bet kaip tai veikia - nesupratau. Nebuvo galimybės, nes C tėra abstrakcija. Kad suprasčiau, teko eilinį kartą keliauti į YouTube - Cornell universiteto dėstytojo [V. Hunter Adams paskaita](https://www.youtube.com/watch?v=1FEBX8l2_5w) apie Pico DMA.

*God fucking dammit* - brain rot social medijos su skibidi toilet ir šimpanzini bananini išmoko apie kompiuterius nepalyginamai daugiau, nei šita, neva, low level computer language.

### godbolt

Exhibit A - [Godbolt](https://godbolt.org/) egzistavimas ir populiarumas. Puikus puslapis, kur įmetus C kodą parodomas sugeneruotas assembly. Nes C tėra high level abstrakcija, todėl niekas nežino, koks ASM gausis. Nes priklauso nuo CPU architektūros (netgi CPU features - FPU (Floating Point Unit) gali būti optional, tad dalyba bus operuojama sveikaisiais skaičiais), compiler flags, compiler version ir t.t.

!["a / b" abstrakcija ir jos low level rezultatai](images/c_division_results.avif)

### super scalar

Pico 2 CPU yra paprastas - *in order execution* (ASM vykdomas kaip parašyta, jokio instrukcijų perrikiavimo) ir *scalar* (viena instrukcija per ciklą). Bet dabar pažiūrėkime į "tikrus" procesorius, randamus kiekviename kompiuteryje ar telefone:
- out of order execution - instrukcijos kviečiamos pagal CPU scheduler nuotaiką, kad būtų apkrauti visi ALUs (Arithmetic Logic Unit)/FPUs.
- super scalar - vienas core turi keletą ALUs/FPUs. Tad per vieną ciklą gali sudėti/padalinti du, tris ir daugiau skaičių. Sudėti daug skaičių per ciklą gali ir dėl vektorizacijos - [SIMD](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data) bet whatever. Fun fact - atsidarai GPU apžvalgą ir ten šneka apie tūkstančius cores, kai tuo tarpu tavo varganas CPU teturi tik 12 ar 16. Nes nVidia kiekvieną ALU + FPU combo ~~skaičiuoja~~ designs kaip vieną core (gavosi didelis *oversimplification* bandant parašyti vienu sakiniu, but you get the point).
- speculative - jei yra laisvo laiko - apskaičiuos rezultatą kitoje `if` šakoje, jei reikės - gerai, jei nereikės - discardins, bet 100% gausim [Spectre](https://en.wikipedia.org/wiki/Spectre_(security_vulnerability)).

Modernių CPU tikslas yra kaip galima greičiau įvykdyti ASM instrukcijas, todėl pilna aukščiau išvardintų ~~hackų~~ optimizacijų, pasekmė - assembly kodas absoliučiai nesimapina su CPU veikimu, ką jau bekalbėti apie C kodą. Kur čia low level? High level abstrakcija.

Fun fact - [Intel Itanium](https://en.wikipedia.org/wiki/Itanium) bandė atitrūkti nuo šitų ~~hackų~~ optimizacijų, but, you know... ***Titanium** - as in Titanic*. Nuskendo.

### fundamental abstraction

> C yra low level kalba ir gali parašyti operacinę sistemą

Like the fuck you can. C, kaip ir Java, yra high level kalbos, todėl vien šiomis kalbomis operacinės sistemos neparašysi. Paprastas OS konceptas (vėl YouTube) - [context switching](https://www.youtube.com/watch?v=LDhoD4IVElk). C abstrakcija neturi tokio koncepto kaip **registrai**. Kaip ir the most basic ir important dalykas procesoriuje. Kaip ir the most basic ir important dalykas operacinėje sistemoje (context switching). Ir C, ale "low level systems programming language", nesugeba padaryti the most basic ir important dalykų. /slowclap

L1/L2/L3 memory C kaip konceptas taip pat neegzistuoja. Normalioje OS toks konceptas kaip RAM access C kalbai neegzistuoja - virtual memory abstrakcija.

### F C

Esu sutikęs C/C++ programuotojų, kurie manė esą *tikri programuotojai*, skirtingai nei tie Java/C# *skripteriai*. Yea right.
