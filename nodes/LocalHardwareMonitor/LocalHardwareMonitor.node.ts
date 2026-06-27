import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import si from 'systeminformation';

export class LocalHardwareMonitor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Local Hardware Monitor',
		name: 'localHardwareMonitor',
		icon: {
			light: 'file:localHardwareMonitor.svg',
			dark: 'file:localHardwareMonitor.dark.svg',
		},
		group: ['input'],
		version: 1,
		description: 'Retrieve local system and hardware information (CPU, Memory, Disk, OS, Network)',
		subtitle: '={{$parameter["resource"]}}',
		defaults: {
			name: 'Local Hardware Monitor',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource to Retrieve',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'All Information',
						value: 'all',
						description: 'Retrieve all available hardware/system information',
					},
					{
						name: 'CPU',
						value: 'cpu',
						description: 'Retrieve CPU specifications, core metrics, and current load',
					},
					{
						name: 'Custom...',
						value: 'custom',
						description: 'Select specific categories of hardware resources to query',
					},
					{
						name: 'Disk & Filesystem',
						value: 'disk',
						description: 'Retrieve physical disk specs, storage usage, and disk I/O stats',
					},
					{
						name: 'Memory',
						value: 'memory',
						description: 'Retrieve RAM and Swap size and usage details',
					},
					{
						name: 'Network',
						value: 'network',
						description: 'Retrieve active network interfaces, IP addresses, and network statistics',
					},
					{
						name: 'OS & System',
						value: 'osSystem',
						description: 'Retrieve OS distro, kernel, uptime, BIOS, and motherboard details',
					},
				],
				default: 'all',
				description: 'Select which hardware resource categories to query',
			},
			{
				displayName: 'Custom Resources',
				name: 'customResources',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: [
							'custom',
						],
					},
				},
				options: [
					{
						name: 'Audio Devices',
						value: 'audio',
						description: 'Retrieve connected audio hardware and inputs/outputs',
					},
					{
						name: 'Baseboard (Motherboard) Specs',
						value: 'baseboard',
						description: 'Retrieve motherboard manufacturer, model, and serial',
					},
					{
						name: 'Battery Specs',
						value: 'battery',
						description: 'Retrieve battery models, capacity, and current charge levels',
					},
					{
						name: 'BIOS Specs',
						value: 'bios',
						description: 'Retrieve BIOS vendor, version, and release date',
					},
					{
						name: 'Block Devices',
						value: 'blockDevices',
						description: 'Retrieve low-level block storage devices and partitioning',
					},
					{
						name: 'Bluetooth Specs',
						value: 'bluetooth',
						description: 'Retrieve Bluetooth controllers and paired devices',
					},
					{
						name: 'CPU Load',
						value: 'cpuLoad',
						description: 'Retrieve current CPU load percentages and averages',
					},
					{
						name: 'CPU Specs',
						value: 'cpu',
						description: 'Retrieve CPU brand, speed, cores, and physical cores',
					},
					{
						name: 'CPU Temperature',
						value: 'cpuTemperature',
						description: 'Retrieve CPU temperature (if supported/available)',
					},
					{
						name: 'Disk I/O Stats',
						value: 'diskIO',
						description: 'Retrieve disk read/write statistics',
					},
					{
						name: 'Docker Info',
						value: 'docker',
						description: 'Retrieve Docker daemon details and running container count (requires Docker socket access)',
					},
					{
						name: 'Filesystem Storage Usage',
						value: 'fsSize',
						description: 'Retrieve mounted filesystems and space usage',
					},
					{
						name: 'Graphics Specs (GPUs)',
						value: 'graphics',
						description: 'Retrieve GPU models, vendors, clock speeds, and memory',
					},
					{
						name: 'Memory (RAM & Swap)',
						value: 'memory',
						description: 'Retrieve RAM and Swap size and usage details',
					},
					{
						name: 'Network Interfaces',
						value: 'networkInterfaces',
						description: 'Retrieve active network interfaces, IP addresses, etc',
					},
					{
						name: 'Network Statistics',
						value: 'networkStats',
						description: 'Retrieve data transfer (Rx/Tx) stats',
					},
					{
						name: 'Operating System & Uptime',
						value: 'os',
						description: 'Retrieve OS distro, release, kernel, architecture, hostname, and uptime',
					},
					{
						name: 'Physical Disks Layout',
						value: 'diskLayout',
						description: 'Retrieve information about physical disk drives',
					},
					{
						name: 'Processes Summary',
						value: 'processes',
						description: 'Retrieve running, sleeping, and blocked process counts',
					},
					{
						name: 'System Specs',
						value: 'system',
						description: 'Retrieve manufacturer, model, serial, UUID, etc',
					},
					{
						name: 'USB Controllers',
						value: 'usb',
						description: 'Retrieve connected USB hubs and devices',
					},
				],
				default: [],
				description: 'Select which specific hardware components to query',
			},
			{
				displayName: 'Include Detailed Process List',
				name: 'includeDetailedProcesses',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'all',
							'custom',
						],
					},
				},
				default: false,
				description: 'Whether to include the full list of all processes in the Processes data (can be very large)',
			},
			{
				displayName: 'Include Detailed Docker Containers',
				name: 'includeDetailedDocker',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'all',
							'custom',
						],
					},
				},
				default: false,
				description: 'Whether to include details of each individual Docker container (requires Docker socket access)',
			},
			{
				displayName: 'Check Network Latency',
				name: 'checkLatency',
				type: 'boolean',
				default: false,
				description: 'Whether to check network response latency to a target host',
			},
			{
				displayName: 'Latency Host',
				name: 'latencyHost',
				type: 'string',
				displayOptions: {
					show: {
						checkLatency: [
							true,
						],
					},
				},
				default: '8.8.8.8',
				description: 'The host domain or IP to check response time (defaults to 8.8.8.8)',
			},
			{
				displayName: 'Check Web Site Responsiveness',
				name: 'checkSite',
				type: 'boolean',
				default: false,
				description: 'Whether to check the response time and status code of a website',
			},
			{
				displayName: 'Site URL',
				name: 'siteUrl',
				type: 'string',
				displayOptions: {
					show: {
						checkSite: [
							true,
						],
					},
				},
				default: 'https://n8n.io',
				description: 'The HTTP/HTTPS URL of the site to check',
			},
			{
				displayName: 'Monitor Specific OS Services',
				name: 'monitorServices',
				type: 'boolean',
				default: false,
				description: 'Whether to monitor specific background system services',
			},
			{
				displayName: 'Services List',
				name: 'servicesList',
				type: 'string',
				displayOptions: {
					show: {
						monitorServices: [
							true,
						],
					},
				},
				default: '',
				placeholder: 'docker, ssh, nginx',
				description: 'A comma-separated list of background service names to check status',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const includeDetailedProcesses = this.getNodeParameter('includeDetailedProcesses', i, false) as boolean;
				const includeDetailedDocker = this.getNodeParameter('includeDetailedDocker', i, false) as boolean;
				const checkLatency = this.getNodeParameter('checkLatency', i, false) as boolean;
				const checkSite = this.getNodeParameter('checkSite', i, false) as boolean;
				const monitorServices = this.getNodeParameter('monitorServices', i, false) as boolean;

				const result: IDataObject = {};

				// Helper to determine if we should fetch a resource category
				const shouldFetch = (name: string): boolean => {
					if (resource === 'all') return true;
					if (resource === 'custom') {
						const customList = this.getNodeParameter('customResources', i, []) as string[];
						return customList.includes(name);
					}
					if (resource === 'cpu' && ['cpu', 'cpuLoad', 'cpuTemperature'].includes(name)) return true;
					if (resource === 'memory' && name === 'memory') return true;
					if (resource === 'disk' && ['diskLayout', 'fsSize', 'diskIO', 'blockDevices'].includes(name)) return true;
					if (resource === 'network' && ['networkInterfaces', 'networkStats'].includes(name)) return true;
					if (resource === 'osSystem' && ['system', 'bios', 'baseboard', 'os', 'battery', 'graphics', 'usb', 'bluetooth', 'audio'].includes(name)) return true;
					return false;
				};

				const promises: Promise<void>[] = [];

				if (shouldFetch('system')) {
					promises.push(si.system().then(data => { result.system = data; }).catch(() => { result.system = null; }));
				}
				if (shouldFetch('bios')) {
					promises.push(si.bios().then(data => { result.bios = data; }).catch(() => { result.bios = null; }));
				}
				if (shouldFetch('baseboard')) {
					promises.push(si.baseboard().then(data => { result.baseboard = data; }).catch(() => { result.baseboard = null; }));
				}
				if (shouldFetch('os')) {
					promises.push(si.osInfo().then(data => { result.os = data; }).catch(() => { result.os = null; }));
					try {
						result.time = si.time();
					} catch {
						result.time = null;
					}
				}
				if (shouldFetch('cpu')) {
					promises.push(si.cpu().then(data => { result.cpu = data; }).catch(() => { result.cpu = null; }));
				}
				if (shouldFetch('cpuLoad')) {
					promises.push(si.currentLoad().then(data => { result.cpuLoad = data; }).catch(() => { result.cpuLoad = null; }));
				}
				if (shouldFetch('cpuTemperature')) {
					promises.push(si.cpuTemperature().then(data => { result.cpuTemperature = data; }).catch(() => { result.cpuTemperature = null; }));
				}
				if (shouldFetch('memory')) {
					promises.push(si.mem().then(data => { result.memory = data; }).catch(() => { result.memory = null; }));
				}
				if (shouldFetch('diskLayout')) {
					promises.push(si.diskLayout().then(data => { result.diskLayout = data; }).catch(() => { result.diskLayout = null; }));
				}
				if (shouldFetch('fsSize')) {
					promises.push(si.fsSize().then(data => { result.fsSize = data; }).catch(() => { result.fsSize = null; }));
				}
				if (shouldFetch('diskIO')) {
					promises.push(si.disksIO().then(data => { result.diskIO = data; }).catch(() => { result.diskIO = null; }));
				}
				if (shouldFetch('networkInterfaces')) {
					promises.push(si.networkInterfaces().then(data => { result.networkInterfaces = data; }).catch(() => { result.networkInterfaces = null; }));
				}
				if (shouldFetch('networkStats')) {
					promises.push(si.networkStats().then(data => { result.networkStats = data; }).catch(() => { result.networkStats = null; }));
				}
				if (shouldFetch('audio')) {
					promises.push(si.audio().then(data => { result.audio = data; }).catch(() => { result.audio = null; }));
				}
				if (shouldFetch('battery')) {
					promises.push(si.battery().then(data => { result.battery = data; }).catch(() => { result.battery = null; }));
				}
				if (shouldFetch('blockDevices')) {
					promises.push(si.blockDevices().then(data => { result.blockDevices = data; }).catch(() => { result.blockDevices = null; }));
				}
				if (shouldFetch('bluetooth')) {
					promises.push(si.bluetoothDevices().then(data => { result.bluetooth = data; }).catch(() => { result.bluetooth = null; }));
				}
				if (shouldFetch('graphics')) {
					promises.push(si.graphics().then(data => { result.graphics = data; }).catch(() => { result.graphics = null; }));
				}
				if (shouldFetch('usb')) {
					promises.push(si.usb().then(data => { result.usb = data; }).catch(() => { result.usb = null; }));
				}

				if (shouldFetch('docker') || (resource === 'all')) {
					promises.push(
						Promise.all([
							si.dockerInfo().catch(() => null),
							includeDetailedDocker ? si.dockerContainers(true).catch(() => null) : Promise.resolve(null),
						]).then(([info, containers]) => {
							if (info || containers) {
								result.docker = {
									info,
									containers: includeDetailedDocker ? containers : undefined,
									activeContainersCount: info?.containers || 0,
									runningContainersCount: info?.containersRunning || 0,
								};
							}
						})
					);
				}
				if (shouldFetch('processes')) {
					promises.push(
						si.processes().then(data => {
							if (!includeDetailedProcesses) {
								const summary = { ...data } as Partial<si.Systeminformation.ProcessesData>;
								delete summary.list;
								result.processes = summary;
							} else {
								result.processes = data;
							}
						}).catch(() => { result.processes = null; })
					);
				}

				// Network & Services check parameters (run only if explicit boolean parameter is true to avoid unnecessary pings/delays)
				if (checkLatency) {
					const host = this.getNodeParameter('latencyHost', i, '8.8.8.8') as string;
					promises.push(
						si.inetLatency(host)
							.then(data => { result.latency = { host, ms: data }; })
							.catch(() => { result.latency = { host, ms: -1 }; })
					);
				}
				if (checkSite) {
					const url = this.getNodeParameter('siteUrl', i, 'https://n8n.io') as string;
					promises.push(
						si.inetChecksite(url)
							.then(data => { result.siteCheck = data; })
							.catch(() => { result.siteCheck = null; })
					);
				}
				if (monitorServices) {
					const services = this.getNodeParameter('servicesList', i, '') as string;
					if (services.trim()) {
						promises.push(
							si.services(services)
								.then(data => { result.services = data; })
								.catch(() => { result.services = null; })
						);
					}
				}

				await Promise.all(promises);

				returnData.push({
					json: result,
					pairedItem: i,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: i,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}
