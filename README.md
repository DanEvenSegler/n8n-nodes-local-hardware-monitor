# n8n-nodes-local-hardware-monitor

This is an n8n community node that allows you to read local system and hardware information from the machine running n8n. 

It is designed to run seamlessly on **Linux hosts, Docker containers, and Windows/macOS environments** without requiring `sudo` or root privileges. It utilizes the powerful `systeminformation` library and falls back gracefully to `null` values if specific system paths (like `/sys/` or `/proc/` directories) are blocked by security sandbox environments.

## Features

- **CPU Metrics:** Core counts, brand/model specifications, speed, current load percentages, load averages (1, 5, 15 min), and CPU temperature (if supported by hardware/OS).
- **Memory Stats:** RAM and Swap details, including total size, active memory, buffer/cache, and free bytes.
- **Disk & Filesystem:** Partition details, mount points, total/used/available space percentages, and real-time read/write disk I/O rates.
- **Network Interfaces:** Active network interfaces, MAC addresses, IP addresses (IPv4 & IPv6), operational states, and rx/tx transfer rates.
- **OS & System Details:** System manufacturer (model, serial), BIOS specifications, OS distro, kernel release, architecture, hostname, and system uptime.
- **Docker Integration:** Running/active container counts and detailed container status lists (requires mount access to `/var/run/docker.sock`).
- **Active Processes:** Overall counts of running, sleeping, and blocked processes, with an optional toggle to return a detailed process list.

---

## Installation

### For n8n Cloud or Self-Hosted (UI Installation)

1. Open your n8n instance and navigate to **Settings > Community Nodes**.
2. Click **Install a Node**.
3. Enter `n8n-nodes-local-hardware-monitor` in the npm Package Name field.
4. Agree to the terms and click **Install**.

---

## Usage & Node Parameters

Add the **Local Hardware Monitor** node to your workflow. The node is usable as a trigger step or middle action.

### Parameters

1. **Resource to Retrieve:** Dropdown to determine what categories of hardware information should be queried:
   - **All Information:** Queries all metrics listed below.
   - **CPU:** Returns CPU specifications and load metrics.
   - **Memory:** Returns RAM & swap usage.
   - **Disk & Filesystem:** Returns storage layouts, filesystem sizes, and read/write I/O.
   - **Network:** Returns adapter details and network traffic data.
   - **OS & System:** Returns OS versions, motherboard info, BIOS, and uptime.
   - **Custom...:** Displays a multi-select checkbox list to pick only specific categories (keeping the returned JSON small).

2. **Custom Resources** *(Shown when "Custom..." is selected)*:
   - Baseboard Specs, BIOS Specs, CPU Load, CPU Specs, CPU Temperature, Disk I/O, Docker Info, Filesystems, Memory, Network Interfaces, Network Stats, OS, Physical Disks, Processes, System Specs.

3. **Include Detailed Process List** *(Boolean)*:
   - By default (`false`), the node only returns process counts. Toggle to `true` to return the detailed processes list (e.g. pid, CPU %, memory %, command name). **Note:** This can generate very large JSON payloads.

4. **Include Detailed Docker Containers** *(Boolean)*:
   - By default (`false`), the node only returns counts of active containers. Toggle to `true` to return a detailed status list for each container. **Note:** Requires read access to the Docker socket.

---

## License

[MIT](LICENSE.md)
