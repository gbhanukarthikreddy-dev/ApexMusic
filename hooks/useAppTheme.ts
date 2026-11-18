import { BlurTint } from 'expo-blur';
import { darkColors, ThemeColors } from '../theme';

export function useAppTheme(): {
  themeMode: 'dark';
  isDark: true;
  colors: ThemeColors;
  blurTint: BlurTint;
  chromeBlurTint: BlurTint;
} {
  return {
    themeMode: 'dark',
    isDark: true,
    colors: darkColors,
    blurTint: 'systemThinMaterialDark',
    chromeBlurTint: 'systemChromeMaterialDark',
  };
}
