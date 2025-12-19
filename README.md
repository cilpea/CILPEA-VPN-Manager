# CILPEA VPN Manager

![CILPEA VPN Dashboard](https://img.shields.io/badge/Version-1.0.4-emerald)
![License](https://img.shields.io/badge/License-MIT-blue)
![Security](https://img.shields.io/badge/Security-Gemini--Powered-orange)

CILPEA VPN Manager is a world-class, high-fidelity dashboard designed for secure VPN orchestration. It provides a modern interface for managing OpenVPN tunnels, monitoring real-time network traffic, and performing automated security audits using the Gemini AI API.

## 🚀 Key Features

### 🛡️ Gemini-Powered Security Audits
Stay ahead of threats with our integrated CVE (Common Vulnerabilities and Exposures) scanner. Using the `gemini-3-flash-preview` model, CILPEA analyzes your system configuration to identify potential vulnerabilities and provides actionable remediation steps.

### 📊 Real-Time Traffic Analytics
Visualize your network throughput with precision. Our custom-engineered `TrafficChart` (built on Recharts) features:
- **SVG Glow Filters**: Dynamic intensity based on data volume.
- **Pulse Indicators**: Visual confirmation of active packet transmission.
- **Dual Stream Monitoring**: Simultaneous tracking of Upload and Download speeds.

### 🖥️ Professional System Terminal
Monitor low-level system events through a dedicated, sanitized logging interface. Get real-time feedback on handshakes, key verification, and routing table updates.

### 🔐 Advanced Connection Management
- **AES-256-GCM Encryption**: High-performance, military-grade security.
- **Auto-Reconnect**: Intelligent tunnel recovery to prevent data leaks.
- **Virtual IP Tracking**: Instant visibility of your secure endpoint.

## 🛠️ Tech Stack

- **Frontend**: React 19 (High-performance UI)
- **Styling**: Tailwind CSS (Utility-first aesthetic)
- **Intelligence**: Google Gemini API (`@google/genai`)
- **Data Visualization**: Recharts (Responsive SVG charts)
- **Icons**: Lucide React

## 📦 Getting Started

The dashboard is designed as a standalone frontend application that interfaces with local VPN services.

1. **Prerequisites**: Ensure you have an active API Key for the Google Gemini API provided in your environment.
2. **Launch**: Open `index.html` in a modern browser.
3. **Audit**: Run a "Security Audit" from the left panel to verify your local configuration against the latest CVE database.

## 🔒 Security & Privacy

CILPEA prioritizes your privacy:
- **Zero-Logging Policy**: All terminal logs are ephemeral and stored only in memory.
- **Local Orchestration**: Control commands are intended for local system execution.
- **Sanitized Outputs**: Sensitive keys and credentials are filtered from UI logs.

For more details on our vulnerability disclosure program, see [SECURITY.md](./SECURITY.md).

---

*Developed with ❤️ by the CILPEA Security Team. , Redevbionet security Team*
