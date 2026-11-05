import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import frCommon from './locales/fr/common.json';
import enCommon from './locales/en/common.json';
import frLanding from './locales/fr/landing.json';
import enLanding from './locales/en/landing.json';
import frClubs from './locales/fr/clubs.json';
import enClubs from './locales/en/clubs.json';
import frReservations from './locales/fr/reservations.json';
import enReservations from './locales/en/reservations.json';
import frTournaments from './locales/fr/tournaments.json';
import enTournaments from './locales/en/tournaments.json';
import frMemberships from './locales/fr/memberships.json';
import enMemberships from './locales/en/memberships.json';
import frAuth from './locales/fr/auth.json';
import enAuth from './locales/en/auth.json';
import frApp from './locales/fr/app.json';
import enApp from './locales/en/app.json';
import frShop from './locales/fr/shop.json';
import enShop from './locales/en/shop.json';

i18n
  .use(LanguageDetector)       // Detect user's language automatically
  .use(initReactI18next)       // Connect i18next to React
  .init({
    resources: {
      fr: { 
        common: frCommon, 
        landing: frLanding, 
        clubs: frClubs, 
        reservations: frReservations, 
        tournaments: frTournaments,
        memberships: frMemberships,
        auth: frAuth,
        app: frApp,
        shop: frShop,
      },  // French translations
      en: { 
        common: enCommon, 
        landing: enLanding, 
        clubs: enClubs, 
        reservations: enReservations, 
        tournaments: enTournaments,
        memberships: enMemberships,
        auth: enAuth,
        app: enApp,
        shop: enShop,
      },
    },
    fallbackLng: 'fr',         // If a key is missing, show French
    defaultNS: 'common',       // Default namespace (so we don't write t('common:hello'))
    ns: ['common', 'landing', 'clubs', 'reservations', 'tournaments', 'memberships', 'auth', 'app', 'shop'],  // Namespaces for different parts of the app
    interpolation: {
      escapeValue: false,      // React already escapes, no need for i18next to do it
    },
    detection: {
      order: ['localStorage', 'navigator'],  // Check saved preference first, then browser
      caches: ['localStorage'],              // Save user's choice in localStorage
    },
  });

export default i18n;