# Project Diagrams and Charts

This document contains diagrams to support the Vintage Rides Hub project report.

## 1. Gantt Chart (Milestones)

```mermaid
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#ffcccc', 'edgeLabelBackground':'#ffffff'} }}%%
gantt
    title Project Timeline (12 Weeks)
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements Gathering      :done,    req, 2025-01-01, 7d
    UI Wireframes               :done,    ui,  2025-01-08, 14d
    section Development
    Routing & Core UI           :done,    dev1, 2025-01-22, 21d
    Auth & Dashboard            :done,    dev2, 2025-02-12, 14d
    Booking/Calendar Features   :done,    dev3, 2025-02-26, 7d
    Polish & Animations         :done,    dev4, 2025-03-05, 7d
    section Testing
    Manual & Unit Tests         :done,    test, 2025-03-12, 14d
    Bug Fixes & Refinement      :done,    fix, 2025-03-26, 14d
    section Finalization
    Documentation & Review      :done,    doc, 2025-04-09, 7d
    Presentation & Submission   :done,    pres,2025-04-16, 7d
```

_(Dates are illustrative and should correspond to the actual schedule defined in the report.)_

## 2. System Architecture Diagram

```mermaid
flowchart LR
    subgraph Frontend
        A[React Components]
        B[CarContext / AuthContext]
        C[Routing (react-router-dom)]
    end
    subgraph Data
        D[mockData.js (Cars, Users, Bookings)]
    end
    subgraph Browser
        A --> B
        B --> C
        C --> D
    end
```

## 3. State Transition Diagram (User)

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticated : login/signup
    Authenticated --> Browsing : navigate to rent cars
    Browsing --> Booking : select car/date
    Booking --> Confirmed : submit
    Confirmed --> Dashboard : view bookings
    Dashboard --> Browsing : search more
```

## 4. Workflow for Admin

```mermaid
sequenceDiagram
    participant Admin
    participant UI
    participant Context
    participant Data

    Admin->>UI: Open /admin
    UI->>Context: fetch cars/bookings
    Context->>Data: read mockData
    Data-->>Context: return list
    Context-->>UI: render dashboard
    Admin->>UI: Add/Edit/Delete car
    UI->>Context: updateCars(action)
    Context->>Data: mutate mockData
    Data-->>Context: confirm
    Context-->>UI: refresh list
```

## 5. Gantt Chart Image

You may also insert a screenshot or external image of the Gantt chart generated in spreadsheets here if required.

---

Additional diagrams (e.g., class diagrams, network charts) can be added as needed.
