import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/presentation/stores/useProfileStore';
import { useCycleStore } from '@/presentation/stores/useCycleStore';
import { useContentStore } from '@/presentation/stores/useContentStore';
import { LunaBloomLoader } from '@/presentation/components/ui/LunaBloomLoader';

export default function BootScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.isLoading);
  const cycleLoading = useCycleStore((s) => s.isLoading);
  const contentLoading = useContentStore((s) => s.isLoading);

  useEffect(() => {
    // Wait until all stores have hydrated from SQLite
    if (profileLoading || cycleLoading || contentLoading) {
      return;
    }

    // Determine the user's correct destination exactly once
    if (profile?.onboardingCompleted) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding' as any);
    }
  }, [profile, profileLoading, cycleLoading, contentLoading, router]);

  // While waiting, we render the exact same UI as the Native Splash
  return <LunaBloomLoader />;
}
