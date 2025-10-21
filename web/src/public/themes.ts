export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;        // Main brand color
    secondary: string;      // Accent color
    tertiary: string;       // Additional accent
    background: string;     // Page background
    surface: string;        // Card/surface background
    text: string;          // Primary text
    textSecondary: string; // Secondary text
    border: string;        // Border color
  };
  fontFamily: string;
}

export const themes: Theme[] = [
  {
    id: 'brewedat-brand',
    name: 'BrewedAt Light',
    description: 'Official brand colors on light background',
    colors: {
      primary: '#1f3540',      // Dark blue-gray
      secondary: '#fd5526',    // Orange-red
      tertiary: '#25303d',     // Darker blue-gray
      background: '#f5f5f5',   // Light gray
      surface: '#FFFFFF',      // White
      text: '#1f3540',         // Dark blue-gray
      textSecondary: '#25303d', // Darker blue-gray
      border: '#d0d0d0',       // Gray
    },
    fontFamily: 'Rubik, sans-serif',
  },
  {
    id: 'brewedat-dark',
    name: 'BrewedAt Dark',
    description: 'Dark theme with brand colors and moody vibes',
    colors: {
      primary: '#1f3540',      // BrewedAt blue
      secondary: '#fd5526',    // BrewedAt orange
      tertiary: '#25303d',     // Darker blue-gray
      background: '#1f3540',   // BrewedAt blue
      surface: '#25303d',      // Darker blue-gray
      text: '#ffffff',         // White
      textSecondary: '#b8c5d0', // Light blue-gray
      border: '#3a4550',       // Medium blue-gray
    },
    fontFamily: 'Rubik, sans-serif',
  },
];

export const defaultTheme = themes[1]; // BrewedAt Dark theme
