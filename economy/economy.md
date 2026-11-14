# GXW Battle — экономика 2.1.3

Черновик экономики для сборки **MineCraft Battle 2.1.3** (Forge 1.20.1).
Валюта — **рубли (₽)**, кошелёк у каждого игрока отдельный (мод **GXW Terminal Shop 1.1.1**).
Зоны и выплаты — мод **GXW Zones 1.0.15**.

Всего позиций в каталоге: **761**. Блоки, ванильные предметы и декоративная стройка в список не входят.

---

## 1. Как устроена экономика сейчас

| Элемент | Реализация |
|---|---|
| Кошелёк | `RublesSavedData`, рублёвый баланс на UUID игрока, хранится в мире |
| Магазин | терминал (`/gxw_terminal_shop`) → заказ едет в **привязанный ящик снабжения** |
| Быстрая закупка | планшет → **дрон-доставщик** летит к игроку, комиссия **10% + 0.99 ₽** |
| Каталог | плоский список позиций: предмет + цена + количество + категория |
| Доход | захват и удержание зон (мод Zones) |
| HP дрона-доставщика | **30** (уже так в 1.1.1, менять не нужно) |

### Важные ограничения

- Купить «в руки» нельзя: терминал кладёт заказ в привязанный ящик, планшет — ждёт дрон.
- У планшета лимит: один активный дрон на игрока, при смерти планшет отвязывается.
- Каталог пустой по умолчанию — цены ниже нужно загрузить (см. раздел 5).
- Ящик снабжения — общий склад команды: закупка одного игрока доступна всем, кто к нему привязан.

---

## 2. Доход с зон

### Как считается (проверено по коду `GXW-Zones-1.0.15`)

Каждая зона платит **независимо**, пока у неё есть владелец:

| Выплата | Период | Кому |
|---|---|---|
| За интервал | каждые `payoutIntervalSeconds` (по умолчанию 10 с) | каждому игроку команды-владельца |
| Бонус за минуту | каждые 1200 тиков (60 с) удержания | каждому игроку команды |
| Бонус за 5 минут | каждые 6000 тиков (300 с) удержания | каждому игроку команды |

**Суммирование по зонам работает как ты хотел:** каждая зона обрабатывается отдельно и платит полную сумму.

- 1 зона → ×1
- 2 зоны → ×2 (за первую **и** за вторую)
- 3 зоны → ×3

Пример: 2 зоны, интервал 10 с, 200 ₽ → каждые 10 секунд каждый игрок команды получает 2 × 200 = **400 ₽**.

> Выплата идёт **каждому участнику команды лично**, а не в общий котёл. Команда из 4 человек на 1 зоне получает в сумме 4 × сумму.

### Рекомендованные настройки

```mcfunction
/gxwzone payout on
/gxwzone payout interval 10
/gxwzone payout amount 200
/gxwzone payout minute 300
/gxwzone payout five 1000
/gxwzone payout status
```

Доход на игрока:

| | 1 зона | 2 зоны | 3 зоны |
|---|---:|---:|---:|
| В минуту | 1 700 ₽ | 3 400 ₽ | 5 100 ₽ |
| В час | 102 000 ₽ | 204 000 ₽ | 306 000 ₽ |

*(200 ₽ × 6 раз + 300 ₽ бонус за минуту + 1000 ₽ / 5 мин ≈ 1 700 ₽/мин)*

### Сколько фармить до покупки (1 зона, соло)

| Покупка | Цена | Время |
|---|---:|---:|
| Пистолет + патроны | 1 500 ₽ | ~1 мин |
| Автомат | 5 500–7 000 ₽ | 3–4 мин |
| Бронежилет + шлем | 9 000–14 000 ₽ | 5–8 мин |
| Полный комплект (ствол, броня, шлем, патроны, аптечка) | ~21 000 ₽ | ~12 мин |
| FPV-дрон «Ланцет-51» | 18 000 ₽ | ~11 мин |
| Бронеавтомобиль Bushmaster | 45 000 ₽ | ~26 мин |
| Танк (чертёж BL-132) | 60 000 ₽ | ~35 мин |

Если хочется динамичнее — поднимай `amount` до 300 (2 500 ₽/мин) или снижай цены на 20%.

---

## 3. Принципы цен

1. **Ствол дешевле брони.** Потерять оружие не страшно, броню — больно: так снаряжение остаётся ценным.
2. **Тир решает.** Пистолет → ПП → автомат → снайперка → пулемёт: каждый шаг +40–60% к цене.
3. **Патроны пачками.** TACZ и SBW продаются по 30 шт., тяжёлые калибры дороже в 3–5 раз.
4. **Техника — цель на сессию.** Один танк/вертолёт = 20–40 минут фарма, поэтому техника не обесценивает пехоту.
5. **Дроны — расходник.** FPV-дрон дешевле танка в 3 раза и гибнет с одного попадания.
6. **Медицина доступна.** Аптечка 1 200–1 800 ₽: экономия на лечении не должна становиться «смертью навсегда».
7. **Крафт-материалы и чертежи оружия не продаются** — их добывают крафтом, магазин закрывает только снабжение.

---

## 4. Сводка по категориям

| Категория | Позиций | Диапазон цен |
|---|---:|---|
| Пистолеты | 24 | 800 – 1 300 ₽ |
| ПП | 16 | 3 000 – 4 200 ₽ |
| Автоматы | 45 | 3 500 – 8 000 ₽ |
| Дробовики | 10 | 1 500 – 9 000 ₽ |
| Снайперки | 18 | 4 000 – 20 000 ₽ |
| Пулемёты | 7 | 9 000 – 25 000 ₽ |
| Гранатомёты и ПТРК | 10 | 4 000 – 30 000 ₽ |
| Ближний бой | 6 | 300 – 2 500 ₽ |
| Патроны TACZ | 29 | 260 – 1 400 ₽ |
| Патроны SBW | 10 | 260 – 11 000 ₽ |
| Патроны VVP | 4 | 420 – 2 500 ₽ |
| Взрывчатка | 15 | 250 – 2 600 ₽ |
| Ракеты и снаряды | 33 | 800 – 12 000 ₽ |
| Дроны | 8 | 6 000 – 18 000 ₽ |
| Боеприпасы дронов | 6 | 500 – 3 500 ₽ |
| Запчасти дронов | 10 | 150 – 2 000 ₽ |
| Техника | 7 | 18 000 – 80 000 ₽ |
| Шлемы | 84 | 1 350 – 6 300 ₽ |
| Бронежилеты | 139 | 1 650 – 12 600 ₽ |
| Плиты и ремонт | 8 | 1 500 – 1 500 ₽ |
| Штаны и обувь | 80 | 1 150 – 3 500 ₽ |
| Снаряжение | 54 | 200 – 6 000 ₽ |
| Медицина | 30 | 60 – 2 500 ₽ |
| Еда | 44 | 150 – 200 ₽ |
| Вода и напитки | 29 | 80 – 250 ₽ |

---

## 5. Как загрузить каталог

### Вариант А — датапак (рекомендуется)

1. Скопируй `gxw-economy-datapack.zip` в `saves/<мир>/datapacks/`.
2. В мире: `/reload`, затем `/function gxw_economy:setup`.
3. Проверь: `/gxw_terminal_shop catalog list`.

Функции можно запускать по отдельности: `gxw_economy:rifles`, `gxw_economy:ammo_tacz`, `gxw_economy:vehicles` и т.д.

### Вариант Б — вручную

Файл `shop-commands.txt` — те же команды с `/` для чата. Работает только для оператора (permission level 2).

### TACZ

Оружие TACZ — не отдельные предметы, а `tacz:modern_kinetic_gun` с тегом `GunId`:

```
/gxw_terminal_shop catalog addcategory "Автоматы" item tacz:modern_kinetic_gun{GunId:"tacz:ak47"} price 6000
```

Если команда с NBT не проходит — возьми оружие в руку и используй `catalog addheldcategory "Автоматы" price 6000`.

---

## 6. Полный прайс

Ниже — все 761 позиция. Машиночитаемые версии: `prices.csv` (Excel/Sheets) и `shop-commands.txt`.


### Пистолеты (24)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| ПЯ "Грач" | `superbwarfare:mp_443` | 800 ₽ | 1 |
| M1911A1 | `superbwarfare:m_1911` | 900 ₽ | 1 |
| Glock 17 | `superbwarfare:glock_17` | 1 000 ₽ | 1 |
| Берет | `vvp:bereta` | 1 100 ₽ | 1 |
| Золотой Desert Eagle .357 | `tacz:modern_kinetic_gun{GunId:"tacz:deagle_golden"}` | 1 200 ₽ | 1 |
| Beretta 93R | `tacz:modern_kinetic_gun{GunId:"tacz:b93r"}` | 1 200 ₽ | 1 |
| Beretta М9А4 | `tacz:modern_kinetic_gun{GunId:"tacz:m9a4"}` | 1 200 ₽ | 1 |
| Chiappa Rhino .357 | `tacz:modern_kinetic_gun{GunId:"tacz:rhino357"}` | 1 200 ₽ | 1 |
| CZ-75 | `tacz:modern_kinetic_gun{GunId:"tacz:cz75"}` | 1 200 ₽ | 1 |
| DEAGLE-CONSPIRACY | `tacz:modern_kinetic_gun{GunId:"lrl:deagle_conspiracy"}` | 1 200 ₽ | 1 |
| DEAGLE-PILOT | `tacz:modern_kinetic_gun{GunId:"lrl:deagle_pilot"}` | 1 200 ₽ | 1 |
| Desert Eagle .50 | `tacz:modern_kinetic_gun{GunId:"tacz:deagle"}` | 1 200 ₽ | 1 |
| Glock 17 | `tacz:modern_kinetic_gun{GunId:"tacz:glock_17"}` | 1 200 ₽ | 1 |
| GLOCK 17-HIGH BEAM | `tacz:modern_kinetic_gun{GunId:"lrl:glock_17_highbeam"}` | 1 200 ₽ | 1 |
| GLOCK 17-SILVER PURPLE | `tacz:modern_kinetic_gun{GunId:"lrl:glock_17_silverpurple"}` | 1 200 ₽ | 1 |
| Lonetrail .30-06 | `tacz:modern_kinetic_gun{GunId:"tacz:lonetrail"}` | 1 200 ₽ | 1 |
| M1911 | `tacz:modern_kinetic_gun{GunId:"tacz:m1911"}` | 1 200 ₽ | 1 |
| MK23 SOCOM | `tacz:modern_kinetic_gun{GunId:"tacz:hk_mk23"}` | 1 200 ₽ | 1 |
| P320 | `tacz:modern_kinetic_gun{GunId:"tacz:p320"}` | 1 200 ₽ | 1 |
| P320-DOCTOR | `tacz:modern_kinetic_gun{GunId:"lrl:p320_doctor"}` | 1 200 ₽ | 1 |
| Taurus Model 943 | `tacz:modern_kinetic_gun{GunId:"tacz:taurus943"}` | 1 200 ₽ | 1 |
| Taurus Raging Hunter | `tacz:modern_kinetic_gun{GunId:"tacz:taurus500"}` | 1 200 ₽ | 1 |
| Timeless .50 Z-Type | `tacz:modern_kinetic_gun{GunId:"tacz:timeless50"}` | 1 200 ₽ | 1 |
| Glock 18 | `superbwarfare:glock_18` | 1 300 ₽ | 1 |

