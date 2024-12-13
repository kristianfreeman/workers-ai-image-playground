import React, { useEffect, useState } from 'react';
import { Toggle } from '@/components/ui/toggle';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference) {
      setIsDarkMode(savedPreference === 'true');
      document.documentElement.classList.toggle('dark', savedPreference === 'true');
    }
  }, []);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  return (
    <Toggle
      checked={isDarkMode}
      onCheckedChange={handleToggle}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? '🌙' : '☀️'}
    </Toggle>
  );
};

export default DarkModeToggle;
