slug: viso-blogio-šaknys
header: Viso blogio šaknys
subheader: <optimized out>
date: 2025-02-13
tags: C_lang,performance,Pico,programming

> "Premature optimization is the root of all evil (or at least most of it) in programming." - Donald

# RAM naudojimas

Padariau klasikinę programavimo klaidą - per anksti pradėjau optimizuoti kodą. Atrodė logiška - resource constrained aplinka, naudosime mažiausius reikalingus duomenų tipus - 8 arba 16 bitų sveikuosius skaičius ((u)int8/16) vietoje standartinių 32 bitų.

Taip, atminties sunaudoju dėl to mažiau, funkcijų stack'ai optimalūs. Ir tai turėtų prasmę, jeigu artėčiau prie RAM ribos. Pvz. 300 int8 ir 300 int16 kintamųjų palyginus su 600 int32 kintamųjų - atminties prieaugis tėra 1.5 kB, <0.3% viso Pico RAM. Turėkime galvoje, jog *unused RAM is wasted RAM*. Tie pusantro kilobaito nieko man nepadės, kai ir taip lieka beveik 500 kB su dabartiniu projektu.

Vienintelė vieta praktikoje, kur tai man svarbu - MP3 grojimas:

1. Du buferiai paruoštos dekoduotos MP3 informacijos (double buffered, kad garsas eitų be trikdžių) tiesiai į Pico PWM - 8 bitų PCM - (uint8_t)[2  * 1152 * 8]
1. Vienas 16 bitų PCM buferis, į kurį dekoduojamas MP3 fragmentas ir vėliau keliamas į vieną iš dviejų 8 bitų PCM buferių - (uint16_t)[1152 * 8]
1. Vienas MP3 duomenų buferis, kuris laiko dalelę MP3 failo, kurį tuoj dekoduosim į 16 bitų PCM - (uint8_t)[1152 * 5].

Čia parinkus tinkamus duomenų tipus - atminties sunaudojama apie 42 kB. Su visais int32_t - būtų sunaudojama 131 kB. Jau pastebimas skirtumas.

# CPU naudojimas

RAM naudojimas - ne itin svarbu*, CPU naudojimas - svarbu, nes dažniausiai Pico veikia nuo baterijos - kuo mažiau ciklų - tuo greičiau CPU eis miegoti ir pataupysim baterijos.

Ir vieną vakarą, kadangi jau trinuosi šitame low level'yje, kilo mintis - Pico 2 naudoja ARM Cortex-M33 CPU, tai yra 32 bitų CPU. Su 32 bitų registrais. Kas vyksta, kai jam paduodu 16 bitų duomenis?

![and there's my answer](images/u16_dsm.avif)

Hm. Taigi, dirbant su 32 bitų skaičiais, sudėti du skaičius - du CPU ciklai. Sudėti ne 32 bitų skaičius - 4 ciklai. Vienas ciklas **lsl** instrukcijai - bit shift į kairę (32 - 8 ar 16) ir tuomet **asr**/**lsr** instrukcija - bit shift (logical/arithmetic) į dešinę (32 - 8 ar 16).

Nori optimizuoti iš lempos - gaunasi dvigubai lėčiau. Taiiip, dabar dar galima pagalvoti apie L1 CPU cache - paprastame kompiuteryje RAM access yra slow af, su mažesniais kintamaisiais daugiau šansų, kad reikalingi duomenys bus L1 cache, tad reikėtų matuoti, kas yra greičiau su konkrečiu kodu - bit shifts ar RAM access. Su Pico 2 lengva - RAM yra SRAM (super greitas access) ir... CPU net neturi L1/L2 cache dėl šios priežasties. 🙃

# * - atminties naudojimas ir battery saving

Pico 2 SRAM - most relevant yra 8 bank'ai po 64 kB is sugrupuoti į dvi grupes - SRAM0 ir SRAM1. Galima pilnai atjungti SRAM1 grupę ir sutaupyti šiek tiek energijos. Bet tai palieka 200+ kB atminties ir tie pusantro kB neturi įtakos. Iš SRAM0 grupės galima bank'us numesti į low power režimą - bet kai kiekvienas bank'as yra 64 kB, tie pusantro kB vėl praktiškai neturi įtakos.
