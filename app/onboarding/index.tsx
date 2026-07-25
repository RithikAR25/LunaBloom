import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { useOnboardingStore } from '../../src/presentation/stores/useOnboardingStore';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { Button } from '../../src/presentation/components/ui/Button';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { completeOnboardingFlow } = useProfileStore();
  const resetOnboarding = useOnboardingStore(s => s.reset);

  const handleContinue = () => {
    router.push('/onboarding/name');
  };

  const handleSkip = async () => {
    resetOnboarding();
    await completeOnboardingFlow({});
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image 
            source={require('../../assets/banner.png')} 
            style={styles.banner} 
            contentFit="cover" 
            contentPosition="top" 
          />
        </View>

        {/* Text Content */}
        <View style={styles.content}>
          <Heading level="h1" style={[styles.title, { color: colors.brand.primary }]}>
            Welcome to LunaBloom
          </Heading>
          
          <Text variant="body" style={[styles.subtitle, { color: colors.text.secondary }]}>
            Let&apos;s personalize your experience. We&apos;ll ask a few questions to tailor the app to your unique biological needs.
          </Text>

          {/* Privacy Card */}
          <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <View style={[styles.lockIconContainer, { backgroundColor: colors.surfaceElevated }]}>
              <Feather name="lock" size={18} color={colors.brand.primary} />
            </View>
            <Text style={[styles.privacyTitle, { color: colors.brand.primary }]}>PRIVACY FIRST</Text>
            <Text variant="body" style={[styles.privacyText, { color: colors.text.secondary }]}>
              LunaBloom is designed to respect your privacy. Your data stays on your device unless you actively choose to sync it.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Fixed Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <Button variant="primary" label="Get Started" onPress={handleContinue} />
        <View style={styles.skipSpacer} />
        <Button variant="ghost" label="Skip Setup" onPress={handleSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  bannerContainer: {
    height: '60%',
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
  },

  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
privacyCard: {
  marginTop: 24,
  padding: 12,
  borderRadius: 20,
  alignItems: 'center',
  width: '100%',
  
  // Border fix: Specific borders instead of global borderWidth
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderBottomWidth: 0,
  borderColor: '#000', // Add your border color here if needed

  // Shadow fix: Move shadow upward (negative height) or remove height
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 }, // Negative height moves shadow to the top
  shadowOpacity: 0.03,
  shadowRadius: 12,
  
  // Note: Android elevation (elevation: 2) casts a uniform shadow all around 
  // and cannot be directed away from the bottom. If you are targeting Android, 
  // you may need to drop elevation or use a library for custom shadows.
  elevation: 0, 
},
  lockIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  privacyTitle: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  privacyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 0,
    width: '100%',
  },
  skipSpacer: {
    height: 4,
  },
});
