// alert.ts — natywnie po prostu Alert z react-native.
//
// Ten moduł istnieje dla swojego bliźniaka alert.web.ts: react-native-web
// eksportuje Alert, ale jego implementacja to `static alert() {}` — pusta
// funkcja. Każde potwierdzenie w aplikacji po cichu nic nie robiło na webie.
// Importuj Alert STĄD, nie z 'react-native'.

export { Alert } from 'react-native';
