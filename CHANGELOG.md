# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-06-27

### Added
- **Trigger Node (`LocalHardwareMonitorTrigger`):** Added a new polling trigger node to alert and start workflows based on:
  - CPU load thresholds.
  - CPU core temperature spikes.
  - RAM usage percentage limits.
  - Disk storage utilization on specific partition paths.
  - OS service status changes (stops running, starts running, any state change).
  - Docker container state modifications (starts, stops, state changes).
  - Network latency checks (ping responses above thresholds or complete fail).
  - Web site status checking (response codes != 200 or response speed timeouts).
- **Transition Alarms:** Implemented a state-transition trigger system (`onTransition` vs `always`) to prevent notification spamming and only trigger when state flips into an alert zone.

## [1.1.0] - 2026-06-27

### Added
- **Extended Hardware Info:** Support for GPU (Graphics controllers), audio devices, physical block devices, USB controllers, Bluetooth interfaces, and battery status.
- **Service & Network Monitoring:** Added network ping latency checks, website responsiveness checks, and background service status monitoring (e.g. docker, ssh, nginx).

## [1.0.0] - 2026-06-27

### Added
- **Initial Release** of the Local Hardware Monitor community node for n8n.
- **System Specifications:** CPU specs, load averages, memory (RAM and swap) stats, physical disk drive layouts, and filesystem usage.
- **Docker & Processes:** Process counts and running Docker container counts.
- **Visuals:** Tailored light and dark theme node icons (SVG format).
- **Robustness:** Added try/catch fallback queries so that low-level components degrade gracefully without failing execution on restricted or rootless containers.
