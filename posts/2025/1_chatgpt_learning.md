slug:chatgpt-ir-pico-mokymasis
header:ChatGPT ir Pico mokymasis
subheader:AI slop pradžia
date:2025-01-07
tags:ChatGPT,Pico

![Quality AI generated related image](images/ai_slop_pico.avif "small")

# Intro
Prieš ir pradėjus dirbti programuotuoju, [StackOverflow](https://stackoverflow.com/) forumą lankiau tikriausiai kas dieną porą metų. Augant patirčiai - lankymas retėjo. Tuomet prasidėjo AI ~~revoliucija~~ hype. Pabandžiau ChatGPT, Microsoft Copilot - nesužavėjo. 13 virš metų profesionaliai su ta pačia technologija dirbant - iškilus klausimams jei dokumentacija nepadeda - nepadės nei StackOverflow, nei ChatGPT - reikia skaityti problematinės bibliotekos kodą ir suprasti, kas ir kodėl vyksta.

Tad pasižaidus su ChatGPT - miela, bet buvo nurašytas.

# Nauji dalykai

Dabar mokomės naujus dalykus - mikrokontroleriai, fizika - elektra, tranzistoriai, įvairios mikroschemos, ir pasimiršus C (*static* raktažodis funkcijos viduje ir už jos - skirtingi dalykai - sena kalba, sena...). Ir gana sužavėtas.

Vienas dalykas, dėl ko neklysta - formulės. Puikiai sugeba jas parinkti. Puikiai sugeba išparsinti tekstą, išsitraukti kintamuosius ir įstatyti į formulę. Paaiškinimai, ką daro tie kintamieji - puikūs. Taigi vienam dalykui - produkto [datasheet](https://www.farnell.com/datasheets/2047464.pdf) specifikacijas jam iškopijuoji ir sakai "jungsiu prie 5V, kokio rezistoriaus man reikia?" - nuostabus įrankis, paaiškina ir kažką naujo sužinai. Jeigu produkto specifikacija neturiu kintamojo, kiek miliamperų traukia pvz., - išskaičiuoja - paima forward voltage ir heat dissipation ir pasako, kiek mA gali saugiau traukti.

![Dar ir apie omo dėsnį papasakojo](images/ai_ohm.avif)

Kodo generavimas - eh, kartais neblogai, kartais blogai. Mėgsta naudoti hexadecimal - šešioliktainę sistemą - siūlo *0xFF*, tačiau naujesnė GCC versija palaiko binary - dvejetainę sistemą - *0b11111111*. Hex neskaitau, nesu low level programmer, binary aiškiau naudojant kaip *bit mask* ir pan.

Kas erzina - jei sužmogintume ChatGPT - per daug sutinkantis, nesugeba pasakyti "ne", nepasitiki savimi, grynas "*yes man*" ir, be abejo, kartais neteisus. Pvz:

>Aš: "Pico PIO - how to control seven pins?"\
ChatGPT: "use SET PINS"\
Aš: "SET PINS can send only 5 bits, I need 7"\
Ch: "you are absolutely correct! use OUT PINS"\
Aš: "OUT PINS can send only 5 bits too" <- netiesa, blogai paskaičiau dokumentaciją, OUT PINS gali siųsti 32 bitus\
Ch: "you are correct again! use SET PINS and sm_config_set_set_pins" <- netiesa, grįžom atgal\
Aš: "sm_config_set_set_pins configures only 5 pins max"\
Ch: "you are correct again! use OUT PINS" <- ratais vaikščiojam. Nuėjau aiškintis dokumentacijoje ir taip - OUT PINS man tinka. Jeigu būtų sugebėjęs pasakyti "no, you are wrong" - būtų sutaupęs laiko

![cmake - how to do things](images/cmake_ai.avif)

# Premium

Su PIO išsiaiškinau, bet dėl I2C protokolo ir MCP23017 turėjau daugiau klausimų - pasiekiau klausimų limitą. Mmmm, vienas laisvas vakaras, kai dar yra energijos, mokymasis su ChatGPT pagalba sekasi gerai, problemos sprendžiamos - pasižiūrim, kiek premium kainuoja mėnesiui - 20 dolerių. Ar man dabar kaip senovėje googlintis informaciją, skaityti raw dokumentaciją? F*ck it, susimokėjau. Gavau ir premium modelį - o1 (vietoje GPT-4o) - ir jis geras, geriau aiškina, naujesnė informacija (4o techniškai šneka apie Pico 1, pas mane Pico 2, bet antra versija yra drop in replacement). Daug resursų naudoja - ilgiau galvoja ir yra savaitinis limitas. Pro versija už... 200 dolerių duoda be limitų. Jei 4o nepadeda, tuomet persijungiam į o1.

# Ne stebuklai

Įrankis yra nice to have, bet man įspūdžio nepadarė - čia nėra magija. Tarp interneto konspiracijų teorijų siurbimo, prigriebė ir Pico C sdk dokumentaciją, procesorių RP2040/RP2350 datasheets, mano naudojamų komponentų datasheets ir dažniausiai kartojamų - *common knowledge* - forumų patarimų (reikia pull up rezistoriaus SDA ir SLC kanalams pvz.). Ir viską gražiai išspjauna (dažniausiai). Viską ir pats galiu susirasti ir paskaityti - tačiau daug naujų dalykų, informacija overwhelming, paskutiniu metu internete per daug šūdo - botų generuojama copy-pasta, bet ko rašymas dėl peržiūrų - atsirinkti sunku, skaitant suprasti, ar tai tau naudinga informacija - sunku. ChatGPT padeda. Visų problemų neišsprendžia, tai tėra įrankis, bet padeda.

Kaip general purpose modelis - vystymasis, manau, sustojo. Kad ChatGPT (ir kiti LLMs) tobulėtų - jam reikia duomenų. Nusiurbė visus naujienų portalus, reddit, kitas socialines medias - ir paleido AI. Pandoros skrynia atidaryta, dabar jų duomenų šaltinis - jų pačių sugeneruoti duomenys. Entropija. Nes AI botai internete siaučia - [dead internet theory](https://en.wikipedia.org/wiki/Dead_Internet_theory) jau nebe teorija, o realybė. *Shit in - shit out*, gyvatė, ėdanti savo uodegą. Tačiau naujos specifikacijos, dokumentacijos bus siurbiamos toliau ir šioje kategorijoje jie tobulės ir liks naudingi.

Ne stebuklai čia. Už tave nieko nepadarys. Reikia darbo įdėti, mokytis ir suprasti - ar generuojami atsakymai yra pagalba, ar šlamštas.

# Žmogaus nepakeis

![Kvailiausia nuomonė apie AI, kurią esu matęs](images/opinion_ai.avif)

Labiausiai verkia menininkai, kad juos pakeis. Grafikos dizaineriai, dailininkai skundžiasi, kad sumažėjo užsakymų po 10 eurų iš [fiverr](https://www.fiverr.com/). Anksčiau ar vėliau klientai būtų atradę [shutterstock](https://www.shutterstock.com/), [istockphoto](https://www.istockphoto.com/) ar kitą iš tūkstančių platformų. AI yra alternatyva ne žmogui, o toms platformoms.

AI problema, jog jis generuoja kažką iš kažko. Tam vienam kartui - puiku, tiks. O jei antrą dalyką norėsi sugeneruoti? Kad būtų tęstinumas? Antras dalykas bus ne *continuity*, o *new derivation*. Taip, parinks panašų source, kad kažkas panašaus gautųsi, bet tai nebus tęstinumas, tai bus naujas kitas dalykas, tik panašus į pirmą. Ir žmonėms moka pinigus ne todėl, kad greitai kažką artistas papeckeliotų, o tam, kad turėtų viziją apie produktą ir tą viziją stumtų, turėtų skonį, sugebėtų parinkti spalvas, komponuoti, turėtų domeno žinių ir susivokti, kaip kažką perteikti ir kaip tai bus suvokta, sugebėtų argumentuoti, kodėl reikia taip. AI iki to dar šimtas metų. AI dabar yra tiesiog įrankis, kuris palengvina darbą duodamas pirmą greitą eskizą, o toliau - darys artistai už ką jiems ir moka - daug valandų praleis prie menkiausių detalių, kurios AI net neegzistuoja.

Muzika - tas pats. Kažką gali sugeneruoti, bet kažką pasiūlyti jau daug metų gali ir [Youtube Audio Library](https://www.youtube.com/audiolibrary), [Epidemic Sound](https://www.epidemicsound.com/) ar kad ir tie patys žmonės - be jokių mokesčių daina, kurią gali naudoti, tik kažkur parašyk, kas kūrėjas - [White Bat Audio - Salt in the Wound](https://www.youtube.com/watch?v=jsahgJvMnjo).

Programavimas. Rašyti naują kodą yra lengva. Perrašyti visą projektą vietoje taisymo - lengviausias būdas. Puiku, ChatGPT padės su lengviausia užduotimi. Ne už tai man moka. Man moka už problemų išsprendimą visam laikui, t.y. - kad kiti suprastų, kas ir kodėl buvo padaryta, kad sprendimas veiktų, kad nebūtų sukurtos naujos problemos, kad pasikeitus reikalavimai būtų lengva pakeisti kodą. Kai išmanantys savo darbą žmonės dirba, kurie yra on the same page, laikosi tų pačių stiliaus reikalavimų, tų pačių guidelines, turi tą pačią viziją - ir tuomet yra sudėtinga didelį projektą plėsti ir tvarkyti kokybiškai. Tam kartui padės, bet tai tėra kelias į projekto perrašymą - [not something you do](https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/).

AI tėra įrankis, turintis savo vietą, turintis savo trūkumus ir jį reikia naudoti su galva. Ir kaip telefonu gali kalti vinį - taip ir su AI gali kurti savo produktą. AI nėra žmogus ir nebus daug laiko.
