import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Platform,
} from 'react-native';
import { theme } from '../constants/theme';

export interface TextProps extends RNTextProps {
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

export interface TextInputProps extends RNTextInputProps {
  ref?: React.Ref<RNTextInput>;
}

/**
 * Custom Text component that guarantees the Oswald font is applied
 * to all texts across Android, iOS, and Web without system font fallback.
 */
export function Text({ style, weight, ...props }: TextProps) {
  const flattened = StyleSheet.flatten(style) || {};
  let targetFont = theme.fonts.regular;
  const fw = weight || flattened.fontWeight;
  if (fw === 'bold' || fw === '700' || fw === '800' || fw === '900') {
    targetFont = theme.fonts.bold;
  } else if (fw === '600' || fw === 'semiBold') {
    targetFont = theme.fonts.semiBold;
  } else if (fw === '500' || fw === 'medium') {
    targetFont = theme.fonts.medium;
  } else if (flattened.fontFamily) {
    targetFont = flattened.fontFamily;
  }
  
  // On Android, specifying fontWeight together with custom font causes
  // Android's font manager to fail to synthesize and silently fallback to Roboto.
  // We strip fontWeight on Android and let the specific Oswald font family handle weight.
  const resolvedStyle =
    Platform.OS === 'android'
      ? [
          { fontFamily: targetFont },
          flattened,
          { fontFamily: targetFont, fontWeight: undefined },
        ]
      : [{ fontFamily: targetFont }, flattened];
  return <RNText {...props} style={resolvedStyle} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  const flattened = StyleSheet.flatten(style) || {};
  const targetFont = flattened.fontFamily || theme.fonts.regular;
  const resolvedStyle =
    Platform.OS === 'android'
      ? [
          { fontFamily: targetFont },
          flattened,
          { fontFamily: targetFont, fontWeight: undefined },
        ]
      : [{ fontFamily: targetFont }, flattened];
  return <RNTextInput {...props} style={resolvedStyle} />;
}
