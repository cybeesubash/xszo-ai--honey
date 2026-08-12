import React, { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import LoginForm from './components/LoginForm.jsx';
import AboutPage from './components/AboutPage';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'about'>('landing');

  return (
    <div className="min-h-screen bg-[#050611] text-gray-100">
      
      {screen === 'landing' && (
        <LandingPage 
          onEnterApp={() => setScreen('login')} 
          onNavigateAbout={() => setScreen('about')}
        />
      )}

      {screen === 'about' && (
        <AboutPage 
          onNavigateHome={() => setScreen('landing')}
          onNavigateLogin={() => setScreen('login')}
          onNavigateDemo={() => setScreen('login')}
        />
      )}

      {screen === 'login' && (
        <LoginForm 
          onLoginSuccess={() => setScreen('landing')}
          onBack={() => setScreen('landing')} 
        />
      )}
      
    </div>
  );
}
