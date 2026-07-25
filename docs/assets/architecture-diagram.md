```mermaid
graph TD
    %% Define Styles
    classDef presentation fill:#4a90e2,stroke:#333,stroke-width:2px,color:#fff
    classDef application fill:#50e3c2,stroke:#333,stroke-width:2px,color:#333
    classDef domain fill:#f5a623,stroke:#333,stroke-width:2px,color:#fff
    classDef infrastructure fill:#9b9b9b,stroke:#333,stroke-width:2px,color:#fff

    subgraph Presentation Layer [Presentation Layer - UI & State]
        UI[Expo Router Screens & UI Components]
        Stores[Zustand Stores]
    end
    class Presentation Layer presentation
    
    subgraph Application Layer [Application Layer - Use Cases]
        UseCases[Application Use Cases]
        Services[Application Services]
    end
    class Application Layer application

    subgraph Domain Layer [Domain Layer - Core Business Logic]
        Models[Domain Models / Entities]
        Interfaces[Repository Interfaces]
        Errors[Domain Errors]
    end
    class Domain Layer domain

    subgraph Infrastructure Layer [Infrastructure Layer - Data & External]
        Repositories[Repository Implementations]
        Database[SQLite Database]
        Storage[Secure Storage / File System]
    end
    class Infrastructure Layer infrastructure

    %% Dependency Flow
    UI -->|Dispatches Actions| Stores
    Stores -->|Executes| UseCases
    UseCases -->|Operates On| Models
    UseCases -->|Calls| Interfaces
    Repositories -.->|Implements| Interfaces
    Repositories -->|Queries/Mutates| Database
    Repositories -->|Reads/Writes| Storage
```