### ПП (16)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| HK MP5A5-AGENT | `tacz:modern_kinetic_gun{GunId:"lrl:hk_mp5a5_agent"}` | 3 000 ₽ | 1 |
| HK MP5A5-CYREX | `tacz:modern_kinetic_gun{GunId:"lrl:hk_mp5a5_cyrex"}` | 3 000 ₽ | 1 |
| HK-MP5A5 | `tacz:modern_kinetic_gun{GunId:"tacz:hk_mp5a5"}` | 3 000 ₽ | 1 |
| KRISS Vector | `tacz:modern_kinetic_gun{GunId:"tacz:vector45"}` | 3 000 ₽ | 1 |
| MP5 | `superbwarfare:mp_5` | 3 000 ₽ | 1 |
| MP7-CIRRUS | `tacz:modern_kinetic_gun{GunId:"lrl:mp7_cirrus"}` | 3 000 ₽ | 1 |
| P90 | `tacz:modern_kinetic_gun{GunId:"tacz:p90"}` | 3 000 ₽ | 1 |
| P90-ASIIMOV | `tacz:modern_kinetic_gun{GunId:"lrl:p90_asiimov"}` | 3 000 ₽ | 1 |
| P90-COLDBLOOD | `tacz:modern_kinetic_gun{GunId:"lrl:p90_cold_blooded"}` | 3 000 ₽ | 1 |
| P90-INDUSTRIES | `tacz:modern_kinetic_gun{GunId:"lrl:p90_industries"}` | 3 000 ₽ | 1 |
| Ump45 | `tacz:modern_kinetic_gun{GunId:"tacz:ump45"}` | 3 000 ₽ | 1 |
| UMP45-CRIMSON FOIL | `tacz:modern_kinetic_gun{GunId:"lrl:ump45_crimson_foil"}` | 3 000 ₽ | 1 |
| UMP45-HURRICANE | `tacz:modern_kinetic_gun{GunId:"lrl:ump45_hurrican"}` | 3 000 ₽ | 1 |
| Uzi | `tacz:modern_kinetic_gun{GunId:"tacz:uzi"}` | 3 000 ₽ | 1 |
| VECTOR45-SILVERPURPLE | `tacz:modern_kinetic_gun{GunId:"lrl:vector45_silverpurple"}` | 3 000 ₽ | 1 |
| Vector | `superbwarfare:vector` | 4 200 ₽ | 1 |

### Автоматы (45)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Marlin Model 1894 | `superbwarfare:marlin` | 3 500 ₽ | 1 |
| СКС | `superbwarfare:sks` | 4 500 ₽ | 1 |
| AK-47 | `superbwarfare:ak_47` | 5 500 ₽ | 1 |
| М4А1 | `tacz:modern_kinetic_gun{GunId:"tacz:m4a1"}` | 6 000 ₽ | 1 |
| СКС | `tacz:modern_kinetic_gun{GunId:"tacz:sks_tactical"}` | 6 000 ₽ | 1 |
| Acr | `tacz:modern_kinetic_gun{GunId:"lradd:acr"}` | 6 000 ₽ | 1 |
| AK-12 | `superbwarfare:ak_12` | 6 000 ₽ | 1 |
| Aug | `tacz:modern_kinetic_gun{GunId:"lradd:aug"}` | 6 000 ₽ | 1 |
| Aug | `tacz:modern_kinetic_gun{GunId:"tacz:aug"}` | 6 000 ₽ | 1 |
| AUG-SECURITY | `tacz:modern_kinetic_gun{GunId:"lrl:aug_security"}` | 6 000 ₽ | 1 |
| AUG-YWZJ | `tacz:modern_kinetic_gun{GunId:"lrl:aug_ywzj"}` | 6 000 ₽ | 1 |
| HK G3 | `tacz:modern_kinetic_gun{GunId:"tacz:hk_g3"}` | 6 000 ₽ | 1 |
| HK G36K | `tacz:modern_kinetic_gun{GunId:"tacz:g36k"}` | 6 000 ₽ | 1 |
| Hk416d | `tacz:modern_kinetic_gun{GunId:"tacz:hk416d"}` | 6 000 ₽ | 1 |
| HK416D-BLACKICE | `tacz:modern_kinetic_gun{GunId:"lrl:hk416d_blackice"}` | 6 000 ₽ | 1 |
| HK416D-OCEAN | `tacz:modern_kinetic_gun{GunId:"lrl:hk416d_ocean"}` | 6 000 ₽ | 1 |
| HK416D-SECURITY | `tacz:modern_kinetic_gun{GunId:"lrl:hk416d_security"}` | 6 000 ₽ | 1 |
| M16a1 | `tacz:modern_kinetic_gun{GunId:"tacz:m16a1"}` | 6 000 ₽ | 1 |
| M16a4 | `tacz:modern_kinetic_gun{GunId:"tacz:m16a4"}` | 6 000 ₽ | 1 |
| M16A4-OCEAN | `tacz:modern_kinetic_gun{GunId:"lrl:m16a4_ocean"}` | 6 000 ₽ | 1 |
| M4A1-SILVER PURPLE | `tacz:modern_kinetic_gun{GunId:"lrl:m4a1_silverpurple"}` | 6 000 ₽ | 1 |
| M4A1-TEMUKAU | `tacz:modern_kinetic_gun{GunId:"lrl:m4a1_temukau"}` | 6 000 ₽ | 1 |
| M4A1-TURBINE | `tacz:modern_kinetic_gun{GunId:"lrl:m4a1_turbine"}` | 6 000 ₽ | 1 |
| M4A1-ZERO | `tacz:modern_kinetic_gun{GunId:"lrl:m4a1_zero"}` | 6 000 ₽ | 1 |
| Mdr 223 | `tacz:modern_kinetic_gun{GunId:"lradd:mdr_223"}` | 6 000 ₽ | 1 |
| Mdr 308 | `tacz:modern_kinetic_gun{GunId:"lradd:mdr_308"}` | 6 000 ₽ | 1 |
| MDR-BLACKICE | `tacz:modern_kinetic_gun{GunId:"lrl:mdr_223_blackice"}` | 6 000 ₽ | 1 |
| MDR-DAWN | `tacz:modern_kinetic_gun{GunId:"lrl:mdr_308_dawn"}` | 6 000 ₽ | 1 |
| MDR-PITY | `tacz:modern_kinetic_gun{GunId:"lrl:mdr_223_pity"}` | 6 000 ₽ | 1 |
| Mk14 | `tacz:modern_kinetic_gun{GunId:"tacz:mk14"}` | 6 000 ₽ | 1 |
| Mk47 | `tacz:modern_kinetic_gun{GunId:"lradd:mk47"}` | 6 000 ₽ | 1 |
| NGSW R-PITY | `tacz:modern_kinetic_gun{GunId:"lrl:ngsw_r_pity"}` | 6 000 ₽ | 1 |
| Qbz191 Em | `tacz:modern_kinetic_gun{GunId:"lradd:qbz191_em"}` | 6 000 ₽ | 1 |
| RD704-ASIIMOV | `tacz:modern_kinetic_gun{GunId:"lrl:rd704_asiimov"}` | 6 000 ₽ | 1 |
| RD704-BLACKICE | `tacz:modern_kinetic_gun{GunId:"lrl:rd704_blackice"}` | 6 000 ₽ | 1 |
| SCAR L-OCEAN | `tacz:modern_kinetic_gun{GunId:"lrl:scar_l_ocean"}` | 6 000 ₽ | 1 |
| SCAR-H | `tacz:modern_kinetic_gun{GunId:"tacz:scar_h"}` | 6 000 ₽ | 1 |
| SCAR-L | `tacz:modern_kinetic_gun{GunId:"tacz:scar_l"}` | 6 000 ₽ | 1 |
| SPR-15 HB «Стрелец» | `tacz:modern_kinetic_gun{GunId:"tacz:spr15hb"}` | 6 000 ₽ | 1 |
| SPR15-MEDIC | `tacz:modern_kinetic_gun{GunId:"lrl:spr_15_medic"}` | 6 000 ₽ | 1 |
| QBZ-95-1 | `superbwarfare:qbz_95` | 6 200 ₽ | 1 |
| QBZ-191 | `superbwarfare:qbz_191` | 6 500 ₽ | 1 |
| HK-416 | `superbwarfare:hk_416` | 7 000 ₽ | 1 |
| M4A1 | `superbwarfare:m_4` | 7 000 ₽ | 1 |
| MK-14 EBR | `superbwarfare:mk_14` | 8 000 ₽ | 1 |

### Дробовики (10)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Кустарный дробовик | `superbwarfare:homemade_shotgun` | 1 500 ₽ | 1 |
| M870 MCS | `superbwarfare:m_870` | 3 200 ₽ | 1 |
| Боевой дробовик M1014 | `tacz:modern_kinetic_gun{GunId:"tacz:m1014"}` | 3 500 ₽ | 1 |
| ДБ-2 "Дурин" | `tacz:modern_kinetic_gun{GunId:"tacz:db_short"}` | 3 500 ₽ | 1 |
| ДБ-4 "Урсус" | `tacz:modern_kinetic_gun{GunId:"tacz:db_long"}` | 3 500 ₽ | 1 |
| Многоцелевой дробовик SPAS-12 | `tacz:modern_kinetic_gun{GunId:"tacz:spas_12"}` | 3 500 ₽ | 1 |
| AA-12 | `tacz:modern_kinetic_gun{GunId:"tacz:aa12"}` | 3 500 ₽ | 1 |
| DB LONG-SUPER | `tacz:modern_kinetic_gun{GunId:"lrl:db_long_super"}` | 3 500 ₽ | 1 |
| Remington 870 (M870) | `tacz:modern_kinetic_gun{GunId:"tacz:m870"}` | 3 500 ₽ | 1 |
| AA-12 | `superbwarfare:aa_12` | 9 000 ₽ | 1 |

### Снайперки (18)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Охотничья винтовка | `superbwarfare:hunting_rifle` | 4 000 ₽ | 1 |
| Винтовка Мосина | `superbwarfare:mosin_nagant` | 5 000 ₽ | 1 |
| Kar-98k | `superbwarfare:k_98` | 6 000 ₽ | 1 |
| Затворная винтовка Springfield 1873 | `tacz:modern_kinetic_gun{GunId:"tacz:springfield1873"}` | 9 000 ₽ | 1 |
| СВД | `superbwarfare:svd` | 9 000 ₽ | 1 |
| Ai Awp | `tacz:modern_kinetic_gun{GunId:"tacz:ai_awp"}` | 9 000 ₽ | 1 |
| AI AWP-ASIIMOV | `tacz:modern_kinetic_gun{GunId:"lrl:ai_awp_asiimov"}` | 9 000 ₽ | 1 |
| Barrett M82 (M107) | `tacz:modern_kinetic_gun{GunId:"tacz:m107"}` | 9 000 ₽ | 1 |
| Barrett M95 | `tacz:modern_kinetic_gun{GunId:"tacz:m95"}` | 9 000 ₽ | 1 |
| Gauss Rifle | `tacz:modern_kinetic_gun{GunId:"lradd:gauss_rifle"}` | 9 000 ₽ | 1 |
| Karabiner 98 Kurz | `tacz:modern_kinetic_gun{GunId:"tacz:kar98"}` | 9 000 ₽ | 1 |
| M700-OCEAN | `tacz:modern_kinetic_gun{GunId:"lrl:m700_ocean"}` | 9 000 ₽ | 1 |
| Nitro 505 | `tacz:modern_kinetic_gun{GunId:"lradd:nitro_505"}` | 9 000 ₽ | 1 |
| Remington M700 | `tacz:modern_kinetic_gun{GunId:"tacz:m700"}` | 9 000 ₽ | 1 |
| M98B | `superbwarfare:m_98b` | 11 000 ₽ | 1 |
| AWM | `superbwarfare:awm` | 12 000 ₽ | 1 |
| ЗВЕРЬ | `superbwarfare:beast` | 15 000 ₽ | 1 |
| NTW-20 | `superbwarfare:ntw_20` | 20 000 ₽ | 1 |

