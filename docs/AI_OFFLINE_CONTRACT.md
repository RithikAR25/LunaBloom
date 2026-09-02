# LunaBloom AI Offline Contract

## The Guarantee
LunaBloom AI guarantees that **no health data or conversational queries will ever leave the user's device.**
The AI operates 100% locally and offline. 

## Architectural Constraints
To maintain this guarantee, the following architectural constraints are strictly enforced:

1. **Local Inference:** `llama.rn` executes the Gemma 3 1B model entirely on the local device's CPU/GPU. No cloud APIs (OpenAI, Anthropic, Google, etc.) are used for inference.
2. **Local RAG:** The RAG (Retrieval-Augmented Generation) knowledge base is pre-bundled into the application assets (`assets/knowledge/index.json`). No external web searches are performed.
3. **Local Tools:** All data retrieval tools (`getPrediction`, `getCycleHistory`, etc.) query the local SQLite database via WatermelonDB.
4. **No Telemetry:** Conversational queries and AI responses are NOT logged to any external analytics or crash reporting service.
5. **No Network Access during Pipeline Execution:** The `AIPipeline.ts` orchestrator contains no `fetch`, `XMLHttpRequest`, or websocket calls. It relies solely on local services.

## Verification
This contract is verified through:
1. **Manual Testing:** Running the application in Airplane Mode and verifying that full AI functionality (inference, RAG, and data retrieval) works without errors.
2. **Automated Testing:** Future integration tests will mock the network layer to assert that no outbound connections are attempted during `AIPipeline.executeTurn`.
3. **App Store Declarations:** This offline-first architecture allows LunaBloom to truthfully declare that health data is never collected or transmitted off-device in the Apple App Store and Google Play Store privacy labels.
