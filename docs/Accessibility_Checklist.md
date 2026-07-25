# LunaBloom Accessibility Checklist

## Static Analysis & Code Quality
- [ ] `eslint-plugin-react-native-a11y` is installed and rules are enforced.
- [ ] All `TouchableOpacity` and `Pressable` components have appropriate `accessibilityRole` and `accessibilityLabel`.
- [ ] Icons used as buttons have `accessible={true}` and `accessibilityLabel` set.

## Visual Design & Theming
- [ ] Text contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).
- [ ] Dark mode palette maintains minimum contrast ratios, avoiding pure black/white extremes where possible.
- [ ] Focus states or pressed states are clearly visible for all interactive elements.

## Dynamic Type & Scaling
- [ ] The app handles `allowFontScaling={true}` gracefully on all `Text` components.
- [ ] UI layouts do not break or clip text when system font size is increased to 200%.
- [ ] Fixed-height containers are avoided for text-heavy areas (use `minHeight` or padding instead).

## Screen Readers (TalkBack / VoiceOver)
- [ ] Logical traversal order (left-to-right, top-to-bottom) is maintained.
- [ ] Modals and bottom sheets properly trap focus when open.
- [ ] Custom controls (like sliders or segmented controls) implement `accessibilityActions` and respond appropriately.
- [ ] Decorative elements (e.g., background patterns, purely visual icons) have `importantForAccessibility="no"` (Android) and `accessible={false}` (iOS).

## State and Announcements
- [ ] Loading states (spinners, skeletons) announce "Loading" to screen readers.
- [ ] Success/Error toasts or alerts use `AccessibilityInfo.announceForAccessibility()` where necessary.
