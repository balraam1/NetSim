# NetSim Frontend

> **Real-time Enterprise Virtual Room Collaboration Platform**  
> A modern React.js application with Socket.IO integration for seamless real-time communication, private channels, and network topology visualization.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![Node](https://img.shields.io/badge/Node-18.x-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Component Documentation](#component-documentation)
- [Socket.IO Events](#socketio-events)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

NetSim is a **production-ready real-time collaboration platform** built with modern web technologies. It enables teams to create virtual rooms, communicate in real-time, establish private peer-to-peer channels, and visualize network topology graphs.

### Key Capabilities

✅ **Real-Time Communication** - Sub-100ms latency messaging  
✅ **Private Channels** - Direct 1-to-1 encrypted communications  
✅ **Network Visualization** - Host can view connection topology  
✅ **Role-Based Access** - Host, Admin, Member hierarchies  
✅ **Persistent Logging** - Message history with audit trails  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **Auto-Reconnection** - Seamless connectivity management  

---

## ✨ Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Room Management** | Create/Join rooms with unique IDs | ✅ Complete |
| **Public Chat** | Real-time messaging in rooms | ✅ Complete |
| **User Presence** | Real-time user list with roles | ✅ Complete |
| **Private Channels** | 1-to-1 encrypted communications | ✅ Complete |
| **Network Topology** | Visual graph of user connections (Host) | ✅ Complete |
| **Role-Based UI** | Different views for Host/Admin/Member | ✅ Complete |
| **Authentication** | Socket-based user validation | ✅ Complete |
| **Error Handling** | Comprehensive error messages | ✅ Complete |

### Future Enhancements

- [ ] WebRTC voice/video integration
- [ ] End-to-end encryption (E2EE)
- [ ] File sharing & transfer
- [ ] Screen sharing capabilities
- [ ] Message search & history
- [ ] User profiles & avatars
- [ ] Notification system
- [ ] Dark mode theme

---

## 🛠 Tech Stack

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **UI Framework** | React.js | 18.x | Component-based UI |
| **Routing** | React Router DOM | 6.x | Client-side routing |
| **Real-Time** | Socket.IO Client | 4.x | WebSocket communication |
| **Styling** | CSS3 | - | Component styling |
| **Build Tool** | Vite | 5.x | Fast development server |
| **Package Manager** | npm | 10.x | Dependency management |

### Development Tools

- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Vite** - Development & production builds
- **Node.js** - Runtime environment

---

## 📁 Folder Structure

```

frontend/
│
├── src/
│ │
│ ├── pages/ # Page components
│ │ ├── LandingPage.jsx # Hero landing page
│ │ ├── HomePage.jsx # Room creation/join
│ │ └── RoomPage.jsx # Main collaboration space
│ │
│ ├── components/
│ │ ├── ChatWindow.jsx # Public chat display
│ │ ├── ChatInput.jsx # Message input box
│ │ ├── UsersList.jsx # Active users sidebar
│ │ │
│ │ └── features/ # Feature modules (NEW)
│ │ ├── PrivateChannels/
│ │ │ ├── PrivateChannelManager.jsx
│ │ │ ├── PrivateChannelSidebar.jsx
│ │ │ ├── PrivateChat.jsx
│ │ │ └── PrivateChannels.css
│ │ │
│ │ └── NetworkTopology/
│ │ ├── TopologyGraph.jsx
│ │ ├── TopologyCanvas.jsx
│ │ └── NetworkTopology.css
│ │
│ ├── styles/ # Global & component styles
│ │ ├── Components.css # Component styles
│ │ ├── LandingPage.css # Landing page styles
│ │ ├── HomePage.css # Home page styles
│ │ ├── RoomPage.css # Room page styles
│ │ │
│ │ └── features/ # Feature styles (NEW)
│ │ ├── PrivateChannels.css
│ │ └── NetworkTopology.css
│ │
│ ├── hooks/ # React custom hooks (NEW)
│ │ ├── usePrivateChannels.js # Private channel state management
│ │ └── useTopology.js # Topology graph state management
│ │
│ ├── socket.js # Socket.IO configuration
│ ├── App.jsx # Root component
│ └── index.jsx # Entry point
│
├── public/
│ ├── index.html # Main HTML file
│ └── favicon.ico # App icon
│
├── tests/ # Test files
│ ├── unit/
│ │ └── components/
│ └── integration/
│
├── docs/ # Documentation
│ ├── ARCHITECTURE.md
│ ├── SOCKET_EVENTS.md
│ └── DEPLOYMENT.md
│
├── .env.example # Environment template
├── .gitignore # Git ignore rules
├── .eslintrc.json # ESLint config
├── .prettierrc # Prettier config
├── package.json # Dependencies & scripts
├── package-lock.json # Dependency lock
├── vite.config.js # Vite configuration

```


### Folder Descriptions

#### **`src/pages/`** - Page-Level Components
Routes and main page layouts. Each represents a URL path.

#### **`src/components/`** - Reusable Components
- **Core:** ChatWindow, ChatInput, UsersList
- **Features:** Isolated feature modules (PrivateChannels, NetworkTopology)

#### **`src/styles/`** - CSS Stylesheets
- **Root styles:** Common styles for pages
- **Feature styles:** Isolated styles for feature modules

#### **`src/hooks/`** - Custom React Hooks
Encapsulates Socket.IO event logic and state management for features.

#### **`src/socket.js`** - Socket Configuration
Central Socket.IO client initialization and configuration.

---

## 🚀 Installation

### Prerequisites

