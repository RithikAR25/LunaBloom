# ADR-0005: Offline-First Architecture

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Deciders** | Lead Developer |
| **Supersedes** | — |

---

## Context

LunaBloom is a women's health tracking application handling sensitive menstrual and reproductive health data. Users must be able to track their cycle, log symptoms, view predictions, and access educational content at any time — regardless of network availability, data plan status, or geographic location.

V1 has no backend. V2 will introduce Firebase cloud synchronization as an opt-in feature.

---

## Decision

**LunaBloom V1 is 100% offline-first.** Every core feature works without an internet connection. Zero network calls are made in V1.

---

## Definition of Offline-First

"Offline-first" means the local device is the **primary data store**. The network is optional, never required. This is distinct from:

- **Online-only:** Requires network for any functionality
- **Offline-capable:** Primary store is the server; local is a cache that degrades gracefully
- **Offline-first ✅:** Primary store is local; server sync is an enhancement

---

## Rationale

### Privacy
Users' most intimate health data — period dates, pregnancy tests, sexual activity, pain levels — must not be transmitted to any server without explicit consent. Offline-first is the only architecture that guarantees this in V1.

### Reliability
Period tracking is time-sensitive. A user preparing for her period should not be unable to access the app due to poor connectivity (travel, rural areas, airplane mode).

### Trust
Women's health apps have a documented history of sharing user data with advertisers and data brokers. "All data stays on your device" is a genuine differentiator and a trust signal.

### Performance
Local data access is orders of magnitude faster than network requests. The app loads instantly; predictions compute in milliseconds.

---

## Alternatives Considered

### Option A: Online-First with Local Cache
- Primary data store is Firebase; local SQLite is a read cache
- Requires internet for initial setup and data writes
- Data is vulnerable to server breaches, policy changes, company acquisition
- Poor experience in low-connectivity environments
- Eliminated — conflicts with privacy-first principle

### Option B: Online-Only (no local storage)
- Simplest to implement
- Completely unusable offline
- Unacceptable for a health tracking app
- Eliminated

### Option C: Offline-First ✅ Chosen
- All data lives locally by default
- Network sync is an optional enhancement (V2)
- Zero external network calls in V1 — provable privacy guarantee
- Repository Pattern ensures V2 sync adds zero friction to V1 users

---

## Implications for V1 Architecture

| Component | Offline-First Implementation |
|---|---|
| Data storage | Expo SQLite on device |
| Predictions | Computed locally from SQLite data |
| Educational content | JSON files bundled with the app |
| Notifications | Local push notifications (expo-notifications) |
| Health tips | Static curated list bundled with app |
| Export | Written to device file system |
| Encryption | SQLCipher — device-local, no key server |

---

## V2 Sync Design Principles

When Firebase sync is introduced in V2, it must follow these offline-first rules:

1. **Write local first:** Every write goes to SQLite immediately. Firebase sync is asynchronous.
2. **Read local first:** UI always reads from SQLite. Firebase data populates SQLite in the background.
3. **Conflict resolution:** Last-write-wins by `updatedAt` timestamp. (Simple; sufficient for a single-user app.)
4. **Sync is opt-in:** Users must explicitly enable cloud sync. Sync off = identical experience to V1.
5. **Graceful degradation:** If Firebase is unavailable, the app continues working normally from local data.

---

## Consequences

**Positive:**
- Users can track their cycle anywhere, any time, with any network status
- Provable privacy: zero external data transmission in V1
- Instant performance: no network latency on any user interaction
- No dependency on external service availability (Firebase outages don't affect V1 users)

**Negative:**
- If a user loses their device without exporting a backup, data is lost (V1 limitation, V2 resolves)
- No multi-device support in V1 (resolved by Firebase sync in V2)
- Educational content and health tips require an app update to refresh (resolved by CMS in V2+)

---

## References
- [Offline First — offlinefirst.org](http://offlinefirst.org/)
- [Local-first software (Ink & Switch)](https://www.inkandswitch.com/local-first/)