### Пулемёты (7)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| РПК | `superbwarfare:rpk` | 9 000 ₽ | 1 |
| M60 | `superbwarfare:m_60` | 11 000 ₽ | 1 |
| М249 | `tacz:modern_kinetic_gun{GunId:"tacz:m249"}` | 12 000 ₽ | 1 |
| Пулемёт FN EVOLYS | `tacz:modern_kinetic_gun{GunId:"tacz:fn_evolys"}` | 12 000 ₽ | 1 |
| РПК | `tacz:modern_kinetic_gun{GunId:"tacz:rpk"}` | 12 000 ₽ | 1 |
| M2HB | `superbwarfare:m_2_hb` | 15 000 ₽ | 1 |
| М134 | `superbwarfare:minigun` | 25 000 ₽ | 1 |

### Гранатомёты и ПТРК (10)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Артиллерийский бинокль | `superbwarfare:artillery_indicator` | 4 000 ₽ | 1 |
| Миномёт | `superbwarfare:mortar_deployer` | 8 000 ₽ | 1 |
| Гранатомёт M79 | `superbwarfare:m_79` | 9 000 ₽ | 1 |
| Противотанковая мина TM-62 | `superbwarfare:tm_62` | 10 000 ₽ | 1 |
| РПГ-7 | `superbwarfare:rpg` | 12 000 ₽ | 1 |
| Противотанковый ракетный комплекс TOW | `superbwarfare:tow_deployer` | 14 000 ₽ | 1 |
| Гранатомет M320 | `tacz:modern_kinetic_gun{GunId:"tacz:m320"}` | 15 000 ₽ | 1 |
| РПГ-7 | `tacz:modern_kinetic_gun{GunId:"tacz:rpg7"}` | 15 000 ₽ | 1 |
| ПЗРК Игла-9К38 | `superbwarfare:igla_9k38` | 28 000 ₽ | 1 |
| FGM-148 Javelin | `superbwarfare:javelin` | 30 000 ₽ | 1 |

### Ближний бой (6)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Пехотная лопата | `superbwarfare:military_shovel` | 300 ₽ | 1 |
| Монтировка | `superbwarfare:crowbar` | 350 ₽ | 1 |
| Нож | `superbwarfare:knife` | 400 ₽ | 1 |
| Ти-Образная дубинка | `superbwarfare:t_baton` | 1 200 ₽ | 1 |
| Электрическая дубинка | `superbwarfare:electric_baton` | 1 800 ₽ | 1 |
| Тазер | `superbwarfare:taser` | 2 500 ₽ | 1 |

### Патроны TACZ (29)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Патроны .45 ACP | `tacz:ammo{AmmoId:"tacz:45acp"}` | 260 ₽ | 30 |
| Патроны 5.7×28 мм ББ | `tacz:ammo{AmmoId:"tacz:57x28"}` | 260 ₽ | 30 |
| Патроны 9×19мм | `tacz:ammo{AmmoId:"tacz:9mm"}` | 260 ₽ | 30 |
| Дробь 12×70 | `tacz:ammo{AmmoId:"tacz:12g"}` | 380 ₽ | 30 |
| 5Патроны 5.8мм | `tacz:ammo{AmmoId:"tacz:58x42"}` | 400 ₽ | 30 |
| Граната 40мм | `tacz:ammo{AmmoId:"tacz:40mm"}` | 400 ₽ | 30 |
| Патроны .22 Winchester Magnum | `tacz:ammo{AmmoId:"tacz:22wmr"}` | 400 ₽ | 30 |
| Патроны .357 | `tacz:ammo{AmmoId:"tacz:357mag"}` | 400 ₽ | 30 |
| Патроны .45-70 | `tacz:ammo{AmmoId:"tacz:45_70"}` | 400 ₽ | 30 |
| Патроны .50 | `tacz:ammo{AmmoId:"tacz:50ae"}` | 400 ₽ | 30 |
| Патроны .500 Magnum | `tacz:ammo{AmmoId:"tacz:500mag"}` | 400 ₽ | 30 |
| Патроны 4.6 мм ББ | `tacz:ammo{AmmoId:"tacz:46x30"}` | 400 ₽ | 30 |
| Патроны 6.8×51мм | `tacz:ammo{AmmoId:"tacz:68x51fury"}` | 400 ₽ | 30 |
| Патроны 7.62×25мм | `tacz:ammo{AmmoId:"tacz:762x25"}` | 400 ₽ | 30 |
| Ракета РПГ-7 | `tacz:ammo{AmmoId:"tacz:rpg_rocket"}` | 400 ₽ | 30 |
| M993 | `tacz:ammo{AmmoId:"lradd:m993"}` | 400 ₽ | 30 |
| 545x39 | `tacz:ammo{AmmoId:"lradd:545x39"}` | 420 ₽ | 30 |
| Патроны 5.56×45мм | `tacz:ammo{AmmoId:"tacz:556x45"}` | 420 ₽ | 30 |
| Патрон .30-06 Springfield | `tacz:ammo{AmmoId:"tacz:30_06"}` | 520 ₽ | 30 |
| Патроны .308 | `tacz:ammo{AmmoId:"tacz:308"}` | 520 ₽ | 30 |
| Патроны 7.62×54мм | `tacz:ammo{AmmoId:"tacz:762x54"}` | 520 ₽ | 30 |
| Патроны 8мм Mauser | `tacz:ammo{AmmoId:"tacz:792x57"}` | 520 ₽ | 30 |
| 2mm Ec | `tacz:ammo{AmmoId:"lradd:2mm_ec"}` | 900 ₽ | 30 |
| Arrow | `tacz:ammo{AmmoId:"lradd:arrow"}` | 900 ₽ | 30 |
| Flintlock Bullet | `tacz:ammo{AmmoId:"lradd:flintlock_bullet"}` | 900 ₽ | 30 |
| Fusion Cell | `tacz:ammo{AmmoId:"lradd:fusion_cell"}` | 900 ₽ | 30 |
| Nail | `tacz:ammo{AmmoId:"lradd:nail"}` | 900 ₽ | 30 |
| Патроны .338 | `tacz:ammo{AmmoId:"tacz:338"}` | 1 400 ₽ | 30 |
| Патроны .50 BMG | `tacz:ammo{AmmoId:"tacz:50bmg"}` | 1 400 ₽ | 30 |

### Патроны SBW (10)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Пистолетные патроны | `superbwarfare:handgun_ammo` | 260 ₽ | 1 |
| Патроны для дробовика | `superbwarfare:shotgun_ammo` | 380 ₽ | 1 |
| Винтовочные патроны | `superbwarfare:rifle_ammo` | 420 ₽ | 1 |
| Тяжёлые патроны | `superbwarfare:heavy_ammo` | 520 ₽ | 1 |
| Ящик с патронами | `superbwarfare:ammo_box` | 1 200 ₽ | 1 |
| Снайперские патроны | `superbwarfare:sniper_ammo` | 1 400 ₽ | 1 |
| Коробка для пистолетных патронов | `superbwarfare:handgun_ammo_box` | 2 400 ₽ | 1 |
| Коробка для патронов дробовика | `superbwarfare:shotgun_ammo_box` | 3 400 ₽ | 1 |
| Коробка для винтовочных патронов | `superbwarfare:rifle_ammo_box` | 3 800 ₽ | 1 |
| Коробка для снайперских патронов | `superbwarfare:sniper_ammo_box` | 11 000 ₽ | 1 |

### Патроны VVP (4)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Патроны 7.62 мм | `vvp:item_7_62mm` | 420 ₽ | 1 |
| Патроны 12.7 мм | `vvp:item_12_7mm` | 900 ₽ | 1 |
| Ящик боеприпасов 40 мм | `vvp:item_40_mm` | 1 200 ₽ | 1 |
| Малокалиберные снаряды | `vvp:item_30mm` | 2 500 ₽ | 1 |

### Взрывчатка (15)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Signal Flare | `survivorsarsenal:signal_flare` | 250 ₽ | 1 |
| Дымовая граната M18 | `superbwarfare:m18_smoke_grenade` | 450 ₽ | 1 |
| Molotov Cocktail | `survivorsarsenal:molotov` | 500 ₽ | 1 |
| Детонатор | `superbwarfare:detonator` | 700 ₽ | 1 |
| Remote Detonator | `survivorsarsenal:remote_detonator` | 700 ₽ | 1 |
| Incendiary Grenade | `survivorsarsenal:incendiary_grenade` | 800 ₽ | 1 |
| Ручная граната | `superbwarfare:hand_grenade` | 900 ₽ | 1 |
| Frag Grenade | `survivorsarsenal:frag_grenade` | 900 ₽ | 1 |
| Граната РГО | `superbwarfare:rgo_grenade` | 950 ₽ | 1 |
| Ударная мина | `superbwarfare:lunge_mine` | 1 000 ₽ | 1 |
| Граната 40мм | `superbwarfare:grenade_40mm` | 1 200 ₽ | 1 |
| BLU-43B Драконий Зуб | `superbwarfare:blu_43_mine` | 1 300 ₽ | 1 |
| M18A1 «Клеймор» | `superbwarfare:claymore_mine` | 1 600 ₽ | 1 |
| Настенная мина | `superbwarfare:edd` | 1 800 ₽ | 1 |
| C4 | `superbwarfare:c4_bomb` | 2 600 ₽ | 1 |

