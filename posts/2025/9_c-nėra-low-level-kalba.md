slug: c-nėra-low-level-kalba
header: C nėra low level kalba
subheader: it's pretty mid tbh
date: draft
tags: clang,programming

Internete vis užduodamas klausimas "kokią programavimo kalbą mokytis" ir dažnai matau atsakymą "C/C++ - išmoksi, kaip veikia kompiuteriai". And I am confuse - rašau C ant `bare metal` - Pico 2 MCU (Micro Controller Unit) be OS, be MMU (Memory Management Unit). It is so bare, kad `stack overflow` neegzistuoja - kai viršyji stack size, tiesiog rašai į atmintį žemiau stacko which leads to MCU crashing and burning. Neegzistuoja ir `segmentation fault` - gali rašyti į bet kurį atminties adresą (which leads to MCU crashing and burning). Ir nieko apie kompiuterius neišmokau. Ką išmokau, tai kaip C runtime išdėlioja atmintį (kur randasi stack, kur .bss, .data ir .text) - which is nothinggggg.

Pažiūrėjus kelis [Core Dumped Youtube](https://www.youtube.com/@CoreDumpped/videos) video išmokstama daugiau, nei bet kokia C knyga papasakos. Labai geras kanalas - computor dalykai paaiškinti paprastai, bet gan giliai, pvz. [kaip veikia kernel mode ir user mode](https://www.youtube.com/watch?v=H4SDPLiUnv4) - po šito video turėtų atšokti noras įsirašinėti visokius Valorant ar kitus chinese backed žaidimus su kernel mode anti cheat į savo asmeninius kompiuterius. Before shit hits the fan - you will be fucked, royally and literally.

<todo: reword this sentence...>Ką išmokau - dirbamas su PIO posisteme - tai, tarkim, labai primityvus "CPU" (greičiau programuojamas I/O kontroleris) su keletu instrukcijų - rašydamas PIO ASM (*assembly*) kaip veikia šitas PIO "procesoriukas". Nes C nėra *low level language*, ką taip pat dažnai matau internete. And why would it be low level? Nuo pat pradžių buvo kuriama kaip abstrakcija idant lengviau būtų portinti kodą tarp mašinų. Hell, normalios C knygos sako, kad C yra *high level*, pats laikas būtų nustoti svaigti low level.

![Programming in ANSI C (Third Edition), Ray Dawson](images/c_high_level.avif)



## godbolt

even asm is not low level

## SUPER SCALAR

out of order execution. even pico in order execution doesn't map to asm - pico 1 no fpu, so

## fundamental abstraction

can't map to registers, L1 memory, etc - contrary to popular belief you can't write OS in C (core dumped video how to swap registers - https://www.youtube.com/watch?v=LDhoD4IVElk )
