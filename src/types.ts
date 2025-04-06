export type Language = 'fr' | 'de';

export interface Translation {
  login: {
    title: string;
    email: string;
    password: string;
    submit: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    clients: string;
    calls: string;
    calendar: string;
    notifications: string;
    documents: string;
    history: string;
    analytics: string;
  };
}