### Ракеты и снаряды (33)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Пустая гильза 122мм | `vvp:shell_122mm_casing` | 800 ₽ | 1 |
| Снаряд миномёта | `superbwarfare:mortar_shell` | 800 ₽ | 1 |
| Миномётный снаряд с белым фосфором | `superbwarfare:mortar_shell_wp` | 950 ₽ | 1 |
| Снаряд миномёта с зельем | `superbwarfare:potion_mortar_shell` | 1 100 ₽ | 1 |
| Мелкокалиберный фугасный снаряд | `superbwarfare:small_shell_he` | 1 200 ₽ | 1 |
| Мелкокалиберный зенитный снаряд | `superbwarfare:small_shell_aa` | 1 300 ₽ | 1 |
| Мелкокалиберный бронебойный снаряд | `superbwarfare:small_shell_ap` | 1 400 ₽ | 1 |
| Мелкокалиберный картечный снаряд | `superbwarfare:small_shell_gs` | 1 500 ₽ | 1 |
| Микроракета | `superbwarfare:micro_missile` | 2 000 ₽ | 1 |
| 122мм ОФ снаряд | `vvp:shell_122mm` | 2 500 ₽ | 1 |
| Ракета РПГ PG-7VM | `superbwarfare:rpg_rocket_standard` | 2 600 ₽ | 1 |
| Среднекалиберный фугасный снаряд | `superbwarfare:medium_rocket_he` | 2 600 ₽ | 1 |
| Бронебойный снаряд | `vvp:ap_shell` | 3 000 ₽ | 1 |
| Маленькая авиабомба | `superbwarfare:small_aerial_bomb` | 3 000 ₽ | 1 |
| Мелкокалиберные ракеты | `superbwarfare:small_rocket` | 3 000 ₽ | 1 |
| Среднекалиберный бронебойный снаряд | `superbwarfare:medium_rocket_ap` | 3 000 ₽ | 1 |
| Среднекалиберный кассетный снаряд | `superbwarfare:medium_rocket_cm` | 3 200 ₽ | 1 |
| Осколочно-фугасный снаряд | `vvp:he_shell` | 3 500 ₽ | 1 |
| Крупнокалиберный фугасный снаряд | `superbwarfare:large_shell_he` | 4 200 ₽ | 1 |
| Ракета РПГ "Yasin 105 TBG" | `superbwarfare:rpg_rocket_tbg` | 4 200 ₽ | 1 |
| Крупнокалиберный снаряд с белым фосфором | `superbwarfare:large_shell_wp` | 4 600 ₽ | 1 |
| Крупнокалиберный бронебойный снаряд | `superbwarfare:large_shell_ap` | 4 800 ₽ | 1 |
| Крупнокалиберный кассетный снаряд | `superbwarfare:large_shell_cm` | 5 000 ₽ | 1 |
| Крупнокалиберный картечный снаряд | `superbwarfare:large_shell_gs` | 5 200 ₽ | 1 |
| Средняя авиабомба | `superbwarfare:medium_aerial_bomb` | 6 000 ₽ | 1 |
| Средняя ракета против наземных целей | `superbwarfare:medium_anti_ground_missile` | 6 500 ₽ | 1 |
| Ракета Воздух-Воздух | `vvp:aam` | 7 000 ₽ | 1 |
| Средняя Зенитная Ракета | `superbwarfare:medium_anti_air_missile` | 7 000 ₽ | 1 |
| Ракета Воздух-Земля | `vvp:agm` | 8 000 ₽ | 1 |
| Ракета Javelin | `superbwarfare:javelin_missile` | 8 000 ₽ | 1 |
| Большая ракета против наземных целей | `superbwarfare:large_anti_ground_missile` | 12 000 ₽ | 1 |
| Ракета GMLRS M30A1 | `vvp:gmlrs_m30a1` | 12 000 ₽ | 1 |
| Ракета GMLRS M31 | `vvp:gmlrs_m31` | 12 000 ₽ | 1 |

### Дроны (8)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| DJI Mavic 3 Pro | `fpvdrone:mavic_drone` | 6 000 ₽ | 1 |
| Светлячок | `superbwarfare:firefly` | 6 500 ₽ | 1 |
| Дрон | `superbwarfare:drone` | 8 000 ₽ | 1 |
| Барражирующий боеприпас FP-1 | `fpvdrone:fp1_drone` | 9 000 ₽ | 1 |
| Разведывательный БПЛА «Орлан-10» | `fpvdrone:orlan10_drone` | 12 000 ₽ | 1 |
| Роевой дрон | `superbwarfare:swarm_drone` | 14 000 ₽ | 1 |
| Тепловизионный FPV-дрон 9" | `fpvdrone:thermal_drone` | 15 000 ₽ | 1 |
| Барражирующий боеприпас «Ланцет-51» | `fpvdrone:lancet51_drone` | 18 000 ₽ | 1 |

### Боеприпасы дронов (6)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Граната РГД-5 | `fpvdrone:rgd5` | 500 ₽ | 1 |
| Граната Mk.1 | `fpvdrone:bomb_1` | 800 ₽ | 1 |
| Граната Mk.2 | `fpvdrone:bomb_2` | 1 200 ₽ | 1 |
| Граната Mk.3 | `fpvdrone:bomb_3` | 1 800 ₽ | 1 |
| 120-мм миномёт | `fpvdrone:mortar_120` | 3 000 ₽ | 1 |
| 120-мм мина | `fpvdrone:mortar_mine_120` | 3 500 ₽ | 1 |

### Запчасти дронов (10)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Пропеллер | `fpvdrone:propeller` | 150 ₽ | 1 |
| Балласт | `fpvdrone:weight` | 200 ₽ | 1 |
| Электродвигатель | `fpvdrone:electric_motor` | 300 ₽ | 1 |
| Аккумулятор 6S 3300mAh LiPo | `fpvdrone:battery` | 400 ₽ | 1 |
| Канистра с топливом | `fpvdrone:fuel_can` | 500 ₽ | 1 |
| Сброс для гранат | `fpvdrone:bomb_holder` | 600 ₽ | 1 |
| Минный жилет «Открывашка» | `fpvdrone:opener` | 700 ₽ | 1 |
| Процессор (устаревший) | `fpvdrone:processor` | 900 ₽ | 1 |
| Пусковая рампа для дронов | `fpvdrone:ramp` | 1 000 ₽ | 1 |
| Пульт DJI RC Pro (Mavic 3) | `fpvdrone:dji_controller` | 2 000 ₽ | 1 |

### Техника (7)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Установка ПТРК Корнет | `vvp:kornet_item` | 18 000 ₽ | 1 |
| Чертёж 138.6mm50 Mle1934 R1938 | `superbwarfare:mle_1934_blueprint` | 20 000 ₽ | 1 |
| Установка АГС-30 | `vvp:ags_30_item` | 25 000 ₽ | 1 |
| Чертёж H/PJ-11 CIWS | `superbwarfare:hpj_11_blueprint` | 45 000 ₽ | 1 |
| Чертёж 5''/54 Mk42 | `superbwarfare:mk_42_blueprint` | 55 000 ₽ | 1 |
| Чертёж 130mm/58 BL-132 | `superbwarfare:bl_132_blueprint` | 60 000 ₽ | 1 |
| Чертёж энергетической пушки "Аннигилятор" | `superbwarfare:annihilator_blueprint` | 80 000 ₽ | 1 |

### Шлемы (84)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Шлем «Пресса» | `warbornrenewed:press-helmet` | 1 350 ₽ | 1 |
| Маскхалат Капюшон (Джунгли) | `warbornrenewed:ghillie-helmet-jungle` | 2 950 ₽ | 1 |
| Маскхалат Капюшон (Зимний) | `warbornrenewed:ghillie-helmet-winter` | 2 950 ₽ | 1 |
| Маскхалат Капюшон (Лесной) | `warbornrenewed:ghillie-helmet-sosna` | 2 950 ₽ | 1 |
| Маскхалат Капюшон (Осенний) | `warbornrenewed:ghillie-helmet-autumn` | 2 950 ₽ | 1 |
| Маскхалат Капюшон (Пустынный) | `warbornrenewed:ghillie-helmet-desert` | 2 950 ₽ | 1 |
| Ghillie Helmet (Acacia) | `fracturepoint:ghillie_helmet_acacia` | 2 950 ₽ | 1 |
| Ghillie Helmet (Birch) | `fracturepoint:ghillie_helmet_birch` | 2 950 ₽ | 1 |
| Ghillie Helmet (Dark Oak) | `fracturepoint:ghillie_helmet_dark_oak` | 2 950 ₽ | 1 |
| Ghillie Helmet (Jungle) | `fracturepoint:ghillie_helmet_jungle` | 2 950 ₽ | 1 |
| Ghillie Helmet (Mangrove) | `fracturepoint:ghillie_helmet_mangrove` | 2 950 ₽ | 1 |
| Ghillie Helmet (Oak) | `fracturepoint:ghillie_helmet_oak` | 2 950 ₽ | 1 |
| Ghillie Helmet (Snow) | `fracturepoint:ghillie_helmet_snow` | 2 950 ₽ | 1 |
| Ghillie Helmet (Spruce) | `fracturepoint:ghillie_helmet_spruce` | 2 950 ₽ | 1 |
| "Joker" Armored Helmet | `lrarmor:joker_armed_helmet` | 3 600 ₽ | 1 |
| "Joker" Headgear | `lrarmor:joker_helmet` | 3 600 ₽ | 1 |
| SCOUT-HELMET | `lrarmor:scout_helmet` | 3 600 ₽ | 1 |
| ARMORED CHEMICAL-HELMET | `lrarmor:armored_chemical_helmet` | 4 050 ₽ | 1 |
| CHEMICAL PROTECTIVE-HELMET | `lrarmor:chemical_protective_helmet` | 4 050 ₽ | 1 |
| MEDICAL-HELMET | `lrarmor:medical_helmet` | 4 050 ₽ | 1 |
| Шлем "FAST" | `zerocontact:fast_mt` | 4 500 ₽ | 1 |
| Шлем NATO (Лесной) | `warbornrenewed:nato-wood-helmet` | 4 500 ₽ | 1 |
| Шлем NATO (Песочный) | `warbornrenewed:nato-sand-helmet` | 4 500 ₽ | 1 |
| ATTACKER-HELMET | `lrarmor:attacker_helmet` | 4 500 ₽ | 1 |
| Beta 7 Helmet | `fracturepoint:beta7_helmet` | 4 500 ₽ | 1 |
| Beta 7 Helmet (Ash) | `fracturepoint:beta7_helmet_ash` | 4 500 ₽ | 1 |
| Beta 7 Helmet (Slate) | `fracturepoint:beta7_helmet_slate` | 4 500 ₽ | 1 |
| Beta 7 NVG Helmet | `fracturepoint:beta7_nvg_helmet` | 4 500 ₽ | 1 |
| Beta 7 NVG Helmet (Ash) | `fracturepoint:beta7_nvg_helmet_ash` | 4 500 ₽ | 1 |
| Beta 7 NVG Helmet (Slate) | `fracturepoint:beta7_nvg_helmet_slate` | 4 500 ₽ | 1 |
| Black Cap | `lrarmor:atf_helmet` | 4 500 ₽ | 1 |
| Black Helmet | `lrarmor:atf_vest_helmet` | 4 500 ₽ | 1 |
| Black Tactical Helmet | `lrarmor:dea_armed_helmet` | 4 500 ₽ | 1 |
| FBI Cap | `lrarmor:fbi_helmet` | 4 500 ₽ | 1 |
| FSB Machine Gunner Helmet | `fracturepoint:fsb_machine_gunner_helmet` | 4 500 ₽ | 1 |
| FSB Soldier Helmet | `fracturepoint:fsb_soldier_helmet` | 4 500 ₽ | 1 |
| FSB Squad Leader Helmet | `fracturepoint:fsb_squad_leader_helmet` | 4 500 ₽ | 1 |
| Gpngv Nato Helmet Desert | `warbornrenewed:gpngv-nato-helmet-desert` | 4 500 ₽ | 1 |
| Gpngv Nato Wood Helmet | `warbornrenewed:gpngv-nato-wood-helmet` | 4 500 ₽ | 1 |
| Insurgency Commander Helmet | `fracturepoint:insurgency_commander_helmet` | 4 500 ₽ | 1 |
| Insurgency Shturmovik Helmet | `fracturepoint:insurgency_shturmovik_helmet` | 4 500 ₽ | 1 |
| IZ Helmet (Desert) | `fracturepoint:iz_helmet_desert` | 4 500 ₽ | 1 |
| IZ Helmet (Forest) | `fracturepoint:iz_helmet_forest` | 4 500 ₽ | 1 |
| IZ Helmet (Ops) | `fracturepoint:iz_helmet_ops` | 4 500 ₽ | 1 |
| IZ Helmet (Snow) | `fracturepoint:iz_helmet_snow` | 4 500 ₽ | 1 |
| IZ Helmet (Urban) | `fracturepoint:iz_helmet_urban` | 4 500 ₽ | 1 |
| IZ Machine Gunner Helmet (Desert) | `fracturepoint:iz_machine_gunner_helmet_desert` | 4 500 ₽ | 1 |
| IZ Machine Gunner Helmet (Forest) | `fracturepoint:iz_machine_gunner_helmet_forest` | 4 500 ₽ | 1 |
| IZ Machine Gunner Helmet (Ops) | `fracturepoint:iz_machine_gunner_helmet_ops` | 4 500 ₽ | 1 |
| IZ Machine Gunner Helmet (Snow) | `fracturepoint:iz_machine_gunner_helmet_snow` | 4 500 ₽ | 1 |
| IZ Machine Gunner Helmet (Urban) | `fracturepoint:iz_machine_gunner_helmet_urban` | 4 500 ₽ | 1 |
| Khaki Tactical Helmet | `lrarmor:fbi_armed_helmet` | 4 500 ₽ | 1 |
| Mashinegunner Ru Helmet | `fracturepoint:mashinegunner_ru_helmet` | 4 500 ₽ | 1 |
| NATO Helmet | `fracturepoint:nato_helmet` | 4 500 ₽ | 1 |
| NATO Helmet (Woodland) | `fracturepoint:nato_helmet_woodland` | 4 500 ₽ | 1 |
| Nato Mg Helmet | `fracturepoint:nato_mg_helmet` | 4 500 ₽ | 1 |
| Nato Shturmovik2 Helmet | `fracturepoint:nato_shturmovik2_helmet` | 4 500 ₽ | 1 |
| NATO Squad Leader Helmet | `fracturepoint:nato_sqad_leader_helmet` | 4 500 ₽ | 1 |
| NATO Squad Leader Helmet (Woodland) | `fracturepoint:nato_sqad_leader_helmet_woodland` | 4 500 ₽ | 1 |
| NATO Ukrainian Helmet | `fracturepoint:nato_ukr_helmet` | 4 500 ₽ | 1 |
| NATO Ukrainian Helmet (Woodland) | `fracturepoint:nato_ukr_helmet_woodland` | 4 500 ₽ | 1 |
| Pack Helmet | `warbornrenewed:pack_helmet` | 4 500 ₽ | 1 |
| Razvetchik Helmet | `fracturepoint:razvetchik_helmet` | 4 500 ₽ | 1 |
| RU Helmet | `fracturepoint:ru_helmet` | 4 500 ₽ | 1 |
| Shturmovikv2 Helmet | `fracturepoint:shturmovikv2_helmet` | 4 500 ₽ | 1 |
| SNIPER-HELMET | `lrarmor:sniper_helmet` | 4 500 ₽ | 1 |
| Soviet Officer Helmet | `fracturepoint:soviet_officer_helmet` | 4 500 ₽ | 1 |
| Soviet Soldier Helmet | `fracturepoint:soviet_soldier_helmet` | 4 500 ₽ | 1 |
| Squad Lider Ru Helmet | `fracturepoint:squad_lider_ru_helmet` | 4 500 ₽ | 1 |
| SSO Machine Gunner Helmet | `fracturepoint:sso_machine_gunner_helmet` | 4 500 ₽ | 1 |
| SSO Soldier Helmet | `fracturepoint:sso_soldier_helmet` | 4 500 ₽ | 1 |
| SSO Squad Leader Helmet | `fracturepoint:sso_squad_leader_helmet` | 4 500 ₽ | 1 |
| Tactical Sunglasses | `lrarmor:irs_helmet` | 4 500 ₽ | 1 |
| Wig | `lrarmor:dea_helmet` | 4 500 ₽ | 1 |
| 6b47 Sso Helmet | `warbornrenewed:6b47-sso-helmet` | 5 200 ₽ | 1 |
| DEFENDER-HELMET | `lrarmor:defender_helmet` | 5 200 ₽ | 1 |
| Opscore Atacs Helmet | `warbornrenewed:opscore_atacs_helmet` | 5 200 ₽ | 1 |
| Ratnik Helmet | `fracturepoint:ratnik_helmet` | 5 200 ₽ | 1 |
| Ratnik Helmet 10t Wood | `warbornrenewed:ratnik-helmet-10t-wood` | 5 200 ₽ | 1 |
| Ratnik Sand Helmet | `warbornrenewed:ratnik-sand-helmet` | 5 200 ₽ | 1 |
| Ratnik Sand Helmet Gh | `warbornrenewed:ratnik-sand-helmet-gh` | 5 200 ₽ | 1 |
| Ratnik Wood Helmet | `warbornrenewed:ratnik-wood-helmet` | 5 200 ₽ | 1 |
| Killa Helmet | `fracturepoint:killa_helmet` | 6 300 ₽ | 1 |
| Tagilla Helmet | `fracturepoint:tagilla_helmet` | 6 300 ₽ | 1 |

