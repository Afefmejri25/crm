
import React, { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AgentDashboard from './components/AgentDashboard';
import { Language } from './types';

function App() {
  const { user, role, loading, checkUser } = useAuthStore();
  const [language, setLanguage] = React.useState<Language>('fr');

  useEffect(() => {
    checkUser();
  }, [checkUser]);

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
