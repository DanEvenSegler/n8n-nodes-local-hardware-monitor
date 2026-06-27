# n8n-nodes-local-hardware-monitor

This is an n8n community node package containing two nodes that allow you to read local system and hardware information, and trigger workflows based on system metrics from the machine running n8n.

It is designed to run seamlessly on **Linux hosts, Docker containers, and Windows/macOS environments** without requiring `sudo` or root privileges. It utilizes the powerful `systeminformation` library and falls back gracefully to `null` values if specific system paths (like `/sys/` or `/proc/` directories) are blocked by security sandbox environments.

---

## Included Nodes

1. **Local Hardware Monitor:** An action node to retrieve on-demand details about system components, resource utilization, network statistics, and running services.
2. **Local Hardware Monitor Trigger:** A polling trigger node to alert and kick off workflows based on threshold triggers, state changes, or service failures.

---

## Installation

### For n8n Cloud or Self-Hosted (UI Installation)

1. Open your n8n instance and navigate to **Settings > Community Nodes**.
2. Click **Install a Node**.
3. Enter `n8n-nodes-local-hardware-monitor` in the npm Package Name field.
4. Agree to the terms and click **Install**.

---

## 1. Local Hardware Monitor (Action Node)

Allows you to query active hardware metrics on-demand in the middle of a workflow.

### Parameters

- **Resource to Retrieve:** Dropdown to determine what categories of hardware information should be queried:
  - *All Information:* Queries all metrics listed below.
  - *CPU:* Returns CPU specifications and load metrics.
  - *Memory:* Returns RAM & swap usage.
  - *Disk & Filesystem:* Returns storage layouts, filesystem sizes, and read/write I/O.
  - *Network:* Returns adapter details and network traffic data.
  - *OS & System:* Returns OS versions, motherboard info, BIOS, and uptime.
  - *Custom...:* Displays a multi-select checkbox list to pick only specific categories (keeping the returned JSON small).
- **Custom Resources** *(Shown when "Custom..." is selected)*:
  - Audio Devices, Baseboard Specs, Battery Specs, BIOS Specs, Block Devices, Bluetooth Specs, CPU Load, CPU Specs, CPU Temperature, Disk I/O, Docker Info, Filesystems, Graphics Specs (GPUs), Memory, Network Interfaces, Network Stats, OS, Physical Disks, Processes, System Specs, USB Controllers.
- **Include Detailed Process List** *(Boolean)*:
  - Toggle to `true` to return the detailed list of all active processes. **Note:** This can generate very large JSON payloads.
- **Include Detailed Docker Containers** *(Boolean)*:
  - Toggle to `true` to return a detailed status list for each running Docker container (requires Docker socket access).
- **Check Network Latency** *(Boolean)*:
  - Ping a target host (e.g. `8.8.8.8`) to check latency in milliseconds.
- **Check Web Site Responsiveness** *(Boolean)*:
  - Check the response time and HTTP status code of a custom website URL.
- **Monitor Specific OS Services** *(Boolean)*:
  - Monitor active/inactive states and memory usage of specific background services (e.g. `docker`, `nginx`).

---

## 2. Local Hardware Monitor Trigger (Trigger Node)

Periodically polls local hardware states and triggers the workflow if configured alerts are met. It supports a **State Transition** mode to prevent spamming your workflow, only firing once when the state enters an alert threshold.

### Trigger Event Types

- **CPU Load:** Trigger when total CPU usage percentage is above or below a threshold (e.g., CPU load > 90%).
- **CPU Temperature:** Trigger when core temperatures spike or drop below a threshold (e.g., CPU Temp > 80°C).
- **Memory Usage:** Trigger when RAM usage exceeds a threshold (e.g., Memory > 85%).
- **Disk Storage Space:** Trigger when a specific partition (e.g., `/` or `C:`) fills up (e.g., Disk Space > 90%).
- **OS Service State:** Trigger when a monitored service stops running, starts running, or experiences any state change (e.g., `nginx` stops running).
- **Docker Container State:** Trigger when a container starts, stops, or changes state (e.g., database container exits).
- **Network Latency:** Trigger if connection latency to a ping target exceeds a threshold (e.g., Latency > 150ms) or if connection fails completely.
- **Website Status Check:** Trigger if a website response code is not 200, if response time is too high (e.g. > 2000ms), or on any connection failure.

### Polling & Alert Parameters

- **Trigger Condition:**
  - *Only on State Transition:* Fires the workflow only once when the condition changes from fine to alert state.
  - *Always:* Fires the workflow on every check execution as long as the threshold/condition is met.
- **Polling Interval:** Standard n8n polling time configurations (e.g. check every minute, every hour, or custom cron).

---

## License

[MIT](LICENSE.md)
