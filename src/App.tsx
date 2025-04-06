import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AgentDashboard from './components/AgentDashboard';
import { Language } from './types';

function App() {
  const { user, role, loading, checkUser, session } = useAuthStore();
  const [language, setLanguage] = useState<Language>('fr');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkUser();
      setInitialized(true);
    };
    init();
  }, [checkUser]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !session) {
    return <Login language={language} onLanguageChange={setLanguage} />;
  }

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return role === 'admin' ? (
    <Dashboard isAdmin={true} language={language} onLanguageChange={setLanguage} />
  ) : (
    <AgentDashboard language={language} onLanguageChange={setLanguage} />
  );
}

export default App;