### Бронежилеты (139)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Ghillie Uniform (Acacia) | `fracturepoint:ghillie_uniform_acacia` | 1 650 ₽ | 1 |
| Ghillie Uniform (Birch) | `fracturepoint:ghillie_uniform_birch` | 1 650 ₽ | 1 |
| Ghillie Uniform (Dark Oak) | `fracturepoint:ghillie_uniform_dark_oak` | 1 650 ₽ | 1 |
| Ghillie Uniform (Jungle) | `fracturepoint:ghillie_uniform_jungle` | 1 650 ₽ | 1 |
| Ghillie Uniform (Mangrove) | `fracturepoint:ghillie_uniform_mangrove` | 1 650 ₽ | 1 |
| Ghillie Uniform (Oak) | `fracturepoint:ghillie_uniform_oak` | 1 650 ₽ | 1 |
| Ghillie Uniform (Snow) | `fracturepoint:ghillie_uniform_snow` | 1 650 ₽ | 1 |
| Ghillie Uniform (Spruce) | `fracturepoint:ghillie_uniform_spruce` | 1 650 ₽ | 1 |
| Beta 7 Uniform | `fracturepoint:beta7_uniform` | 2 500 ₽ | 1 |
| Beta7 Uniform Ash | `fracturepoint:beta7_uniform_ash` | 2 500 ₽ | 1 |
| Beta7 Uniform Slate | `fracturepoint:beta7_uniform_slate` | 2 500 ₽ | 1 |
| British23 (Uniform) | `zerocontact:uniform_british23_top` | 2 500 ₽ | 1 |
| FSB Uniform | `fracturepoint:fsb_uniform` | 2 500 ₽ | 1 |
| G99 Combat uniform (Uniform) | `zerocontact:uniform_g99_top` | 2 500 ₽ | 1 |
| Insurgency Commander Uniform | `fracturepoint:insurgency_commander_uniform` | 2 500 ₽ | 1 |
| IZ Uniform (Desert) | `fracturepoint:iz_uniform_desert` | 2 500 ₽ | 1 |
| IZ Uniform (Forest) | `fracturepoint:iz_uniform_forest` | 2 500 ₽ | 1 |
| IZ Uniform (Ops) | `fracturepoint:iz_uniform_ops` | 2 500 ₽ | 1 |
| IZ Uniform (Snow) | `fracturepoint:iz_uniform_snow` | 2 500 ₽ | 1 |
| IZ Uniform (Urban) | `fracturepoint:iz_uniform_urban` | 2 500 ₽ | 1 |
| Soviet Uniform | `fracturepoint:soviet_uniform` | 2 500 ₽ | 1 |
| SPN (Uniform) | `zerocontact:uniform_spn_top` | 2 500 ₽ | 1 |
| SSO Uniform | `fracturepoint:sso_uniform` | 2 500 ₽ | 1 |
| Uniform Wedge Top | `zerocontact:uniform_wedge_top` | 2 500 ₽ | 1 |
| Бронежилет «Пресса» | `warbornrenewed:press-vest` | 2 700 ₽ | 1 |
| Press Chestplate | `warbornrenewed:press-chestplate` | 2 700 ₽ | 1 |
| Ratnik Uniform | `fracturepoint:ratnik_uniform` | 2 900 ₽ | 1 |
| Ratnik Uniform (Variant) | `fracturepoint:ratnik_uniform_variant` | 2 900 ₽ | 1 |
| Ghillie Chestplate (Acacia) | `fracturepoint:ghillie_chestplate_acacia` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Birch) | `fracturepoint:ghillie_chestplate_birch` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Dark Oak) | `fracturepoint:ghillie_chestplate_dark_oak` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Jungle) | `fracturepoint:ghillie_chestplate_jungle` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Mangrove) | `fracturepoint:ghillie_chestplate_mangrove` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Oak) | `fracturepoint:ghillie_chestplate_oak` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Snow) | `fracturepoint:ghillie_chestplate_snow` | 5 850 ₽ | 1 |
| Ghillie Chestplate (Spruce) | `fracturepoint:ghillie_chestplate_spruce` | 5 850 ₽ | 1 |
| "Joker" Armored Chest | `lrarmor:joker_armed_chestplate` | 7 200 ₽ | 1 |
| "Joker" Jacket | `lrarmor:joker_chestplate` | 7 200 ₽ | 1 |
| SCOUT-CHEST | `lrarmor:scout_chestplate` | 7 200 ₽ | 1 |
| ARMORED CHEMICAL-CHEST | `lrarmor:armored_chemical_chestplate` | 8 100 ₽ | 1 |
| CHEMICAL PROTECTIVE-CHEST | `lrarmor:chemical_protective_chestplate` | 8 100 ₽ | 1 |
| MEDICAL-CHEST | `lrarmor:medical_chestplate` | 8 100 ₽ | 1 |
| Бронежилет NATO (Лесной) | `warbornrenewed:nato-wood-chestplate` | 9 000 ₽ | 1 |
| Бронежилет NATO (Песочный) | `warbornrenewed:nato-sand-chestplate` | 9 000 ₽ | 1 |
| Armor repair kit | `zerocontact:kit_armor` | 9 000 ₽ | 1 |
| ATF Chest | `lrarmor:atf_vest_chestplate` | 9 000 ₽ | 1 |
| ATF Jacket | `lrarmor:atf_chestplate` | 9 000 ₽ | 1 |
| ATTACKER-CHEST | `lrarmor:attacker_chestplate` | 9 000 ₽ | 1 |
| Beta 7 Chestplate | `fracturepoint:beta7_chestplate` | 9 000 ₽ | 1 |
| Beta 7 Chestplate (Ash) | `fracturepoint:beta7_chestplate_ash` | 9 000 ₽ | 1 |
| Beta 7 Chestplate (Slate) | `fracturepoint:beta7_chestplate_slate` | 9 000 ₽ | 1 |
| Black Pants | `lrarmor:atf_vest_leggings` | 9 000 ₽ | 1 |
| Black Sneakers | `lrarmor:atf_vest_boots` | 9 000 ₽ | 1 |
| DEA Chest | `lrarmor:dea_armed_chestplate` | 9 000 ₽ | 1 |
| DEA Jacket | `lrarmor:dea_chestplate` | 9 000 ₽ | 1 |
| FBI Chest | `lrarmor:fbi_armed_chestplate` | 9 000 ₽ | 1 |
| FBI Jacket | `lrarmor:fbi_chestplate` | 9 000 ₽ | 1 |
| FSB Machine Gunner Chestplate | `fracturepoint:fsb_machine_gunner_chestplate` | 9 000 ₽ | 1 |
| FSB Soldier Chestplate | `fracturepoint:fsb_soldier_chestplate` | 9 000 ₽ | 1 |
| FSB Squad Leader Chestplate | `fracturepoint:fsb_squad_leader_chestplate` | 9 000 ₽ | 1 |
| Insurgency Commander Chestplate | `fracturepoint:insurgency_commander_chestplate` | 9 000 ₽ | 1 |
| Insurgency Shturmovik Chestplate | `fracturepoint:insurgency_shturmovik_chestplate` | 9 000 ₽ | 1 |
| IRS Jacket | `lrarmor:irs_chestplate` | 9 000 ₽ | 1 |
| IZ Chestplate (Desert) | `fracturepoint:iz_chestplate_desert` | 9 000 ₽ | 1 |
| IZ Chestplate (Forest) | `fracturepoint:iz_chestplate_forest` | 9 000 ₽ | 1 |
| IZ Chestplate (Ops) | `fracturepoint:iz_chestplate_ops` | 9 000 ₽ | 1 |
| IZ Chestplate (Snow) | `fracturepoint:iz_chestplate_snow` | 9 000 ₽ | 1 |
| IZ Chestplate (Urban) | `fracturepoint:iz_chestplate_urban` | 9 000 ₽ | 1 |
| IZ Machine Gunner Chestplate (Desert) | `fracturepoint:iz_machine_gunner_chestplate_desert` | 9 000 ₽ | 1 |
| IZ Machine Gunner Chestplate (Forest) | `fracturepoint:iz_machine_gunner_chestplate_forest` | 9 000 ₽ | 1 |
| IZ Machine Gunner Chestplate (Ops) | `fracturepoint:iz_machine_gunner_chestplate_ops` | 9 000 ₽ | 1 |
| IZ Machine Gunner Chestplate (Snow) | `fracturepoint:iz_machine_gunner_chestplate_snow` | 9 000 ₽ | 1 |
| IZ Machine Gunner Chestplate (Urban) | `fracturepoint:iz_machine_gunner_chestplate_urban` | 9 000 ₽ | 1 |
| Machine Gunner RU Chestplate | `fracturepoint:mashinegunner_ru_chestplate` | 9 000 ₽ | 1 |
| NATO Machine Gunner Chestplate | `fracturepoint:nato_mg_chestplate` | 9 000 ₽ | 1 |
| NATO Machine Gunner Chestplate (Woodland) | `fracturepoint:nato_mg_chestplate_woodland` | 9 000 ₽ | 1 |
| NATO Shturmovik Chestplate | `fracturepoint:nato_shturmovik_chestplate` | 9 000 ₽ | 1 |
| NATO Shturmovik Chestplate (Woodland) | `fracturepoint:nato_shturmovik_chestplate_woodland` | 9 000 ₽ | 1 |
| NATO Shturmovik V2 Chestplate | `fracturepoint:nato_shturmovik2_chestplate` | 9 000 ₽ | 1 |
| NATO Shturmovik V2 Chestplate (Woodland) | `fracturepoint:nato_shturmovik2_chestplate_woodland` | 9 000 ₽ | 1 |
| NATO Squad Leader Chestplate | `fracturepoint:nato_sqad_leader_chestplate` | 9 000 ₽ | 1 |
| NATO Squad Leader Chestplate (Woodland) | `fracturepoint:nato_sqad_leader_chestplate_woodland` | 9 000 ₽ | 1 |
| NATO Ukrainian Chestplate | `fracturepoint:nato_ukr_chestplate` | 9 000 ₽ | 1 |
| NATO Ukrainian Chestplate (Woodland) | `fracturepoint:nato_ukr_chestplate_woodland` | 9 000 ₽ | 1 |
| Pack Chestplate | `warbornrenewed:pack_chestplate` | 9 000 ₽ | 1 |
| Razvetchik Chestplate | `fracturepoint:razvetchik_chestplate` | 9 000 ₽ | 1 |
| Shturmovik RU Chestplate | `fracturepoint:shturmovik_ru_chestplate` | 9 000 ₽ | 1 |
| Shturmovik V2 Chestplate | `fracturepoint:shturmovikv2_chestplate` | 9 000 ₽ | 1 |
| SNIPER-CHEST | `lrarmor:sniper_chestplate` | 9 000 ₽ | 1 |
| Soviet Officer Chestplate | `fracturepoint:soviet_officer_chestplate` | 9 000 ₽ | 1 |
| Soviet Soldier Chestplate | `fracturepoint:soviet_soldier_chestplate` | 9 000 ₽ | 1 |
| Squad Leader RU Chestplate | `fracturepoint:squad_lider_ru_chestplate` | 9 000 ₽ | 1 |
| SSO Machine Gunner Chestplate | `fracturepoint:sso_machine_gunner_chestplate` | 9 000 ₽ | 1 |
| SSO Soldier Chestplate | `fracturepoint:sso_soldier_chestplate` | 9 000 ₽ | 1 |
| SSO Squad Leader Chestplate | `fracturepoint:sso_squad_leader_chestplate` | 9 000 ₽ | 1 |
| Voevoda Atacs Chestplate | `warbornrenewed:voevoda-atacs-chestplate` | 9 000 ₽ | 1 |
| Бронежилет системы "JPC" | `zerocontact:jpc_armor` | 10 350 ₽ | 1 |
| Бронежилет IOTV (Белый) | `warbornrenewed:iotv-white` | 10 350 ₽ | 1 |
| Бронежилет IOTV (Мультикам) | `warbornrenewed:iotv-multicam` | 10 350 ₽ | 1 |
| Бронежилет IOTV (Оливковый) | `warbornrenewed:iotv-green` | 10 350 ₽ | 1 |
| Бронежилет IOTV (Пустынный) | `warbornrenewed:iotv-desert` | 10 350 ₽ | 1 |
| Бронежилет IOTV (Чёрный) | `warbornrenewed:iotv-black` | 10 350 ₽ | 1 |
| Бронежилет IOTV (UCP) | `warbornrenewed:iotv-ucp` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (Белый) | `warbornrenewed:warmor-white` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (ММ14) | `warbornrenewed:warmor-mm14` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (Мультикам) | `warbornrenewed:warmor-multicam` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (Оливковый) | `warbornrenewed:warmor-green` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (Пустынный) | `warbornrenewed:warmor-desert` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (Чёрный) | `warbornrenewed:warmor-black` | 10 350 ₽ | 1 |
| Бронежилет Warmor Gen 3 (UCP) | `warbornrenewed:warmor-ucp` | 10 350 ₽ | 1 |
| Разгрузка Crye JPC | `warbornrenewed:jpc` | 10 350 ₽ | 1 |
| Разгрузка Crye JPC (Пустынная) | `warbornrenewed:jpc-desert` | 10 350 ₽ | 1 |
| Шлем Ops-Core с FC-B2200 (Воевода) | `warbornrenewed:opscore-fc-b2200-voevoda` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST | `warbornrenewed:opscore-standard` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (АТАКС-ФГ) | `warbornrenewed:opscore-atacsfg` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (Белый) | `warbornrenewed:opscore-white` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (ЕМР) | `warbornrenewed:opscore-emr` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (ММ14) | `warbornrenewed:opscore-mm14` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (Мультикам) | `warbornrenewed:opscore-multicam` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (Оливковый) | `warbornrenewed:opscore-green` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (Пустынный) | `warbornrenewed:opscore-desert` | 10 350 ₽ | 1 |
| Шлем Ops-Core FAST (Чёрный) | `warbornrenewed:opscore-black` | 10 350 ₽ | 1 |
| Шлем PASGT (Белый) | `warbornrenewed:pastgt-white` | 10 350 ₽ | 1 |
| Шлем PASGT (ММ14) | `warbornrenewed:pastgt-mm14` | 10 350 ₽ | 1 |
| Шлем PASGT (Мультикам) | `warbornrenewed:pastgt-multicam` | 10 350 ₽ | 1 |
| Шлем PASGT (Оливковый) | `warbornrenewed:pastgt-green` | 10 350 ₽ | 1 |
| Шлем PASGT (ООН) | `warbornrenewed:pastgt-blue` | 10 350 ₽ | 1 |
| Шлем PASGT (Пустынный) | `warbornrenewed:pastgt-desert` | 10 350 ₽ | 1 |
| Шлем PASGT (Чёрный) | `warbornrenewed:pastgt-black` | 10 350 ₽ | 1 |
| DEFENDER-CHEST | `lrarmor:defender_chestplate` | 10 350 ₽ | 1 |
| Opscore | `warbornrenewed:opscore` | 10 350 ₽ | 1 |
| Ratnik Chestplate | `fracturepoint:ratnik_chestplate` | 10 350 ₽ | 1 |
| Ratnik Chestplate (Variant) | `fracturepoint:ratnik_chestplate_variant` | 10 350 ₽ | 1 |
| Ratnik Sand Chestplate | `warbornrenewed:ratnik-sand-chestplate` | 10 350 ₽ | 1 |
| Ratnik Wood Chestplate | `warbornrenewed:ratnik-wood-chestplate` | 10 350 ₽ | 1 |
| Бронежилет 6Б45 (Лесной) | `warbornrenewed:6b45-wood` | 12 600 ₽ | 1 |
| Бронежилет 6Б45 (Пустынный) | `warbornrenewed:6b45-desert` | 12 600 ₽ | 1 |
| Killa Chestplate | `fracturepoint:killa_chestplate` | 12 600 ₽ | 1 |
| Tagilla Chestplate | `fracturepoint:tagilla_chestplate` | 12 600 ₽ | 1 |

