import { Translation } from './types';

export const translations: Record<'fr' | 'de', Translation> = {
  fr: {
    login: {
      title: 'Connexion CRM',
      email: 'Email',
      password: 'Mot de passe',
      submit: 'Se connecter',
    },
    dashboard: {
      title: 'Centre d\'Appels',
      welcome: 'Bienvenue dans votre espace CRM',
      clients: 'Clients',
      calls: 'Actions',
      calendar: 'Calendrier',
      notifications: 'Notifications',
      documents: 'Documents',
      history: 'Historique',
      analytics: 'Analytique',
    },
  },
  de: {
    login: {
      title: 'CRM Anmeldung',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
    },
    dashboard: {
      title: 'Callcenter',
      welcome: 'Willkommen in Ihrem CRM-Bereich',
      clients: 'Kunden',
      calls: 'Aktionen',
      calendar: 'Kalender',
      notifications: 'Benachrichtigungen',
      documents: 'Dokumente',
      history: 'Verlauf',
      analytics: 'Analytik',
    },
  },
};