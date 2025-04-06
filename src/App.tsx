
import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AgentDashboard from './components/AgentDashboard';
import { Language } from './types';

function App() {
  const { user, role, loading, checkUser, session } = useAuthStore();
  const [language, setLanguage] = React.useState<Language>('fr');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkUser();
      setInitialized(true);
    };
    init();
  }, []);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !user) {
    return <Login language={language} onLanguageChange={setLanguage} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login language={language} onLanguageChange={setLanguage} />;
  }

  return role === 'admin' ? (
    <Dashboard isAdmin={true} language={language} onLanguageChange={setLanguage} />
  ) : (
    <AgentDashboard language={language} onLanguageChange={setLanguage} />
  );
}

export default App;