### Плиты и ремонт (8)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Бронепластина "Слизняк" | `zerocontact:si_plate` | 1 500 ₽ | 1 |
| Стальная пластина | `zerocontact:steel_plate` | 1 500 ₽ | 1 |
| Ceramic Plate (Level IV) | `fracturepoint:ceramic_plate_level_iv` | 1 500 ₽ | 1 |
| Composite Plate (Level IV) | `fracturepoint:composite_plate_level_iv` | 1 500 ₽ | 1 |
| Kevlar Plate (Level IIIA) | `fracturepoint:kevlar_plate_level_iiia` | 1 500 ₽ | 1 |
| Polyethylene Plate (Level III) | `fracturepoint:polyethylene_plate_level_iii` | 1 500 ₽ | 1 |
| Steel Plate | `fracturepoint:steel_plate` | 1 500 ₽ | 1 |
| Steel Plate (Level III) | `fracturepoint:steel_plate_level_iii` | 1 500 ₽ | 1 |

### Штаны и обувь (80)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Ghillie Boots (Acacia) | `fracturepoint:ghillie_boots_acacia` | 1 150 ₽ | 1 |
| Ghillie Boots (Birch) | `fracturepoint:ghillie_boots_birch` | 1 150 ₽ | 1 |
| Ghillie Boots (Dark Oak) | `fracturepoint:ghillie_boots_dark_oak` | 1 150 ₽ | 1 |
| Ghillie Boots (Jungle) | `fracturepoint:ghillie_boots_jungle` | 1 150 ₽ | 1 |
| Ghillie Boots (Mangrove) | `fracturepoint:ghillie_boots_mangrove` | 1 150 ₽ | 1 |
| Ghillie Boots (Oak) | `fracturepoint:ghillie_boots_oak` | 1 150 ₽ | 1 |
| Ghillie Boots (Snow) | `fracturepoint:ghillie_boots_snow` | 1 150 ₽ | 1 |
| Ghillie Boots (Spruce) | `fracturepoint:ghillie_boots_spruce` | 1 150 ₽ | 1 |
| "Joker" Boots | `lrarmor:joker_boots` | 1 450 ₽ | 1 |
| SCOUT-BOOTS | `lrarmor:scout_boots` | 1 450 ₽ | 1 |
| ARMORED CHEMICAL-BOOTS | `lrarmor:armored_chemical_boots` | 1 600 ₽ | 1 |
| CHEMICAL PROTECTIVE-BOOTS | `lrarmor:chemical_protective_boots` | 1 600 ₽ | 1 |
| MEDICAL-BOOTS | `lrarmor:medical_boots` | 1 600 ₽ | 1 |
| Ghillie Leggings (Acacia) | `fracturepoint:ghillie_leggings_acacia` | 1 650 ₽ | 1 |
| Ghillie Leggings (Birch) | `fracturepoint:ghillie_leggings_birch` | 1 650 ₽ | 1 |
| Ghillie Leggings (Dark Oak) | `fracturepoint:ghillie_leggings_dark_oak` | 1 650 ₽ | 1 |
| Ghillie Leggings (Jungle) | `fracturepoint:ghillie_leggings_jungle` | 1 650 ₽ | 1 |
| Ghillie Leggings (Mangrove) | `fracturepoint:ghillie_leggings_mangrove` | 1 650 ₽ | 1 |
| Ghillie Leggings (Oak) | `fracturepoint:ghillie_leggings_oak` | 1 650 ₽ | 1 |
| Ghillie Leggings (Snow) | `fracturepoint:ghillie_leggings_snow` | 1 650 ₽ | 1 |
| Ghillie Leggings (Spruce) | `fracturepoint:ghillie_leggings_spruce` | 1 650 ₽ | 1 |
| ATTACKER-BOOTS | `lrarmor:attacker_boots` | 1 800 ₽ | 1 |
| Beta 7 Boots | `fracturepoint:beta7_boots` | 1 800 ₽ | 1 |
| Beta 7 Boots (Ash) | `fracturepoint:beta7_boots_ash` | 1 800 ₽ | 1 |
| Beta 7 Boots (Slate) | `fracturepoint:beta7_boots_slate` | 1 800 ₽ | 1 |
| Black Combat Boots | `lrarmor:dea_armed_boots` | 1 800 ₽ | 1 |
| Black Shoes | `lrarmor:dea_boots` | 1 800 ₽ | 1 |
| Brown Shoes | `lrarmor:atf_boots` | 1 800 ₽ | 1 |
| FSB Boots | `fracturepoint:fsb_boots` | 1 800 ₽ | 1 |
| Insurgency Commander Boots | `fracturepoint:insurgency_commander_boots` | 1 800 ₽ | 1 |
| IZ Boots (Desert) | `fracturepoint:iz_boots_desert` | 1 800 ₽ | 1 |
| IZ Boots (Forest) | `fracturepoint:iz_boots_forest` | 1 800 ₽ | 1 |
| IZ Boots (Ops) | `fracturepoint:iz_boots_ops` | 1 800 ₽ | 1 |
| IZ Boots (Snow) | `fracturepoint:iz_boots_snow` | 1 800 ₽ | 1 |
| IZ Boots (Urban) | `fracturepoint:iz_boots_urban` | 1 800 ₽ | 1 |
| Pack Boots | `warbornrenewed:pack_boots` | 1 800 ₽ | 1 |
| Sand Boots | `lrarmor:fbi_armed_boots` | 1 800 ₽ | 1 |
| Sand Sneakers | `lrarmor:fbi_boots` | 1 800 ₽ | 1 |
| SNIPER-BOOTS | `lrarmor:sniper_boots` | 1 800 ₽ | 1 |
| Soviet Boots | `fracturepoint:soviet_boots` | 1 800 ₽ | 1 |
| SSO Boots | `fracturepoint:sso_boots` | 1 800 ₽ | 1 |
| White Sneaker | `lrarmor:irs_boots` | 1 800 ₽ | 1 |
| "Joker" Pants | `lrarmor:joker_leggings` | 2 000 ₽ | 1 |
| SCOUT-LEGS | `lrarmor:scout_leggings` | 2 000 ₽ | 1 |
| DEFENDER-BOOTS | `lrarmor:defender_boots` | 2 050 ₽ | 1 |
| Ratnik Boots | `fracturepoint:ratnik_boots` | 2 050 ₽ | 1 |
| ARMORED CHEMICAL-LEGS | `lrarmor:armored_chemical_leggings` | 2 250 ₽ | 1 |
| CHEMICAL PROTECTIVE-LEGS | `lrarmor:chemical_protective_leggings` | 2 250 ₽ | 1 |
| MEDICAL-LEGS | `lrarmor:medical_leggings` | 2 250 ₽ | 1 |
| ATTACKER-LEGS | `lrarmor:attacker_leggings` | 2 500 ₽ | 1 |
| Beta 7 Leggings | `fracturepoint:beta7_leggings` | 2 500 ₽ | 1 |
| Beta 7 Leggings (Ash) | `fracturepoint:beta7_leggings_ash` | 2 500 ₽ | 1 |
| Beta 7 Leggings (Slate) | `fracturepoint:beta7_leggings_slate` | 2 500 ₽ | 1 |
| British23 (Pants) | `zerocontact:uniform_british23_bottom` | 2 500 ₽ | 1 |
| Denim Jeans | `lrarmor:dea_armed_leggings` | 2 500 ₽ | 1 |
| FSB Leggings | `fracturepoint:fsb_leggings` | 2 500 ₽ | 1 |
| G99 Combat uniform (Pants) | `zerocontact:uniform_g99_bottom` | 2 500 ₽ | 1 |
| Green Combat Pants | `lrarmor:fbi_leggings` | 2 500 ₽ | 1 |
| Green Pants | `lrarmor:dea_leggings` | 2 500 ₽ | 1 |
| Grey Pants | `lrarmor:atf_leggings` | 2 500 ₽ | 1 |
| Insurgency Commander Leggings | `fracturepoint:insurgency_commander_leggings` | 2 500 ₽ | 1 |
| IZ Leggings (Desert) | `fracturepoint:iz_leggings_desert` | 2 500 ₽ | 1 |
| IZ Leggings (Forest) | `fracturepoint:iz_leggings_forest` | 2 500 ₽ | 1 |
| IZ Leggings (Ops) | `fracturepoint:iz_leggings_ops` | 2 500 ₽ | 1 |
| IZ Leggings (Snow) | `fracturepoint:iz_leggings_snow` | 2 500 ₽ | 1 |
| IZ Leggings (Urban) | `fracturepoint:iz_leggings_urban` | 2 500 ₽ | 1 |
| Khaki Combat Pants | `lrarmor:fbi_armed_leggings` | 2 500 ₽ | 1 |
| Khaki Pants | `lrarmor:irs_leggings` | 2 500 ₽ | 1 |
| Pack Leggings | `warbornrenewed:pack_leggings` | 2 500 ₽ | 1 |
| SNIPER-LEGS | `lrarmor:sniper_leggings` | 2 500 ₽ | 1 |
| Soviet Leggings | `fracturepoint:soviet_leggings` | 2 500 ₽ | 1 |
| SPN (Pants) | `zerocontact:uniform_spn_bottom` | 2 500 ₽ | 1 |
| SSO Machine Gunner Leggings | `fracturepoint:sso_machine_gunner_leggings` | 2 500 ₽ | 1 |
| SSO Soldier Leggings | `fracturepoint:sso_soldier_leggings` | 2 500 ₽ | 1 |
| SSO Squad Leader Leggings | `fracturepoint:sso_squad_leader_leggings` | 2 500 ₽ | 1 |
| Uniform Wedge Pants | `zerocontact:uniform_wedge_pants` | 2 500 ₽ | 1 |
| DEFENDER-LEGS | `lrarmor:defender_leggings` | 2 900 ₽ | 1 |
| Ratnik Leggings | `fracturepoint:ratnik_leggings` | 2 900 ₽ | 1 |
| Ratnik Sand Leggings Gh | `warbornrenewed:ratnik-sand-leggings-gh` | 2 900 ₽ | 1 |
| Tagilla Leggings | `fracturepoint:tagilla_leggings` | 3 500 ₽ | 1 |

