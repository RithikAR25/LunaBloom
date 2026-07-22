/**
 * LunaBloom Avatar Component
 *
 * Circular avatar showing user initials or an image.
 * Used in the Dashboard header and Settings screen.
 *
 * Priority: imageUri > initials > fallback icon (◑)
 */
import { View, Text, Image, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { borderRadius } from '@/design-system';

export interface AvatarProps {
  /** User initials to show when no image is available (e.g. 'MR') */
  initials?: string;
  /** URI of the avatar image */
  imageUri?: string;
  size?: number;
  /** Override background color — defaults to a purple tint */
  backgroundColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Avatar({
  initials,
  imageUri,
  size = 40,
  backgroundColor,
  style,
  accessibilityLabel = 'User avatar',
}: AvatarProps) {
  const { colors } = useTheme();

  const bgColor = backgroundColor ?? `${colors.brand.primary}33`;
  const fontSize = Math.round(size * 0.38);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius.full,
    backgroundColor: bgColor,
    borderWidth: 1.5,
    borderColor: colors.border,
  };

  if (imageUri !== undefined && imageUri.length > 0) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: borderRadius.full },
          ]}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="image"
        />
      </View>
    );
  }

  const displayText = initials !== undefined && initials.length > 0
    ? initials.toUpperCase().slice(0, 2)
    : '◑';

  return (
    <View
      style={[styles.container, containerStyle, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.initials, { color: colors.brand.primary, fontSize }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: '700',
    includeFontPadding: false,
  },
});
