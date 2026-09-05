import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/presentation/hooks/useTheme';
import { useScaling } from '@/design-system';
import { Heading } from '@/presentation/components/ui/Heading';

export function LunaBloomLoader() {
  const { colors, isDark } = useTheme();
  const { scale: responsiveScale } = useScaling();
  const reducedMotion = useReducedMotion();

  // Animation values
  const scale = useSharedValue(0.98);
  const opacity = useSharedValue(0.96);

  useEffect(() => {
    if (!reducedMotion) {
      scale.value = withRepeat(
        withTiming(1.02, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite
        true // reverse
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [reducedMotion, scale, opacity]);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const logoSource = isDark
    ? require('../../../../assets/splash_logo_dark.png')
    : require('../../../../assets/splash_logo.png');
  const floralTopSource = isDark
    ? require('../../../../assets/splash_floral_top_dark.png')
    : require('../../../../assets/splash_floral_top.png');
  const floralBottomSource = isDark
    ? require('../../../../assets/splash_floral_bottom_dark.png')
    : require('../../../../assets/splash_floral_bottom.png');

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background }]}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(250)}
    >
      {/* Top Floral Decoration */}
      <Image
        source={floralTopSource}
        style={styles.floralTop}
        contentFit="contain"
        contentPosition="top left"
      />

      {/* Centered Logo & Wordmark */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle, { width: responsiveScale(140), height: responsiveScale(140) }]}>
          <Image
            source={logoSource}
            style={[
              styles.logo,
              !reducedMotion && {
                shadowColor: isDark ? '#ff816e' : '#550000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
              },
            ]}
            contentFit="contain"
          />
        </Animated.View>
        <Heading
          level="h1"
          style={styles.wordmark}
        >
          LunaBloom
        </Heading>
      </View>

      {/* Bottom Floral Decoration */}
      <Image
        source={floralBottomSource}
        style={styles.floralBottom}
        contentFit="contain"
        contentPosition="bottom right"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it sits on top of everything during transition
  },
  floralTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '40%',
  },
  floralBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '40%',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    // width: 140, // scaled inline
    // height: 140, // scaled inline
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  wordmark: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 32,
    letterSpacing: 1.2,
  },
});
