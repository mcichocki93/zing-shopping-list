# Polityka Prywatności aplikacji Zing

**Data ostatniej aktualizacji:** 2 marca 2026 r.

---

## 1. Informacje ogólne

Niniejsza Polityka Prywatności opisuje, w jaki sposób aplikacja mobilna **Zing** (dalej: „Aplikacja") zbiera, przechowuje i przetwarza dane osobowe użytkowników.

Administratorem danych osobowych jest osoba fizyczna prowadząca Aplikację (dalej: „Administrator"). W razie pytań dotyczących prywatności prosimy o kontakt pod adresem e-mail: **kontakt@zing-app.pl** *(zastąp właściwym adresem e-mail)*.

---

## 2. Jakie dane zbieramy

### 2.1 Dane konta
Podczas rejestracji i korzystania z Aplikacji zbieramy:
- Adres e-mail
- Nazwę wyświetlaną (opcjonalną)
- Datę utworzenia konta i datę ostatniej aktywności

### 2.2 Dane list zakupów
- Treść list zakupów oraz poszczególnych pozycji (nazwy produktów, ilości, kategorie)
- Znaczniki czasu tworzenia i modyfikacji

### 2.3 Dane dotyczące funkcji AI
- Tekst wprowadzony przez użytkownika do funkcji AI (parsowanie listy zakupów) — przetwarzany przez Google Gemini AI za pośrednictwem Cloud Functions
- Liczba wywołań funkcji AI w danym miesiącu (do celów zarządzania limitami)

### 2.4 Dane o statusie premium
- Informacja o posiadaniu subskrypcji/zakupu Premium
- Data resetu licznika AI

### 2.5 Dane techniczne
- Firebase Authentication ID (unikalny identyfikator użytkownika)
- Logi błędów (w przypadku awarii Aplikacji)

---

## 3. Cel i podstawa prawna przetwarzania danych

| Cel przetwarzania | Podstawa prawna (RODO) |
|---|---|
| Świadczenie usługi (konto, listy zakupów) | Art. 6 ust. 1 lit. b — wykonanie umowy |
| Przetwarzanie tekstu przez AI | Art. 6 ust. 1 lit. b — wykonanie umowy |
| Egzekwowanie limitów użytkowania | Art. 6 ust. 1 lit. b — wykonanie umowy |
| Obsługa zakupów Premium | Art. 6 ust. 1 lit. b — wykonanie umowy |
| Bezpieczeństwo i zapobieganie nadużyciom | Art. 6 ust. 1 lit. f — prawnie uzasadniony interes |

---

## 4. Udostępnianie danych podmiotom trzecim

Dane użytkowników są przetwarzane przez następujących podwykonawców:

### Google Firebase (Alphabet Inc.)
- **Firebase Authentication** — zarządzanie kontami użytkowników
- **Cloud Firestore** — przechowywanie danych list zakupów i profili użytkowników
- **Cloud Functions for Firebase** — przetwarzanie zapytań AI po stronie serwera

Dane przechowywane są na serwerach Google zlokalizowanych w Europie (region `europe-west1` lub zgodnie z konfiguracją projektu). Google przetwarza dane zgodnie z własną Polityką Prywatności dostępną pod adresem [policies.google.com/privacy](https://policies.google.com/privacy).

### Google Gemini AI (Alphabet Inc.)
Tekst wprowadzony przez użytkownika do funkcji AI jest przesyłany do usługi Google Gemini AI wyłącznie w celu wygenerowania ustrukturyzowanej listy zakupów. Treść ta nie jest przechowywana przez Administratora po zakończeniu przetwarzania. Google przetwarza dane zgodnie z warunkami usługi Gemini API.

### Google Play Billing
W przypadku zakupu wersji Premium, transakcja jest obsługiwana przez Google Play. Administrator nie przechowuje danych płatniczych.

Administrator **nie sprzedaje** danych osobowych użytkowników żadnym podmiotom trzecim.

---

## 5. Okres przechowywania danych

- Dane konta i list zakupów są przechowywane przez cały czas korzystania z Aplikacji.
- Po usunięciu konta przez użytkownika wszystkie powiązane dane są trwale usuwane z bazy danych w ciągu **30 dni**.
- Logi systemowe są automatycznie usuwane po **90 dniach**.

---

## 6. Prawa użytkownika (RODO)

Użytkownikowi przysługują następujące prawa:

- **Prawo dostępu** — możesz zażądać informacji o przetwarzanych danych
- **Prawo do sprostowania** — możesz poprawić nieprawidłowe dane
- **Prawo do usunięcia** — możesz zażądać usunięcia swoich danych („prawo do bycia zapomnianym")
- **Prawo do przenoszenia danych** — możesz otrzymać swoje dane w formacie nadającym się do odczytu maszynowego
- **Prawo do ograniczenia przetwarzania** — możesz zażądać wstrzymania przetwarzania danych w określonych przypadkach
- **Prawo do sprzeciwu** — możesz sprzeciwić się przetwarzaniu opartemu na prawnie uzasadnionym interesie

Aby skorzystać z powyższych praw, skontaktuj się pod adresem: **kontakt@zing-app.pl** *(zastąp właściwym adresem e-mail)*.

Masz również prawo złożyć skargę do **Prezesa Urzędu Ochrony Danych Osobowych** (PUODO), ul. Stawki 2, 00-193 Warszawa, [uodo.gov.pl](https://uodo.gov.pl).

---

## 7. Bezpieczeństwo danych

Administrator stosuje następujące środki bezpieczeństwa:
- Szyfrowanie danych w transmisji (HTTPS/TLS)
- Uwierzytelnianie użytkowników przez Firebase Authentication
- Reguły bezpieczeństwa Firestore — każdy użytkownik ma dostęp wyłącznie do własnych danych
- Klucze API do zewnętrznych usług przechowywane po stronie serwera (nie w aplikacji mobilnej)

---

## 8. Dzieci

Aplikacja nie jest skierowana do dzieci poniżej 13. roku życia. Nie zbieramy świadomie danych osobowych od dzieci. Jeśli dowiesz się, że dziecko przekazało nam dane osobowe, prosimy o kontakt — usuniemy je niezwłocznie.

---

## 9. Zmiany w Polityce Prywatności

Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. O wszelkich istotnych zmianach użytkownicy zostaną poinformowani w Aplikacji lub drogą e-mail. Dalsze korzystanie z Aplikacji po wprowadzeniu zmian oznacza ich akceptację.

---

## 10. Kontakt

W przypadku pytań dotyczących niniejszej Polityki Prywatności prosimy o kontakt:

**E-mail:** kontakt@zing-app.pl *(zastąp właściwym adresem e-mail)*

---

*Niniejsza Polityka Prywatności jest dostępna w języku polskim.*