### Снаряжение (54)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Белая повязка на руку | `zerocontact:armband_white` | 200 ₽ | 1 |
| Жёлтая повязка на руку | `zerocontact:armband_yellow` | 200 ₽ | 1 |
| Зелёная повязка на руку | `zerocontact:armband_green` | 200 ₽ | 1 |
| Кепка | `vvp:kepka` | 200 ₽ | 1 |
| Красная повязка на руку | `zerocontact:armband_red` | 200 ₽ | 1 |
| Панама (АТАКС-ФГ) | `warbornrenewed:panama-atacsfg` | 200 ₽ | 1 |
| Панама (Белая) | `warbornrenewed:panama-white` | 200 ₽ | 1 |
| Панама (ЕМР) | `warbornrenewed:panama-emr` | 200 ₽ | 1 |
| Панама (Мультикам) | `warbornrenewed:panama-multicam` | 200 ₽ | 1 |
| Панама (Оливковая) | `warbornrenewed:panama-green` | 200 ₽ | 1 |
| Панама (Пустынная) | `warbornrenewed:panama-desert` | 200 ₽ | 1 |
| Панама (UCP) | `warbornrenewed:panama-ucp` | 200 ₽ | 1 |
| Синяя повязка на руку | `zerocontact:armband_blue` | 200 ₽ | 1 |
| Чёрная повязка на руку | `zerocontact:armband_black` | 200 ₽ | 1 |
| Armband (Flora) | `zerocontact:armband_flora` | 200 ₽ | 1 |
| FSB Panama | `fracturepoint:fsb_panama` | 200 ₽ | 1 |
| Панама | `vvp:panama` | 250 ₽ | 1 |
| Камуфляжный спрей | `vvp:spray` | 300 ₽ | 1 |
| Инструмент для обезвреживания | `superbwarfare:defuser` | 1 200 ₽ | 1 |
| Анализатор повреждений техники | `superbwarfare:vehicle_damage_analyzer` | 1 500 ₽ | 1 |
| Парашют | `superbwarfare:parachute` | 1 500 ₽ | 1 |
| Leather Backpack | `survivorsarsenal:leather_backpack` | 1 500 ₽ | 1 |
| Ремонтный инструмент | `superbwarfare:repair_tool` | 2 000 ₽ | 1 |
| Бинокль | `warbornrenewed:binocular` | 2 200 ₽ | 1 |
| Hiking Backpack (Red) | `survivorsarsenal:hiking_backpack_red` | 2 500 ₽ | 1 |
| Набор для сброса транспорта | `superbwarfare:vehicle_reset_kit` | 3 000 ₽ | 1 |
| Рюкзак РЭБ (Белый) | `warbornrenewed:reb-backpack-white` | 3 500 ₽ | 1 |
| Рюкзак РЭБ (ЕМР) | `warbornrenewed:reb-backpack-emr` | 3 500 ₽ | 1 |
| Рюкзак РЭБ (Мультикам) | `warbornrenewed:reb-backpack-multicam` | 3 500 ₽ | 1 |
| Рюкзак РЭБ (Оливковый) | `warbornrenewed:reb-backpack-green` | 3 500 ₽ | 1 |
| Рюкзак РЭБ (Пустынный) | `warbornrenewed:reb-backpack-desert` | 3 500 ₽ | 1 |
| Backpack Tier 2 Upgrade | `fracturepoint:backpack_upgrade_tier2` | 3 500 ₽ | 1 |
| Backpack Tier 3 Upgrade | `fracturepoint:backpack_upgrade_tier3` | 3 500 ₽ | 1 |
| FPV-очки Skyzone SKY04X V2 | `fpvdrone:fpv_goggles` | 3 500 ₽ | 1 |
| Insurgency Shturmovik Backpack | `fracturepoint:insurgency_shturmovik_backpack` | 3 500 ₽ | 1 |
| IZ Backpack (Desert) | `fracturepoint:iz_backpack_desert` | 3 500 ₽ | 1 |
| IZ Backpack (Forest) | `fracturepoint:iz_backpack_forest` | 3 500 ₽ | 1 |
| IZ Backpack (Ops) | `fracturepoint:iz_backpack_ops` | 3 500 ₽ | 1 |
| IZ Backpack (Snow) | `fracturepoint:iz_backpack_snow` | 3 500 ₽ | 1 |
| IZ Backpack (Urban) | `fracturepoint:iz_backpack_urban` | 3 500 ₽ | 1 |
| Military Backpack (Green) | `survivorsarsenal:military_backpack_green` | 3 500 ₽ | 1 |
| NATO Machine Gunner Backpack | `fracturepoint:nato_mg_backpack` | 3 500 ₽ | 1 |
| Nato Shturmovik2 Backpack | `fracturepoint:nato_shturmovik2_backpack` | 3 500 ₽ | 1 |
| NATO Squad Leader Backpack | `fracturepoint:nato_sqad_leader_backpack` | 3 500 ₽ | 1 |
| NATO Squad Leader Backpack (Woodland) | `fracturepoint:nato_sqad_leader_backpack_woodland` | 3 500 ₽ | 1 |
| NATO Ukrainian Backpack | `fracturepoint:nato_ukr_backpack` | 3 500 ₽ | 1 |
| Shturmovik RU Backpack | `fracturepoint:shturmovik_ru_backpack` | 3 500 ₽ | 1 |
| Soviet Soldier Backpack | `fracturepoint:soviet_soldier_backpack` | 3 500 ₽ | 1 |
| Squad Leader RU Backpack | `fracturepoint:squad_lider_ru_backpack` | 3 500 ₽ | 1 |
| SSO Machine Gunner Backpack | `fracturepoint:sso_machine_gunner_backpack` | 3 500 ₽ | 1 |
| SSO Soldier Backpack | `fracturepoint:sso_soldier_backpack` | 3 500 ₽ | 1 |
| Ratnik Backpack | `fracturepoint:ratnik_backpack` | 4 000 ₽ | 1 |
| Тепловизионные очки | `superbwarfare:thermal_imaging_goggles` | 6 000 ₽ | 1 |
| Flash Shield | `lrtactical:flash_shield` | 6 000 ₽ | 1 |

