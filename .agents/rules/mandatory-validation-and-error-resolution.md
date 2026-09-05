# LunaBloom — Mandatory Validation and Error Resolution

## Relationship to Other Rules

This rule works alongside and does NOT modify or weaken:
- `.agents/rules/reuse-architecture-first.md`

Both rules are always active. When they overlap, apply both.

---

## Mandatory Post-Implementation Validation

After making ANY code changes, perform an appropriate validation pass. Use the existing `package.json` scripts — inspect them first rather than inventing alternative commands.

At minimum, consider and run:
- TypeScript/typecheck validation
- Unit/integration tests
- Lint/static analysis
- Build validation when appropriate
- Relevant feature-specific tests
- Relevant existing tests affected by the changed files

---

## TypeScript Validation

After every implementation:

1. Run the project's TypeScript typecheck command (e.g. `npm run typecheck`).
2. Treat TypeScript errors as implementation errors unless proven otherwise.
3. Investigate the root cause of each error.
4. Fix errors introduced by the current change.
5. Re-run typecheck after fixing to confirm resolution.

**Forbidden workarounds** — do not silence errors with:
- `any`
- `@ts-ignore`
- `@ts-expect-error`
- Unsafe casts (`as unknown as X`)

...unless there is a documented, architecturally justified reason that is explained inline and in the validation report.

---

## Test Validation

After implementation:

1. Run the most relevant focused tests first when available.
2. Run the broader test suite when appropriate.
3. Classify each failure as one of: **NEW**, **PRE-EXISTING**, **INFRASTRUCTURE**, or **UNRELATED** (see Failure Classification below).
4. Never automatically classify a failure as pre-existing without investigating it.
5. If a failure is caused by the current implementation, fix it and rerun the affected tests.
6. If a failure is genuinely pre-existing or infrastructure-related, clearly report it separately with evidence.

---

## Lint and Static Analysis

Run the project's lint/static-analysis command when applicable.

For newly introduced lint errors:
- Fix them in the implementation.
- Do not disable lint rules to make the check pass.
- Do not modify global lint configuration to hide feature-specific problems.

Existing unrelated lint problems may remain but must be distinguished from newly introduced ones.

---

## Context-Aware Error Resolution

When an error occurs, do NOT fix it mechanically.

Before changing code to resolve an error:

1. Understand what the affected feature is supposed to do.
2. Inspect the surrounding architecture.
3. Inspect related components, utilities, hooks, stores, services, and domain logic.
4. Consider existing contracts and downstream consumers.
5. Follow existing project patterns (see reuse-architecture-first.md).
6. Reuse existing utilities and architecture per the reuse rule.
7. Determine the root cause.
8. Apply the smallest correct architectural fix.
9. Re-run the relevant validation.

**The goal is NOT simply to make the compiler/test runner green.**
**The goal is to make the implementation correct within the existing LunaBloom architecture.**

---

## Regression Protection

After fixing an error:

- Re-run the validation that exposed it.
- Run relevant neighbouring tests.
- Check that the fix did not break existing behavior.
- When modifying shared utilities or components, inspect their consumers before and after the change.
- When modifying domain logic, verify affected use-cases and services.
- When modifying UI components, verify their existing consumers and design-system contracts.
- The `WheelPicker.tsx` `ITEM_HEIGHT`/`LIST_HEIGHT` constants and `BottomPickerModal` API are protected contracts — verify their consumers after any adjacent change.

---

## Validation Escalation Order

Apply this order where practical:

1. Typecheck
2. Focused tests for the changed feature
3. Related tests
4. Full test suite
5. Lint/static analysis
6. Build validation when relevant

Do not skip a later step merely because an earlier step passed, if the later check is relevant to the change.

---

## Failure Classification

Every validation failure must be classified as one of:

| Classification | Meaning |
|---|---|
| **NEW** | Introduced by the current changes |
| **PRE-EXISTING** | Existed before the current changes — must be supported with evidence |
| **INFRASTRUCTURE** | Caused by the test/build/tooling environment, not application code |
| **UNRELATED** | Unrelated to the current feature — must be supported with evidence |

Classification must be based on evidence, not assumption. When possible, compare against the known baseline or inspect the error and affected code.

### Known LunaBloom Baseline Failures

The following failures have previously been observed in this project:

- `Cannot find module 'test-renderer'` from `@testing-library/react-native` — affects any test suite using `@testing-library/react-native`.
- `TypeError: Cannot read properties of undefined (reading 'loadUnpackers')` from `react-native-worklets` — affects `InsightsScreen.test.tsx` and any test importing `react-native-reanimated`.
- `ProfileTimezone.test.tsx` — `useTheme` mock path resolution failure.

> [!IMPORTANT]
> These failures may be treated as **PRE-EXISTING only after confirming that the current change did not cause or alter the failure**.
> Do NOT auto-ignore them. For each occurrence, verify: (1) the failure message is identical to the baseline, (2) the stack trace does not involve any file touched by the current change, and (3) no new file was introduced that triggered the same error for a different reason.
>
> A future change could cause one of these same error messages to appear for a new reason. Always verify before classifying.

Any new failure outside this list must be investigated and classified explicitly.

---

## No False Success

The agent MUST NOT report an implementation as fully validated if:

- Typecheck failed due to the implementation.
- New tests fail due to the implementation.
- New lint errors were introduced.
- A relevant build fails because of the implementation.
- A validation step was skipped without explaining why.

If validation is blocked by an unrelated infrastructure issue, explicitly state:
- What was blocked and why.
- What validation successfully completed.

---

## Final Validation Report

After completing implementation and validation, provide a concise report:

### Validation Performed
| Check | Result |
|---|---|
| Typecheck | PASS / FAIL / BLOCKED |
| Focused tests | PASS / FAIL / BLOCKED |
| Related tests | PASS / FAIL / BLOCKED |
| Full test suite | PASS / FAIL / BLOCKED |
| Lint/static analysis | PASS / FAIL / BLOCKED / SKIPPED (reason) |
| Build | PASS / FAIL / BLOCKED / N/A |

### Errors Found
List every error discovered during validation.

### Errors Fixed
List every error introduced by the implementation and how it was resolved.

### Remaining Issues
List only genuine remaining issues with classification:
- PRE-EXISTING
- INFRASTRUCTURE
- UNRELATED

### Final Assessment

State one of:
- **VALIDATED** — all relevant checks pass; no new errors.
- **VALIDATED WITH PRE-EXISTING ISSUES** — new code is correct; remaining failures are pre-existing/infrastructure with evidence.
- **BLOCKED** — validation could not complete due to infrastructure; state what was verified and what was not.
- **NOT SAFE TO PROCEED** — new errors remain unresolved.
