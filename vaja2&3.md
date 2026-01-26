# VAJA 2 & 3 – Value Proposition, Product Vision in Business Model

## Namen vaj

- Prevesti realen problem specifičnega uporabnika v **jasno, merljivo vrednost**
- Oblikovati **produktno vizijo**, ki ni le slogan, ampak strateška definicija
- Preveriti, ali ima rešitev **poslovni smisel** (osnovni Business Model Canvas + ključne hipoteze)

Ključno pravilo:  
**Ne gradimo aplikacije – gradimo rešitev za konkretno frustracijo konkretnega uporabnika.**

---

## 2.1 Value Proposition Canvas (VPC)

### Customer Profile (Profil uporabnika)

**Izbrani segment (EN sam):**  
Osnovnošolski / srednješolski učitelji naravoslovnih predmetov (kemija, fizika, biologija) v Sloveniji, ki poučujejo v oddelkih od 18–28 učencev.

#### Pains (največje frustracije / bolečine)

- Ročno preverjanje nalog in preizkusov → porabijo **2–4 ure na teden** samo za popravljanje
- Veliko število podobnih napak → ponavljajoče se pisanje enakih pripomb
- Težko sledijo napredku posameznega učenca čez daljše obdobje
- Starši pogosto sprašujejo za ocene / utemeljitev → učitelj mora iskati po zvezkih / beležkah
- Obstojče digitalne rešitve (npr. eAsistent, ločene kviz aplikacije) so preveč splošne ali drage za posameznega učitelja

#### Gains (želene koristi / idealni izid)

- Preverjanje nalog v < 30 minutah namesto 3 urah
- Avtomatsko generirane povratne informacije za 80 % najpogostejših napak
- Pregleden napredek vsakega učenca v enem pogledu (tudi za starše)
- Prihranek vsaj 8–10 ur mesečno → več časa za pripravo pouka ali osebni stik
- Rešitev stane manj kot 1 € na dan (primerjava z urno postavko inštrukcij)

### Value Map (Rešitev)

#### Pain Relievers (kako lajšamo bolečine)

- AI-pogonjeno avtomatsko popravljanje matematičnih / naravoslovnih nalog (prepoznava korakov, ne samo končnega rezultata)
- Pametni predlogi komentarjev in popravkov (izbira iz baze 500+ najpogostejših napak)
- Avtomatska generacija tedenskih / mesečnih poročil za učenca in starše
- Integracija s fotografijo ročne naloge → OCR + razumevanje vsebine

#### Gain Creators (kako ustvarjamo dodatne koristi)

- Interaktivni vpogled v najpogostejše napake razreda → učitelj prilagodi naslednjo uro
- Možnost personaliziranih dodatnih nalog za učence, ki zaostajajo
- Mobilna aplikacija za hitro preverjanje med odmori ali od doma

---

## 2.2 Product Vision Statement

**Za** učitelje naravoslovnih predmetov na osnovnih in srednjih šolah,  
**ki** tedensko porabijo več ur za ročno popravljanje nalog in kljub temu ne morejo dati kakovostnih povratnih informacij,  
**je naš produkt** specializirano AI-orodje za avtomatsko preverjanje in povratne informacije pri naravoslovnih predmetih,  
**ki** skrajša čas popravljanja za vsaj 70 % in hkrati dvigne kakovost povratnih informacij,  
**za razliko od** splošnih LMS sistemov (Moodle, eAsistent, Google Classroom) ali klasičnih kviz orodij (Kahoot, Forms), ki ne razumejo korakov reševanja in ne popravljajo odprtih nalog.

---

## 3.1 Business Model Canvas (osredotočeni 4 elementi)

| Element              | Opis                                                                                   |
|----------------------|----------------------------------------------------------------------------------------|
| **Customer Segments** | **Uporabnik:** učitelj naravoslovnih predmetov<br>**Plačnik:** učitelj sam ali šola (ravnatelj / svet staršev) |
| **Value Proposition** | 70–80 % manj časa za preverjanje nalog + boljše, personalizirane povratne informacije |
| **Revenue Streams**   | - Freemium (osnovno preverjanje do 50 nalog/mesec brezplačno)<br>- Naročnina: 9,90 €/mesec ali 89 €/leto na učitelja<br>- Šolska licenca: 4–7 €/učitelj/mesec (odvisno od velikosti šole) |
| **Cost Structure**    | - Razvoj & vzdrževanje AI modela (~60 %)<br>- Cloud infrastruktura (GPU za inference)<br>- Marketing (FB/IG ads + učiteljski seminarji)<br>- Podpora in customer success |

**Ključno ekonomsko vprašanje:**  
Če povprečni učitelj prihrani 10 ur/mesec, je 9,90 €/mesec zelo realna cena (efektivno ~1 €/ura prihranka).

---

## 3.2 Ključne poslovne hipoteze (top 3–5)

1. **Učitelji so pripravljeni plačevati 8–12 €/mesec** za orodje, ki jim zanesljivo prihrani vsaj 8 ur mesečno.  
   → Test: intervjuji + prednaročila / landing page MVP

2. **Največja bolečina je poraba časa, ne pomanjkanje digitalnih orodij nasploh.**  
   → Test: vprašalnik 50+ učiteljem (rangiranje bolečin)

3. **Učitelji bodo aktivno uporabljali orodje vsaj 2× na teden**, če bo natančnost preverjanja ≥ 85 %.  
   → Test: beta testiranje (merjenje retention & frequency)

4. **Šole so pripravljene kupiti licenco za več učiteljev**, če ena šola prihrani vsaj 500–1000 ur dela letno.  
   → Test: pogovori z ravnatelji / pilot na 1–2 šolah

---

## Naslednji koraki

1. Validacija hipotez (intervjuji, vprašalniki, landing page)
2. Izdelava zelo ozke prve verzije (npr. samo ena vrsta nalog – matematične enačbe)
3. Merjenje realnega prihranka časa v beta skupini
4. Iteracija na VPC in BMC glede na povratne informacije
