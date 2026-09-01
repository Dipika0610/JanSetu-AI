# JanSetu AI — Citizen Grievance & Municipal Intelligence Platform

> **AI-Driven Civic Grievance Classification, Prioritization & Duplicate Detection System**

JanSetu bridges citizens and municipal authorities with real-time NLP classification, semantic duplicate clustering, dynamic priority calculation, and GIS hotspot tracking.

---

## 🌟 Key Features

### 1. Citizen Grievance Portal (`index.html`)
- **Multilingual AI Intake**: Voice & text input in English, Hindi (हिन्दी), Marathi (मराठी), and Hinglish.
- **Real-Time Category Prediction**: Automatically identifies department (Sanitation, Water Supply, Roads & Traffic, Electricity, Public Works).
- **Proactive Duplicate Detection Alert**: Detects similar issues within neighborhood radius in real-time, offering instant **"+1 Me Too"** upvoting to eliminate redundant tickets.
- **Photo Evidence Attachment**: Image upload with simulated visual anomaly verification.
- **5-Step Live Tracking Pipeline**: Real-time status tracker (`Submitted` → `Acknowledged` → `Assigned` → `In Progress` → `Resolved`).
- **Nearby Ward Incidents & Mini GIS Map**: Color-coded severity pins with community endorsement buttons.

### 2. Municipal Authority Dashboard (`authority.html`)
- **Executive Metrics Row**: Live counters for daily volume, high-priority open cases, SLA turnaround time, and officer-hours saved via automated deduplication.
- **Dynamic Priority-Ranked Queue**: Multi-factor severity equation incorporating urgency sentiment, sensitive zones (hospitals/schools), duplicate counts, and age escalation.
- **Duplicate Clusters Intelligence Engine**: Semantic similarity score bars (92%, 88%, etc.) with expandable child tickets and one-click **"Confirm Merge & Assign"** batch dispatch.
- **GIS Hotspot Map**: Interactive Mumbai ward heat map with tap-to-filter ward pins.
- **Field Officer Assignment & Action Drawer**: Bottom-sheet/modal interface for engineer assignment and citizen updates.

### 3. Authentication & Registration Hub (`auth.html`)
- **Citizen 3-Step Wizard**: Identity & Mobile → 4-Digit OTP Verification → Ward & Language calibration.
- **Municipal Staff Access & Provisioning**: Officer email/ID sign-in, designation, department routing, and admin role provisioning (*Field officer*, *Ward supervisor*, *Admin*).
- **1-Click Demo Accounts**: Instant quick-start testing for both Citizen and Ward Officer roles.

---

## 🎨 Design System
- **Typography**: Google Fonts `Fraunces` (warm editorial serif) + `IBM Plex Sans` (civic clarity).
- **Palette**: Warm editorial tones (`--paper: #EEF0EA`, `--card: #FBFBF7`, `--blue: #24425F`, `--brick: #A8402A`, `--ochre: #A97A22`, `--moss: #4C6E4F`).
- **Responsiveness**: Fully responsive across mobile smartphones, tablets, and wide desktop screens.

---

## 🚀 Getting Started

No build step or complex dependencies required. Simply serve the files locally:

### Option 1: Python HTTP Server
```bash
python -m http.server 3000
```

### Option 2: Node.js Serve / Live Server
```bash
npx serve .
```

Open in your browser:
- **Authentication Hub**: [http://localhost:3000/auth.html](http://localhost:3000/auth.html)
- **Citizen Portal**: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Authority Dashboard**: [http://localhost:3000/authority.html](http://localhost:3000/authority.html)

---

## 📁 Project Structure

```
JanSetu AI/
├── index.html              # Citizen Portal interface
├── authority.html          # Municipal Authority Dashboard
├── auth.html               # Registration & Login Hub
├── README.md               # Documentation
├── .gitignore              # Git ignore rules
├── css/
│   ├── design-system.css   # Shared color tokens, typography & base utilities
│   ├── citizen.css         # Citizen portal mobile & desktop styling
│   ├── authority.css       # Authority command center & drawer styling
│   └── auth.css            # Registration wizard & login styling
└── js/
    ├── mockData.js         # Mumbai ward datasets & seed complaints
    ├── aiEngine.js         # Multilingual NLP, priority & similarity algorithms
    ├── storage.js          # Shared reactive state & session management
    ├── citizen.js          # Citizen portal interactions & live classifier
    ├── authority.js        # Authority queue, cluster merging & GIS map
    └── auth.js             # OTP countdown, wizard steps & auth routing
```

---

## 📄 License
MIT License. Built for smart civic governance.
