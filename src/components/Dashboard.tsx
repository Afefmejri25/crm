import React, { useState } from 'react';
import { Globe2, Phone, Calendar, Bell, FileText, History, BarChart3, Users } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import ClientsTab from './tabs/ClientsTab';
import CallsTab from './tabs/CallsTab';
import CalendarTab from './tabs/CalendarTab';
import NotificationsTab from './tabs/NotificationsTab';
import DocumentsTab from './tabs/DocumentsTab';

interface DashboardProps {
  isAdmin: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

function Dashboard({ isAdmin, language, onLanguageChange }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('clients');
  const t = translations[language];

  const tabs = [
    { id: 'clients', icon: Users, label: t.dashboard.clients, component: ClientsTab },
    { id: 'calls', icon: Phone, label: t.dashboard.calls, component: CallsTab },
    { id: 'calendar', icon: Calendar, label: t.dashboard.calendar, component: CalendarTab },
    { id: 'notifications', icon: Bell, label: t.dashboard.notifications, component: NotificationsTab },
    { id: 'documents', icon: FileText, label: t.dashboard.documents, component: DocumentsTab },
    { id: 'history', icon: History, label: t.dashboard.history },
    ...(isAdmin ? [{ id: 'analytics', icon: BarChart3, label: t.dashboard.analytics }] : []),
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">CRM Cineden Tunisie</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onLanguageChange(language === 'fr' ? 'de' : 'fr')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Globe2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <p className="text-gray-600">{t.dashboard.welcome}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;