import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // Try to load saved theme from localStorage
    const savedThemeId = localStorage.getItem('brewedat-theme');
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) return savedTheme;
    }
    return defaultTheme;
  });

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('brewedat-theme', theme.id);
  };

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Set color variables
    root.style.setProperty('--color-primary', currentTheme.colors.primary);
    root.style.setProperty('--color-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--color-tertiary', currentTheme.colors.tertiary);
    root.style.setProperty('--color-background', currentTheme.colors.background);
    root.style.setProperty('--color-surface', currentTheme.colors.surface);
    root.style.setProperty('--color-text', currentTheme.colors.text);
    root.style.setProperty('--color-text-secondary', currentTheme.colors.textSecondary);
    root.style.setProperty('--color-border', currentTheme.colors.border);

    // Set font family
    root.style.setProperty('--font-family', currentTheme.fontFamily);
    document.body.style.fontFamily = currentTheme.fontFamily;
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
