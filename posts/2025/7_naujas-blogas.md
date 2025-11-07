slug: naujas-blogas
header: Naujas blogas
subheader: max AI slop
date: 2025-11-07
tags: blog,ChatGPT

Kyla noras kaišioti savo mintis kitiems, idealiausia būtų [video forma](https://www.youtube.com/@killmeh2), bet nėra laiko. Ir pardaviau visą audio-video įrangą.

Fun fact - prieš dedant skelbimus pasižiūrėjau į panašius, kad įvertinčiau kainas - ir labai, labai daug kamerų, mikrofonų, trikojų ir pan. pirktų tuo pačiu metu kaip mano - 2025 balandį - birželį. Ne aš vienas sugalvojau per covid naują hobį, heh.

Fun fact № 2 - kaip ir kiekvieno hobio pradžioje reikėjo visko - trikojų, objektyvų, kamerų, mikrofonų ir t.t. Dabar realiai reikia apšvietimo, galbūt mikrofono ir iPhone (fun fact № 3 - iPhone 17 kurį laiką buvo [greičiausias consumer grade CPU in single core performance](https://www.tomshardware.com/pc-components/cpus/apples-a19-becomes-the-fastest-single-core-cpu-in-the-world-on-passmark-beating-pc-chips-and-apples-own-m3-ultra-passively-cooled-iphone-17-chip-catapults-past-power-hungry-competitors) - greičiau už x86 čempioną Intel Core Ultra 9 285K - *I fucking can't even*...) - ir kokybiškai galima viską nufilmuoti.

Telieka rašytinė forma. Bet senasis [blogspot blog'as](https://kampjuteriai.blogspot.com/) - it is *poop*. Atrodo prastai, veikia lėtai. Nesinori savo auksiniais pirštais parašytas auksines mintis dėti į šitą *poop* krūvą.

# Tinginystė

Problema išsprendžiama - yra krūva bloginimo įrankių. Bet rinktis, mokytis sintaksės, deploy'inti, ieškoti pritaikytų temų, galų gale - taikytis prie kažkieno idėjos, kaip turėtų veikti blog'as - uhhhh. Rašyti savo - uhhhh, nuobodu, mokyklinukui skirtas programavimo iššūkis.

# Boring parts ir fun parts

Kaip jaunuolis, kuris yra technologijų priešakyje, matau, kad atsakymas į šią problemą - AI. AI slop. *Oh fuck yea let's go*:

1. [AI Arena](https://web.lmarena.ai/) - "give daddy some simple good looking blog" (AI prompt tik demonstracinio pobūdžio). How do you do fellow kids - *I'm vibe coding*. Po keletą variantų pasigeneravau, vienas atrodė gražiai - copy all html.
1. `codex` - openAI AI coding agent AI AI - "me want blog, here's html [Pasted 21809 chars] - but make it good - no react, no tailwind"
1. ???
1. Boom, gan gerai atrodantis paprastas ir greitai veikiantis blogas.

Ir taip *boring part* (platforma) deleguojama AI, o *fun part* - post'ų rašymas - paliekamas man.

# ???

Aišku, aš žinojau, ko noriu - statiškai generuojamas iš [markdown](https://en.wikipedia.org/wiki/Markdown), paaiškinau, kad markdown-to-html biblioteka turėtų palaikyti custom konvertavimą (pvz. image caption tekstą turėtų rodyti po paveikslėliu), jokių "runtime" bibliotekų, tik generavimui, logo turėtų kokią nors "glitchy" animaciją, on link hover - do preload ir t.t. pan.

Sugeneruotas kodas - viename faile - pačiam logiškai išskaidyti funkcionalumą, nes viename faile ne tik žmonės pasiklysta, bet ir tie patys AI. Tada liepti išmesti visą *defensive programavimo* kodą, nes blogas yra statiškai generuojamas ir ne itin dinaminis, a, a, you dumb clanker? Logo *glitch* animacija - mirksinti nesąmonė, padaryk `transform: rotate` būdu. Nuorodos - naujame puslapyje turi atsidaryti.

Pridėk light ir dark temas, tuomet pridėk animaciją keičiant temą. Paspaudus ant įrašo - animacijai naudok [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) - fun fact - įspėjo, kad Firefox nepalaiko tokio dalyko, kurį normalios naršyklės nuo 2023 metų pradžios palaiko. Pirma - gan neseniai (2025-10-04) gavo *dalinį* palaikymą, antra - niekam Firefox nerūpi jau šimtą metų, kaip boomeriai laikėsi įsikandę Internet Explorer 6, taip dabar nauji boomeriai laikosi įsikandę savo *poop* naršyklės lyg būtų 2006 metai... Reikia papromptint AI, kad jei naršyklė = Firefox - redirect to [youareanidiot.cc](https://www.youareanidiot.cc/).

[Act on press](https://x.com/ID_AA_Carmack/status/1787850053912064005) - lėtiems puslapiams tai nepadeda, bet savo greitukui AI slop pabandžiau - pastebėjimas jaučiamas, ne tik ant 120 Hz macbooko, keisto darbovietės 75 Hz, bet ir ant senuko 60 Hz monitorių. Pasakiau, kad ir kitus `click` eventus perdarytų į `mousedown` - pasitestavau - right click nebeveikia, duh, pasakius "sutaisyk" - paklausė ar ir cmd/ctrl funkcionalumą sutaisyti - **dabaaaaar** jis pagalvojo apie `mousedown` implikacijas - pfff 🙄.
# !!!

[Source code](https://github.com/NeLaurynas/void). Viskas po [scripts/](https://github.com/NeLaurynas/void/tree/master/scripts) praktiškai 100% AI sugeneruota. [CSS](https://github.com/NeLaurynas/void/blob/master/src/blog.css) - 100% AI. Per 1x metų nesibodėjau išmokti, tikrai nepradėsiu dabar. Su CSS man AI tai 👌, pagaliau namų projektukai neatrodys kaip [bootstrap](https://getbootstrap.com/) tutorial. [src/](https://github.com/NeLaurynas/void/tree/master/src) - bazė yra AI sugeneruota, mano tik pataisymai ant viršaus. [TODO](https://github.com/NeLaurynas/void/issues) dar likę.

Puiku - su daug pagalbos - sprendimų, badymo pirštu į klaidas, *manual intervention* - sugeneravo *the most basic blog ever*. Toks ir **state of AI programming 2025**.
