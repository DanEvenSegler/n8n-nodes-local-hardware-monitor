# Changelog

All notable changes to this project will be documented in this file.

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
