# Burek — sklep zoologiczny

Responsywna strona w języku polskim: 10 podstron, animowane przejścia, katalog, koszyk, ulubione, wyszukiwarka, filtry i poradnik. Bez frameworka, zależności produkcyjnych i zewnętrznych skryptów.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Można też otworzyć `index.html` z katalogu nadrzędnego — zawiera tę samą stronę główną z odpowiednią ścieżką bazową. Dla wspólnego koszyka między wszystkimi podstronami polecany jest podgląd przez HTTP: przeglądarki mogą oddzielać lokalny zapis dla różnych plików otwartych jako `file://`.

Podgląd przez HTTP, jeżeli masz Node.js:

```sh
node server.mjs
```

Adres podglądu: `http://127.0.0.1:4173`.

W tym środowisku dostępny jest również lokalny plik `../.tools/node.exe`. Przykład w PowerShell, z katalogu `burek`:

```powershell
& '../.tools/node.exe' './server.mjs'
```

## Organizacja kodu

```text
burek/
  index.html             strona główna
  dla-psa.html            katalog dla psów
  dla-kota.html           katalog dla kotów
  male-zwierzeta.html     małe zwierzęta
  dla-ptakow.html         katalog dla ptaków
  akwarystyka.html        akwarystyka
  promocje.html           przykładowe okazje
  poradnik.html           poradnik i pełne artykuły
  o-nas.html              prezentacja marki Burek
  kontakt.html            formularz demonstracyjny i FAQ
  css/style.css          style, układy mobilne i animacje
  css/effects.css        karuzela, spadające ślady i liczniki produktów
  css/motion.css         reakcje zwierząt, koszyk, serduszka i podwodne tło
  js/data.js             produkty, kategorie i artykuły
  js/art.js              oryginalne ilustracje SVG
  js/characters.js       części zwierząt: osobne oczy, ogony, uszy i głowy
  js/render.js           wspólne szablony HTML
  js/app.js              interakcje i lokalny zapis koszyka
  js/carousel.js         slajdy zwierząt, strzałki, gesty i timer 7 s
  js/animal-effects.js   spadające ślady i rybki na podstronach kategorii
  js/motion.js           lot produktu, reakcje zwierząt i płynne układanie kart
  assets/favicon.svg     ikona strony
  assets/media/          pobrane zdjęcia i film
  assets/media/sources.json  źródła i wymiary materiałów
  build.mjs              generator zwykłych podstron HTML
  check.mjs              sprawdzanie odnośników i składni
  server.mjs             serwer lokalnego podglądu
  dist/                  gotowe pliki do hostingu statycznego
```

## Edycja

### Zaznaczanie uwag w lokalnym podglądzie

Otwórz `http://127.0.0.1:4173/?uwagi=1`. W panelu „Uwagi do Burka” kliknij „Zaznacz element”, wskaż fragment strony, dopisz komentarz i wybierz „Zapisz uwagę”. Tryb pozostaje aktywny podczas przechodzenia między podstronami w tej karcie.

Uwagi są zapisywane lokalnie w `burek/.review/uwagi.json`, z identyfikatorem elementu, nazwą podstrony i rozmiarem okna. Po zapisaniu napisz w czacie „sprawdź uwagi”, aby agent mógł je odczytać. Panel nie transmituje ekranu ani nie wysyła komentarzy do zewnętrznej usługi.

Wybierz „Wyłącz tryb uwag”, aby wrócić do zwykłego widoku. Pliki narzędzia znajdują się w `dev/review.js` i `dev/review.css`; serwer wczytuje je tylko w lokalnym podglądzie. Nie są dodawane do `dist/`.

### Zmiany w plikach

Każdy plik HTML zawiera kompletny kod swojej podstrony, w tym nagłówek i stopkę. Można edytować go bezpośrednio. Interakcje wymagają zachowania identyfikatorów `id`, klas i atrybutów `data-*` używanych w `js/app.js`.

Aby zmienić cały katalog lub wspólne fragmenty naraz, edytuj `js/data.js`, `js/art.js` albo `js/render.js`, a następnie uruchom:

```sh
node build.mjs
node check.mjs
```

Generator nadpisuje wszystkie 10 plików HTML i aktualizuje katalog `dist`. Nie nadpisuje CSS ani pliku z interakcjami. Flaga `--workspace-entry` aktualizuje także `index.html` w katalogu nadrzędnym.

## Materiały z Instagrama

Bez logowania pobrano 8 obrazów JPEG oraz 1 film MP4. Obrazy mają 1074×1350 albo 1080×1339 px. Film ma 720×1280 px, trwa około 18 sekund i zawiera dźwięk. Oryginalne pliki i raporty pobierania znajdują się również w katalogu nadrzędnym `zdjecia`.

Pobrane obrazy to głównie grafiki reklamowe i edukacyjne, a nie samodzielne fotografie zwierząt. W witrynie wykorzystano oznaczoną ilustrację edukacyjną i film z informacją o źródle; reklamy innego sklepu nie są prezentowane jako oferta Burka. Pozostałe grafiki zachowano w zasobach. Dwie miniatury 640×1136 nie spełniały przyjętego progu i znajdują się w `../zdjecia/odrzucone`.

