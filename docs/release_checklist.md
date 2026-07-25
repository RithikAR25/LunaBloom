# LunaBloom Release Checklist

## 1. Quality Assurance
- [ ] Visual regression tests (Maestro) passed on iOS and Android.
- [ ] Unit tests (`npm test`) passed.
- [ ] Static analysis (`npm run lint` and `npm run typecheck`) passed.
- [ ] Accessibility checklist verified.

## 2. Security & Compliance
- [ ] `npm run audit:all` executed with zero high/critical vulnerabilities.
- [ ] License checker run and open-source licenses verified.
- [ ] API keys and secrets are securely managed (not hardcoded).

## 3. Configuration & Metadata
- [ ] App Version bumped in `app.json` and `package.json`.
- [ ] Bundle Identifiers (`com.lunabloom.app`) verified.
- [ ] App Icons, Splash Screens, and Adaptive Icons generated and mapped correctly.

- [ ] EAS configuration (`eas.json`) is correct and distribution is set to `store` (if applicable) or `internal`.

## 4. Performance
- [ ] Production build profiled on physical device.
- [ ] UI maintains 60FPS during critical flows (theme switch, navigation).
- [ ] Bundle size within acceptable limits.

## 5. Deployment
- [ ] Create Git tag for the release (e.g., `v1.0.0`).
- [ ] Run `eas build -p ios --profile production`.
- [ ] Run `eas build -p android --profile production`.
- [ ] Upload to TestFlight / Google Play Internal Testing.
- [ ] Generate final `CHANGELOG.md` and publish release notes.