### Медицина (30)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Пластырь | `firstaid:plaster` | 60 ₽ | 1 |
| Бинт | `firstaid:bandage` | 120 ₽ | 1 |
| Bandage | `survivorsarsenal:bandage` | 120 ₽ | 1 |
| Повязка на ногу | `warbornrenewed:leg_bandage` | 150 ₽ | 1 |
| Повязка на руку | `warbornrenewed:arm_bandage` | 150 ₽ | 1 |
| Arm Bandage | `warbornrenewed:arm-bandage` | 150 ₽ | 1 |
| Leg Bandage | `warbornrenewed:leg-bandage` | 150 ₽ | 1 |
| Medicine Pill | `survivorsarsenal:medicine_pill` | 200 ₽ | 1 |
| Sterilized Bandage | `survivorsarsenal:bandage_sterilized` | 220 ₽ | 1 |
| Painkiller | `survivorsarsenal:painkiller` | 250 ₽ | 1 |
| Crowbar | `survivorsarsenal:crowbar` | 300 ₽ | 1 |
| Stamina Boost | `survivorsarsenal:stamina_boost` | 300 ₽ | 1 |
| Antiseptic | `survivorsarsenal:antiseptic` | 350 ₽ | 1 |
| Морфин | `firstaid:morphine` | 400 ₽ | 1 |
| Combat Knife | `survivorsarsenal:combat_knife` | 400 ₽ | 1 |
| Morphine | `survivorsarsenal:morphine` | 400 ₽ | 1 |
| Adrenaline | `survivorsarsenal:adrenaline` | 500 ₽ | 1 |
| Metal Baseball Bat | `survivorsarsenal:metal_baseball_bat` | 500 ₽ | 1 |
| Исцеляющая перезарядка | `superbwarfare:heal_clip` | 600 ₽ | 1 |
| First Aid Spray | `survivorsarsenal:first_aid_spray` | 600 ₽ | 1 |
| Repair Kit I | `survivorsarsenal:repair_kit_i` | 600 ₽ | 1 |
| Бронепластина | `superbwarfare:armor_plate` | 900 ₽ | 1 |
| Generic Medicine Box | `survivorsarsenal:generic_medicine_box` | 900 ₽ | 1 |
| Katana | `survivorsarsenal:katana` | 900 ₽ | 1 |
| Repair Kit II | `survivorsarsenal:repair_kit_ii` | 1 000 ₽ | 1 |
| Аптечка | `superbwarfare:medical_kit` | 1 200 ₽ | 1 |
| Electric Baseball Bat | `survivorsarsenal:electric_baseball_bat` | 1 200 ₽ | 1 |
| Repair Kit III | `survivorsarsenal:repair_kit_iii` | 1 600 ₽ | 1 |
| Medical Kit | `survivorsarsenal:medkit` | 1 800 ₽ | 1 |
| Chainsaw | `survivorsarsenal:chainsaw` | 2 500 ₽ | 1 |

### Еда (44)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Banana | `survivorsarsenal:banana` | 150 ₽ | 1 |
| Bean Burger | `survivorsarsenal:burger_bean` | 150 ₽ | 1 |
| Beef Burger | `survivorsarsenal:burger_beef` | 150 ₽ | 1 |
| Beef Burrito | `survivorsarsenal:burrito_beef` | 150 ₽ | 1 |
| Beef Taco | `survivorsarsenal:taco_beef` | 150 ₽ | 1 |
| Cheese | `survivorsarsenal:cheese` | 150 ₽ | 1 |
| Cheese Bread | `survivorsarsenal:cheese_bread` | 150 ₽ | 1 |
| Cheese Chips | `survival_instinct:cheese_chips` | 150 ₽ | 1 |
| Cheese Pastel | `survivorsarsenal:cheese_pastel` | 150 ₽ | 1 |
| Chips | `survivorsarsenal:chips` | 150 ₽ | 1 |
| Coxinha | `survivorsarsenal:coxinha` | 150 ₽ | 1 |
| Gallon Of Milk | `survival_instinct:gallon_of_milk` | 150 ₽ | 1 |
| Mango | `survivorsarsenal:mango` | 150 ₽ | 1 |
| Meat Can | `survival_instinct:meat_can` | 150 ₽ | 1 |
| Meat Pastel | `survivorsarsenal:meat_pastel` | 150 ₽ | 1 |
| Milk | `survival_instinct:milk` | 150 ₽ | 1 |
| Milk | `survivorsarsenal:milk` | 150 ₽ | 1 |
| Milk Gallon | `survivorsarsenal:milk_gallon` | 150 ₽ | 1 |
| Orange | `survival_instinct:orange` | 150 ₽ | 1 |
| Orange | `survivorsarsenal:orange` | 150 ₽ | 1 |
| Peach | `survivorsarsenal:peach` | 150 ₽ | 1 |
| Pear | `survivorsarsenal:pear` | 150 ₽ | 1 |
| Pineapple | `survivorsarsenal:pineapple` | 150 ₽ | 1 |
| Pizza Box | `survivorsarsenal:pizza_box` | 150 ₽ | 1 |
| Pizza Slice | `survivorsarsenal:pizza` | 150 ₽ | 1 |
| Potato Chips | `survival_instinct:potato_chips` | 150 ₽ | 1 |
| Potato Chips | `survivorsarsenal:potato_chips_bag` | 150 ₽ | 1 |
| Rice Cookie | `survival_instinct:rice_cookie` | 150 ₽ | 1 |
| Saltine Cracker | `survivorsarsenal:saltine_cracker` | 150 ₽ | 1 |
| Sour Cream Chips | `survivorsarsenal:sour_cream_chips_bag` | 150 ₽ | 1 |
| Starfruit | `survivorsarsenal:starfruit` | 150 ₽ | 1 |
| Tomato Soup | `survival_instinct:tomato_soup` | 150 ₽ | 1 |
| Veggie Burrito | `survivorsarsenal:burrito_veggie` | 150 ₽ | 1 |
| Veggie Taco | `survivorsarsenal:taco_veggie` | 150 ₽ | 1 |
| Wind Pastel | `survivorsarsenal:wind_pastel` | 150 ₽ | 1 |
| Zombie Bacon | `survivorsarsenal:zombie_bacon` | 150 ₽ | 1 |
| Canned Sardines | `survivorsarsenal:canned_sardines` | 200 ₽ | 1 |
| Canned Tuna | `survivorsarsenal:canned_tuna` | 200 ₽ | 1 |
| Cereal | `survivorsarsenal:cereal` | 200 ₽ | 1 |
| Cereal Flakes | `survivorsarsenal:cereal_flakes` | 200 ₽ | 1 |
| Jerry Can Using | `sa_core:jerry_can_using` | 200 ₽ | 1 |
| Military Ration (MRE) | `survivorsarsenal:mre` | 200 ₽ | 1 |
| MRE | `survival_instinct:mre` | 200 ₽ | 1 |
| Tuna Can | `survival_instinct:tuna_can` | 200 ₽ | 1 |

### Вода и напитки (29)

| Название | ID / предмет | Цена | Кол-во |
|---|---|---:|---:|
| Bottle of Water | `survival_instinct:bottle_of_water` | 80 ₽ | 1 |
| Dirty Water Bottle | `sa_core:dirty_water_bottle` | 80 ₽ | 1 |
| Dirty Water Bottle | `survivorsarsenal:dirty_water_bottle` | 80 ₽ | 1 |
| Gallon Of Water | `survival_instinct:gallon_of_water` | 80 ₽ | 1 |
| Water Bottle | `sa_core:water_bottle` | 80 ₽ | 1 |
| Water Bottle | `survivorsarsenal:water_bottle` | 80 ₽ | 1 |
| Apple Juice | `survival_instinct:apple_juice` | 250 ₽ | 1 |
| Beer | `survival_instinct:beer` | 250 ₽ | 1 |
| Beer | `survivorsarsenal:beer` | 250 ₽ | 1 |
| Blue Soda | `survival_instinct:blue_soda` | 250 ₽ | 1 |
| Coffee | `survivorsarsenal:coffee` | 250 ₽ | 1 |
| Cola | `survivorsarsenal:cola` | 250 ₽ | 1 |
| Duff Beer | `survivorsarsenal:duff_beer` | 250 ₽ | 1 |
| Energy Can | `survival_instinct:energy_can` | 250 ₽ | 1 |
| Energy Drink | `survivorsarsenal:energy_drink` | 250 ₽ | 1 |
| Grape Soda | `survivorsarsenal:fanta_grape_soda` | 250 ₽ | 1 |
| Guaraná Soda | `survivorsarsenal:guarana_soda` | 250 ₽ | 1 |
| Lemon Soda | `survival_instinct:lemon_soda` | 250 ₽ | 1 |
| Orange Juice | `survival_instinct:orange_juice` | 250 ₽ | 1 |
| Orange Soda | `survivorsarsenal:fanta_orange_soda` | 250 ₽ | 1 |
| Peach Juice | `survivorsarsenal:peach_juice` | 250 ₽ | 1 |
| Pepsi | `survivorsarsenal:pepsi` | 250 ₽ | 1 |
| Pineapple Juice | `survivorsarsenal:pineapple_juice` | 250 ₽ | 1 |
| Red Soda | `survival_instinct:red_soda` | 250 ₽ | 1 |
| Vodka | `survivorsarsenal:vodka` | 250 ₽ | 1 |
| Whiskey | `survival_instinct:whiskey` | 250 ₽ | 1 |
| Whiskey | `survivorsarsenal:whiskey` | 250 ₽ | 1 |
| Wine | `survival_instinct:wine` | 250 ₽ | 1 |
| Wine | `survivorsarsenal:wine` | 250 ₽ | 1 |