Film pochodzi z materiału widocznego na publicznym profilu unizoo.pl; został pobrany przez publiczny pośredniczący adres CDN. Nie wymaga logowania do odtwarzania lokalnej kopii. Więcej filmów nie pobrano ze względu na dzienny limit zewnętrznej przeglądarki profilu i niedostępność jednego z plików.

## Zakres działania

- Koszyk i ulubione zapisują się w `localStorage` przeglądarki. Nie są przesyłane na serwer.
- Nagłówek jest przyklejony do górnej krawędzi podczas przewijania. Koszyk i pasek kategorii na komputerze pozostają widoczne; na telefonie pozostaje dostępny przycisk rozwijania menu. Odsunięcie kotwic uwzględnia wysokość nagłówka.
- Koszyk pozwala zmieniać ilości, usuwać produkty i pobierać listę zakupów jako TXT.
- Produkty, ceny i marki z katalogu są przykładowe, a zdjęcia produktów zastępują autorskie ilustracje.
- Nie ma integracji płatności, składania zamówień ani backendu sklepu.
- Formularz kontaktowy waliduje dane i przygotowuje tekst do skopiowania lub pobrania. Nie wysyła wiadomości ani nie zapisuje danych kontaktowych.
- Efekty ruchu respektują ustawienie `prefers-reduced-motion`.
- Baner główny pokazuje pięć zwierząt. Przełącza się co 7 sekund; można użyć strzałek po lewej i prawej stronie, kropek, klawiszy lewo/prawo lub gestu na telefonie. Strzałki są wyśrodkowane pionowo względem slajdu. Nie ma przycisku pauzy, a kursor i fokus nie zatrzymują zmiany. Wyjątki to nieaktywna karta, otwarte okno, zaznaczanie uwag i systemowe ograniczenie ruchu. Fokus pozostaje na odpowiadającym elemencie po zmianie slajdu.
- Po wejściu do kategorii pojawiają się krótkie, różne animacje: ślady psa, kota, królika, papugi albo małe rybki. Nie przechwytują kliknięć i samoczynnie znikają.
- Przy każdym przycisku dodania produktu jest widoczna jego aktualna ilość w koszyku. Licznik jest synchronizowany również po zmianie ilości i usunięciu pozycji.
- Ilustracje reagują na kursor i fokus klawiatury: pies merda ogonem, kot mruga, królik porusza uszami, papuga przechyla głowę, a rybka porusza ogonem. Reakcje działają także po zmianie slajdu karuzeli.
- Dodawany produkt leci do ikony koszyka. Jeśli nagłówek jest poza ekranem, pojawia się chwilowy znaczek koszyka w górnym rogu. Efekt działa również z okna szczegółów produktu.
- Po dodaniu do ulubionych serduszko pulsuje, a małe serca znikają po chwili.
- W pustym koszyku śpi Burek. Po pierwszym dodaniu budzi się; po usunięciu wszystkich produktów ponownie zasypia. Z pustego koszyka można demonstracyjnie dodać piłkę i zobaczyć tę zmianę.
- Tło banera akwarystyki zawiera unoszące się bąbelki, przepływające rybki i wodne rośliny. Animacja zatrzymuje się poza ekranem i w nieaktywnej karcie.
- Filtrowanie i sortowanie zachowują istniejące karty produktów. Zmiana ich miejsca jest animowana, a nowe karty łagodnie się pojawiają.
- Obsługiwane są klawiatura, modalne okna `dialog`, opisy przycisków i stany `aria`.

## Weryfikacja

Sprawdzono 10 dokumentów HTML, lokalne odnośniki, zasoby, unikalne identyfikatory i składnię JavaScript. W środowisku DOM przeszło 17 sprawdzeń zachowań, w tym koszyk, sumy, ulubione, wyszukiwanie, filtrowanie, sortowanie, formularz, menu i poradnik. Sprawdzono również obsługę żądań Range potrzebnych do przewijania filmu.

Po uwagach użytkownika sprawdzono dodatkowo 35 zachowań: automatyczne i ręczne przewijanie karuzeli, boczne strzałki, brak pauzy po najechaniu, gesty, zapętlenie, zatrzymanie podczas zaznaczania uwag, różne efekty wszystkich pięciu kategorii, aktualizację liczników i respektowanie ograniczonego ruchu.

Sześć kolejnych animacji sprawdzono w 27 scenariuszach, m.in. dla szybkiego dodawania, dodawania z okna produktu, pustego koszyka, zachowania kart przy sortowaniu, reakcji klawiaturą i działania po ograniczeniu ruchu. Testy trajektorii i przesuwania kart korzystają z symulowanych wymiarów DOM; nie zastępują oględzin w prawdziwej przeglądarce.

Weryfikacja wizualna w prawdziwej przeglądarce była niedostępna z powodu błędu lokalnego połączenia z przeglądarką.
