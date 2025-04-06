
import React, { useState } from 'react';
import { Users, Phone, Calendar, Bell, FileText, History, Moon, Sun } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { useAuthStore } from '../store/auth';
import ClientsTab from './tabs/ClientsTab';
import CallsTab from './tabs/CallsTab';
import CalendarTab from './tabs/CalendarTab';
import NotificationsTab from './tabs/NotificationsTab';
import DocumentsTab from './tabs/DocumentsTab';
import HistoryTab from './tabs/HistoryTab';

interface AgentDashboardProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function AgentDashboard({ language, onLanguageChange }: AgentDashboardProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Error: {error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Dismiss
        </button>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState('clients');
  const { theme, toggleTheme } = useAuthStore();
  const t = translations[language];

  const { role } = useAuthStore();
  
  // Redirect if somehow an admin accesses this component
  useEffect(() => {
    if (role === 'admin') {
      window.location.href = '/';
    }
  }, [role]);

  const tabs = [
    { id: 'clients', icon: Users, label: t.dashboard.clients, component: ClientsTab },
    { id: 'calls', icon: Phone, label: t.dashboard.calls, component: CallsTab },
    { id: 'calendar', icon: Calendar, label: t.dashboard.calendar, component: CalendarTab },
    { id: 'notifications', icon: Bell, label: t.dashboard.notifications, component: NotificationsTab },
    { id: 'documents', icon: FileText, label: t.dashboard.documents, component: DocumentsTab },
    { id: 'history', icon: History, label: t.dashboard.history, component: HistoryTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <nav className={`fixed top-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? theme === 'dark' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-700'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onLanguageChange(language === 'fr' ? 'de' : 'fr')}
                className={`p-2 rounded-md ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {language === 'fr' ? '🇫🇷' : '🇩🇪'}
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`rounded-lg shadow p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
}
