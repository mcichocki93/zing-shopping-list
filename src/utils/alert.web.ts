// alert.web.ts — Alert dla przeglądarki.
//
// react-native-web eksportuje Alert, ale jego implementacja to dosłownie
// `static alert() {}`. Skutek: na webie nie działało usuwanie list i produktów,
// opuszczanie listy, kasowanie szablonów i konta, potwierdzenie dołączenia po
// kodzie ani żaden komunikat błędu — wszystko po cichu, bez śladu w konsoli.
//
// Mapujemy na natywne okna przeglądarki: window.alert dla komunikatu,
// window.confirm dla pary „anuluj + akcja". Brzydsze niż PPModal, ale działa
// wszędzie i nie wymaga przepisywania dwudziestu wywołań na komponent.
// Docelowo warto zastąpić to dialogiem w stylu Pixel Pop.

type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

function compose(title: string, message?: string): string {
  return message ? `${title}\n\n${message}` : title;
}

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]): void {
    const text = compose(title, message);

    // Brak przycisków albo jeden — zwykły komunikat.
    if (!buttons || buttons.length === 0) {
      window.alert(text);
      return;
    }
    if (buttons.length === 1) {
      window.alert(text);
      buttons[0].onPress?.();
      return;
    }

    // Dwa i więcej: ostatni przycisk niebędący anulowaniem traktujemy jako
    // akcję — taka jest konwencja wywołań w tym projekcie (anuluj pierwszy,
    // akcja druga). window.confirm nie wyrazi trzeciego wyboru, ale takich
    // wywołań tu nie ma.
    const cancel = buttons.find((b) => b.style === 'cancel');
    const action = [...buttons].reverse().find((b) => b.style !== 'cancel') ?? buttons[buttons.length - 1];

    if (window.confirm(text)) action.onPress?.();
    else cancel?.onPress?.();
  },
};
