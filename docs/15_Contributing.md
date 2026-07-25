# Contributing to LunaBloom

First off, thank you for considering contributing to LunaBloom! It's people like you that make open source such a great community.

## 1. Code of Conduct
By participating in this project, you are expected to uphold our [Code of Conduct](../CODE_OF_CONDUCT.md). Please report unacceptable behavior to the repository maintainers.

## 2. Architecture Rules
Before writing any code, you **must** read the [Architecture Guide](./03_Architecture.md) and understand the [Folder Structure](./04_Folder_Structure.md). 

PRs will be rejected if they violate the Dependency Rule (e.g., if a file in `src/domain/` imports from `src/presentation/` or `src/infrastructure/`).

## 3. Branch Naming Convention
Please prefix your branch names to clearly communicate the intent of your work:
- `feat/`: A new feature (e.g., `feat/data-export`)
- `fix/`: A bug fix (e.g., `fix/theme-flicker`)
- `docs/`: Documentation only changes
- `refactor/`: Code changes that neither fix a bug nor add a feature
- `test/`: Adding missing tests or correcting existing ones

## 4. Coding Standards
- **TypeScript**: We enforce strict TypeScript. Do not use `any` unless absolutely unavoidable (and if so, leave a comment explaining why).
- **Design System**: Never hardcode colors, spacing, or typography. Always use the tokens defined in `src/design-system/`.
- **State Management**: Do not put business logic inside Zustand stores. Use Cases belong in the Application layer.

## 5. Testing Requirements
Any new feature or bug fix must be accompanied by appropriate tests:
- **Unit Tests**: Place your Jest tests alongside the file they are testing (e.g., `MyUseCase.test.ts`).
- **Visual Tests**: If you are modifying the UI significantly, update or add a Maestro flow in `.maestro/`.

## 6. Pull Request Process
1. Ensure your code passes all linting (`npm run lint`), type checking (`npm run typecheck`), and tests (`npm test`).
2. Run the security audit (`npm run audit:all`) to ensure no vulnerable dependencies were introduced.
3. Push your branch and open a Pull Request against `main`.
4. Fill out the provided PR template.
5. Wait for a maintainer to review your code. We may request changes to ensure architectural alignment.

---
**Next up:** Having issues getting set up? Check out the [Troubleshooting Guide](./16_Troubleshooting.md).
