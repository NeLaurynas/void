slug: c-lang-retrospektyva
header: C lang - retrospektyva
subheader: I C despair
date: 2025-12-01
tags: clang,programming

Pasirinkau C mikrokontroleriams nes tai buvo *least common denominator* (toolchain in C, sdk in C, dauguma bibliotekų ir datasheets kodo pvz. - in C), plius paprasta - jokių klasių, mažai raktažodžių, mažai sintaksinio cukraus. Padirbus metus - pradedu gailėtis savo pasirinkimo. C problema - amžius ir nenoras keistis (kartais). Sukurta **1972** metais.

## Problemos

### storage variables

1. `static`. Menka problema. Bet po pirmos - K&R C - versijos ėjo ANSI C / C89, C95, C99, C11, C17 ir C23 - virš 40 metų atnaujinimų ir nebuvo galima pridėti `private` raktažodžio?
```c
// this is public (and static)
int global = 1;

// this is private (and static)
static int global2 = 1;

// this is private
static int func1() {}

// this is public
void func2() {
	// this is just static (goes to .data memory region)
	static int local = 1;
}

// and this "static" might do something, might do nothing at all
int func3(int a[static 10]);

```
2. `auto` (ir pointer syntax). Originaliai buvo naudojamas nurodyti, kur laikyti kintamąjį atmintyje. Kas praktiškai visada reiškė *stack'e*. Taigi ~~pašalino~~ pakeitė į *type inference keyword* - `auto a = 420;` - `a` yra `int`. Bet:
```c
// priimtinas būdas aprašyti pointers
some_long_int_type_t *a = get();
// tas pats kas some_long_int_type_t* a = get();

// o dabar pakeičiam priimtiną būdą į auto:
auto *a = get();
// error: 'auto' requires a plain identifier

// pataisom:
auto a = get();
// nepamirštam vėliau naudoti *a, jeigu norim pasiekti pointerio value

```
3. `register` - tiesiog pašalintas, kažkada buvo *compiler hint*, kad laikytų CPU registre (apie C ir low level - kitame post'e). Šie trys raktažodžiai yra apie duomenų laikymo vietą atmintyje. Vienas pakeistas, antras pašalintas, o trečias - nesutvarkytas. *gg*

### VLA

Variable Length Array. Paskaičiau - use cases man neaiškūs, neaiškūs buvo ir kūrėjams, tad compilers gavo -Wvla (*warning*, jog naudoji VLAs, nu nu nu), o C23 versija - pašalino. WTF was that? Tai kalba tvarkoma. Pridedama, išmetama, bet įsišaknijusios problemos neliečiamos.

### NULL terminated strings

Arba mano +1 / ±0 / -1 gyvenimas.
```c
#define A "123" // length is 4
char b[3] = "123"; // length is 3
char c[] = "123"; // length is 4
```

Visų jų realus ilgis yra 3. `A` ir `c` tiesiog turi "123\0". Null termination. Kas yra *optional*. Kas švaisto vietą tiek RAM, tiek flash atmintyje ir pasijaučia, kai nori daugiau teksto rašyti į flash storage, kai Pico yra *offline*. Ir dabar turėk kontekste, kad rezervuojant buferį reikia +1 ilgiui, nes `\0` (arba ±0, jei nenaudoji null termination), skaičiuojant tikrą ilgį reikia -1, nes `\0` (arba ±0).

API grąžina 32 simbolių duomenis - gali dėti į `buff[32]` be null termination, gali dėti į `buff[33]` su null termination. O vėliau - tavo problemos.

Iš kur staiga toks laikymas už rankutės (bet optional)? The fuck is this? Kad visokios `strcpy` `strlen` funkcijos nereikalautų ilgio parametro?

### type system

Kokia dar tipų sistema? Tipų sistema tiesiog yra *hints* compileriui kiek atminties rezervuoti kintamajam, o paskui - viskas kaip `void*`.

![](images/clang_void.avif "small")

Reali problema, nes type system neegzistuoja: Pico `queues` - viena su `small_item_t`, kita su `big_item_t`. Dedi į `queue` itemą ir kažkas kažkur consumina:

```c
queue_t small_queue;
queue_t big_queue;

void init_queues() {
	// small queue for passing small_item_t
	queue_init(&small_queue, sizeof(small_item_t), 16);
	// big_queue for passing big_item_t
	queue_init(&big_queue, sizeof(big_item_t), 16);
}

void get_fucked() {
	big_item_t humongous = { };
	queue_add_blocking(&small_queue, &humongous); // big mistake
}

```

Į  `small_queue` pridėjome `big_item_t`. Kompiliuojasi. Ir veikia, kažkiek. Bet turime classic c - *out of bounds write*. Atmintis corruptinasi - lėtai, bet užtikrintai, ir viskas nueina velniop pačiais įvairiausiais būdais.

Kalboje su *strong type system* tokių nesąmonių nebūtų:

```csharp
var small_queueue = new Queue<SmallItem>();

void nice_try() {
	var bigItem = new BigItem();
	small_queueue.Add(bigItem); // compile error
}
```

### array decay

```c
#define ARRAY_SIZE(x) (sizeof(x) / sizeof((x)[0]))

int a[10];
size_t n = ARRAY_SIZE(a); // čia veikia

void foo(int *arr) {
    size_t n = ARRAY_SIZE(arr); // čia jau ne
}
```

I'm out.

## Alternatyvos

### Rust

"Nekenčiu Rust".unwrap(). Max "cali" hiparikų *blazingly fast* meme. Bet... veikia. Naudojama realiuose projektuose, moderni. Pure Rust projektas - ne pasaulio pabaiga. Aš jau vibe codinu - *time to go full retard and embrace silicon valley crap*.

Tačiau nenaudojant iki galo nedadarytų HAL (Hardware Abstraction Layer) bibliotekų ir kviečiant Pico C SDK tiesiogiai:

```rust
#![no_std]

use core::ffi::c_uint;

#[repr(C)]
struct DmaChannelConfig {
	_dummy: u32,
}

#[link(name = "pico_stdlib")]
extern "C" {
	fn gpio_init(pin: c_uint);
}

#[link(name = "pico_multicore")]
extern "C" {
	fn multicore_launch_core1(entry: extern "C" fn());
}

const LED_PIN: c_uint = 25;

extern "C" fn core1_blink() {
	unsafe {
		gpio_init(LED_PIN);
		// ...
	}
}

#[no_mangle]
pub extern "C" fn start_blink_thread() {
	unsafe {
		multicore_launch_core1(core1_blink);
	}
}
```

ne pati gražiausia aplinka dirbti. Pilna macros ar #[whatever the fuck this is] ir `unsafe` blokų. Bet galima pasirašyti *wraperių*... Gal...

### Zig

Zig man patinka. Yra null termination, um, separacija (`[] u8` be null termination ir `[:0] u8` su null termination - konceptas egzistuoja, bet negali maišyti ir pasimesti). Kodas gražesnis (turi `callconv(.C)` spam'o, but oh well):

```c
const c_uint = u32;

extern fn gpio_init(pin: c_uint) void;
extern fn multicore_launch_core1(entry: fn () callconv(.C) void) void;

const LED_PIN: c_uint = 25;

fn core1_blink() callconv(.C) void {
	gpio_init(LED_PIN);
	// ...
}

pub export fn start_blink_thread() callconv(.C) void {
	multicore_launch_core1(core1_blink);
}
```

Ir nesistengia būti kažkokia revoliucija, tiesiog ++C (*improved C*, nes C++ kalba yra literally prikrauk ant C dalykų bet grąžink ir turėk tą patį C - joke about `++c` vs `c++` variable increment).

Minusas - versija šiuo metu **0.15**. Ir oh boy, pas juos *pre-release* tikrai reiškia *PRE-RELEASE* - su kiekviena minor versija kalba keičiasi. Pvz. naujausias pakeitimas - `async` ir `await` raktažodžiai - bye bye. Tai arba visą kodą taisyti su kiekvienu release, arba prisirišti prie vienos versijos ir keisti kodą kai bus **1.0** versija. Bet gali būti susikaupę labai, labai daug pakeitimų. Tad, vėlgi - gal...

### Kalbant apie C++

Nemėgstu ir C++. Exceptions, templates, operator overloading, mucho undefined behaviours; kuomet C nesikeitė, tai C++ krovė viską į savo kraitį. Per daug prikrauta. Aišku, galima nenaudoti viso C++ šlamšto - jų moto juk *what you don't use, you don't pay for* - tad galima naudoti kaip C su C++'so `std` biblioteka ir keletu kitų feature.

```cpp
#include "pico/stdlib.h"
#include "pico/multicore.h"

using c_uint = unsigned int;

constexpr c_uint LED_PIN = 25;

extern "C" void core1_blink() {
	gpio_init(LED_PIN);
	// ...
}

extern "C" void start_blink_thread() {
	multicore_launch_core1(core1_blink);
}
```

Vienintelis šio paprasto pavyzdžio skirtumas nuo C - `extern "C"`. Kas nėra baisu, kaip kitose kalbose.

Fuck me, mokysimės C++.
