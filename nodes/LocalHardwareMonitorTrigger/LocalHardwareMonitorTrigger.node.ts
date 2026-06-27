import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import si from 'systeminformation';

export class LocalHardwareMonitorTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Local Hardware Monitor Trigger',
		name: 'localHardwareMonitorTrigger',
		icon: {
			light: 'file:localHardwareMonitor.svg',
			dark: 'file:localHardwareMonitor.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		description: 'Trigger workflows based on local system metrics, hardware thresholds, network latency, or service failures',
		subtitle: '={{$parameter["triggerType"]}}',
		defaults: {
			name: 'Local Hardware Monitor Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Trigger Event Type',
				name: 'triggerType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'CPU Load',
						value: 'cpuLoad',
						description: 'Trigger based on CPU percentage load threshold',
					},
					{
						name: 'CPU Temperature',
						value: 'cpuTemp',
						description: 'Trigger based on CPU core temperature threshold',
					},
					{
						name: 'Disk Storage Space',
						value: 'diskUsage',
						description: 'Trigger based on filesystems space utilization threshold',
					},
					{
						name: 'Docker Container State',
						value: 'dockerStatus',
						description: 'Trigger based on Docker container states',
					},
					{
						name: 'Memory Usage',
						value: 'memoryUsage',
						description: 'Trigger based on RAM usage percentage threshold',
					},
					{
						name: 'Network Latency',
						value: 'networkLatency',
						description: 'Trigger based on connection response latency to a target host',
					},
					{
						name: 'OS Service State',
						value: 'serviceStatus',
						description: 'Trigger based on background operating system services',
					},
					{
						name: 'Website Status Check',
						value: 'websiteStatus',
						description: 'Trigger based on response codes or loading speed of a website',
					},
				],
				default: 'cpuLoad',
				description: 'The type of system event or hardware metric to trigger on',
			},
			{
				displayName: 'Trigger Condition',
				name: 'triggerMode',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Always',
						value: 'always',
						description: 'Trigger on every check execution as long as the alert condition is met',
					},
					{
						name: 'Only on State Transition',
						value: 'onTransition',
						description: 'Trigger only when entering the alert state (e.g. from fine to alert)',
					},
				],
				default: 'onTransition',
				description: 'Choose whether to trigger continuously or only on transition state changes',
			},
			// CPU Temp Configuration
			{
				displayName: 'Temperature Threshold (°C)',
				name: 'tempThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerType: [
							'cpuTemp',
						],
					},
				},
				default: 80,
				description: 'CPU core temperature threshold to check',
			},
			{
				displayName: 'Comparison Type',
				name: 'tempComparison',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'cpuTemp',
						],
					},
				},
				options: [
					{
						name: 'Above Threshold',
						value: 'above',
					},
					{
						name: 'Below Threshold',
						value: 'below',
					},
				],
				default: 'above',
			},
			// CPU Load Configuration
			{
				displayName: 'Load Threshold (%)',
				name: 'loadThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerType: [
							'cpuLoad',
						],
					},
				},
				default: 90,
				description: 'CPU load percentage threshold to check',
			},
			{
				displayName: 'Comparison Type',
				name: 'loadComparison',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'cpuLoad',
						],
					},
				},
				options: [
					{
						name: 'Above Threshold',
						value: 'above',
					},
					{
						name: 'Below Threshold',
						value: 'below',
					},
				],
				default: 'above',
			},
			// Memory Usage Configuration
			{
				displayName: 'Used Memory Threshold (%)',
				name: 'memThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerType: [
							'memoryUsage',
						],
					},
				},
				default: 85,
				description: 'Memory used percentage threshold to check',
			},
			{
				displayName: 'Comparison Type',
				name: 'memComparison',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'memoryUsage',
						],
					},
				},
				options: [
					{
						name: 'Above Threshold',
						value: 'above',
					},
					{
						name: 'Below Threshold',
						value: 'below',
					},
				],
				default: 'above',
			},
			// Disk Usage Configuration
			{
				displayName: 'Disk Partition Path',
				name: 'diskPath',
				type: 'string',
				displayOptions: {
					show: {
						triggerType: [
							'diskUsage',
						],
					},
				},
				default: '/',
				description: 'The mount path or drive identifier to check (e.g. / on Linux, C: on Windows)',
			},
			{
				displayName: 'Storage Utilization Threshold (%)',
				name: 'diskThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerType: [
							'diskUsage',
						],
					},
				},
				default: 90,
				description: 'Disk space used percentage threshold to check',
			},
			{
				displayName: 'Comparison Type',
				name: 'diskComparison',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'diskUsage',
						],
					},
				},
				options: [
					{
						name: 'Above Threshold',
						value: 'above',
					},
					{
						name: 'Below Threshold',
						value: 'below',
					},
				],
				default: 'above',
			},
			// Docker Container Configuration
			{
				displayName: 'Container Name or ID',
				name: 'containerName',
				type: 'string',
				displayOptions: {
					show: {
						triggerType: [
							'dockerStatus',
						],
					},
				},
				default: '',
				placeholder: 'n8n-container',
				description: 'Enter the exact container name or ID to monitor. Leave empty to trigger on any container.',
			},
			{
				displayName: 'Trigger Event',
				name: 'dockerTriggerEvent',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'dockerStatus',
						],
					},
				},
				options: [
					{
						name: 'Container Starts Running',
						value: 'containerStarts',
					},
					{
						name: 'Container Stops Running',
						value: 'containerStops',
					},
					{
						name: 'On Any State Change',
						value: 'containerStateChanges',
					},
				],
				default: 'containerStops',
				description: 'Determine what container state change triggers the workflow',
			},
			// OS Service Configuration
			{
				displayName: 'Service Name',
				name: 'serviceName',
				type: 'string',
				displayOptions: {
					show: {
						triggerType: [
							'serviceStatus',
						],
					},
				},
				default: '',
				placeholder: 'nginx',
				description: 'The background service name to check status (e.g. docker, nginx, sshd)',
			},
			{
				displayName: 'Trigger Event',
				name: 'serviceTriggerEvent',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'serviceStatus',
						],
					},
				},
				options: [
					{
						name: 'On Any State Change',
						value: 'stateChanges',
					},
					{
						name: 'Service Starts Running',
						value: 'startsRunning',
					},
					{
						name: 'Service Stops Running',
						value: 'stopsRunning',
					},
				],
				default: 'stopsRunning',
				description: 'Determine what service state change triggers the workflow',
			},
			// Network Latency Configuration
			{
				displayName: 'Latency Target Host',
				name: 'latencyHost',
				type: 'string',
				displayOptions: {
					show: {
						triggerType: [
							'networkLatency',
						],
					},
				},
				default: '8.8.8.8',
				description: 'The host domain or IP to ping',
			},
			{
				displayName: 'Trigger Condition',
				name: 'latencyComparison',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'networkLatency',
						],
					},
				},
				options: [
					{
						name: 'Connection Fails (Ping Fails)',
						value: 'fails',
					},
					{
						name: 'Latency Exceeds Limit',
						value: 'above',
					},
				],
				default: 'fails',
			},
			{
				displayName: 'Latency Limit (Ms)',
				name: 'latencyThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerType: [
							'networkLatency',
						],
						latencyComparison: [
							'above',
						],
					},
				},
				default: 150,
				description: 'Latency response time threshold in milliseconds',
			},
			// Website Responsiveness Configuration
			{
				displayName: 'Website URL',
				name: 'siteUrl',
				type: 'string',
				displayOptions: {
					show: {
						triggerType: [
							'websiteStatus',
						],
					},
				},
				default: 'https://n8n.io',
				description: 'The HTTP/HTTPS URL of the website to check',
			},
			{
				displayName: 'Trigger Event',
				name: 'websiteTriggerEvent',
				type: 'options',
				displayOptions: {
					show: {
						triggerType: [
							'websiteStatus',
						],
					},
				},
				options: [
					{
						name: 'Any Failure (Status Not 200 or Connection Failed)',
						value: 'anyFailure',
					},
					{
						name: 'Response Code Is Not 200',
						value: 'statusNot200',
					},
					{
						name: 'Response Time Exceeds Limit',
						value: 'responseTimeExceeds',
					},
				],
				default: 'anyFailure',
				description: 'Determine what website check result triggers the workflow',
			},
			{
				displayName: 'Response Time Limit (Ms)',
				name: 'responseTimeThreshold',
				type: 'number',
				displayOptions: {
					show: {
						triggerType: [
							'websiteStatus',
						],
						websiteTriggerEvent: [
							'responseTimeExceeds',
						],
					},
				},
				default: 2000,
				description: 'Response loading speed threshold in milliseconds',
			},
		],
		usableAsTool: true,
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const triggerType = this.getNodeParameter('triggerType') as string;
		const triggerMode = this.getNodeParameter('triggerMode', 'onTransition') as string;
		const staticData = this.getWorkflowStaticData('node');

		let conditionMet = false;
		let outputData: IDataObject = {};

		try {
			if (triggerType === 'cpuTemp') {
				const tempThreshold = this.getNodeParameter('tempThreshold') as number;
				const tempComparison = this.getNodeParameter('tempComparison') as string;
				const data = await si.cpuTemperature();
				const currentTemp = data.main;

				if (currentTemp !== -1) {
					conditionMet = tempComparison === 'above' ? currentTemp > tempThreshold : currentTemp < tempThreshold;
					outputData = { cpuTemp: currentTemp, limit: tempThreshold, comparison: tempComparison, conditionMet };
				} else {
					return null;
				}
			}
			else if (triggerType === 'cpuLoad') {
				const loadThreshold = this.getNodeParameter('loadThreshold') as number;
				const loadComparison = this.getNodeParameter('loadComparison') as string;
				const data = await si.currentLoad();
				const currentLoad = data.currentLoad;

				conditionMet = loadComparison === 'above' ? currentLoad > loadThreshold : currentLoad < loadThreshold;
				outputData = { cpuLoad: currentLoad, limit: loadThreshold, comparison: loadComparison, conditionMet };
			}
			else if (triggerType === 'memoryUsage') {
				const memThreshold = this.getNodeParameter('memThreshold') as number;
				const memComparison = this.getNodeParameter('memComparison') as string;
				const data = await si.mem();
				const usedPercent = (data.active / data.total) * 100;

				conditionMet = memComparison === 'above' ? usedPercent > memThreshold : usedPercent < memThreshold;
				outputData = { memoryUsedPercent: usedPercent, totalBytes: data.total, activeBytes: data.active, limit: memThreshold, comparison: memComparison, conditionMet };
			}
			else if (triggerType === 'diskUsage') {
				const diskPath = this.getNodeParameter('diskPath') as string;
				const diskThreshold = this.getNodeParameter('diskThreshold') as number;
				const diskComparison = this.getNodeParameter('diskComparison') as string;
				const partitions = await si.fsSize();

				let matchingPartition = partitions.find(p => p.mount === diskPath || p.fs.toLowerCase() === diskPath.toLowerCase());
				if (!matchingPartition && partitions.length > 0) {
					matchingPartition = partitions[0];
				}

				if (matchingPartition) {
					const usedPercent = matchingPartition.use;
					conditionMet = diskComparison === 'above' ? usedPercent > diskThreshold : usedPercent < diskThreshold;
					outputData = { diskPath: matchingPartition.mount, usedPercent, limit: diskThreshold, comparison: diskComparison, conditionMet };
				} else {
					return null;
				}
			}
			else if (triggerType === 'serviceStatus') {
				const serviceName = this.getNodeParameter('serviceName') as string;
				const serviceTriggerEvent = this.getNodeParameter('serviceTriggerEvent') as string;
				const services = await si.services(serviceName);

				if (services && services.length > 0) {
					const service = services[0];
					const currentRunning = service.running;
					const lastRunning = staticData.lastServiceRunningState as boolean | undefined;

					if (serviceTriggerEvent === 'stopsRunning') {
						conditionMet = !currentRunning;
					} else if (serviceTriggerEvent === 'startsRunning') {
						conditionMet = currentRunning;
					} else {
						conditionMet = lastRunning !== undefined && lastRunning !== currentRunning;
					}

					outputData = { serviceName: service.name, running: currentRunning, lastRunningState: lastRunning, conditionMet };
					staticData.lastServiceRunningState = currentRunning;
				} else {
					return null;
				}
			}
			else if (triggerType === 'dockerStatus') {
				const containerName = this.getNodeParameter('containerName', '') as string;
				const dockerTriggerEvent = this.getNodeParameter('dockerTriggerEvent') as string;
				const containers = await si.dockerContainers(true).catch(() => []);

				if (containers && containers.length > 0) {
					let matchedContainers = containers;
					if (containerName.trim()) {
						matchedContainers = containers.filter(c => c.name.toLowerCase() === containerName.toLowerCase().trim() || c.id.startsWith(containerName.trim()));
					}

					if (matchedContainers.length === 0) {
						return null;
					}

					const container = matchedContainers[0];
					const currentStatus = container.state;
					const isRunning = currentStatus === 'running';
					const lastStatus = staticData.lastContainerStatus as string | undefined;

					if (dockerTriggerEvent === 'containerStops') {
						conditionMet = !isRunning;
					} else if (dockerTriggerEvent === 'containerStarts') {
						conditionMet = isRunning;
					} else {
						conditionMet = lastStatus !== undefined && lastStatus !== currentStatus;
					}

					outputData = {
						containerName: container.name,
						containerId: container.id,
						state: currentStatus,
						isRunning,
						lastState: lastStatus,
						conditionMet,
					};
					staticData.lastContainerStatus = currentStatus;
				} else {
					return null;
				}
			}
			else if (triggerType === 'networkLatency') {
				const latencyHost = this.getNodeParameter('latencyHost') as string;
				const latencyThreshold = this.getNodeParameter('latencyThreshold', 150) as number;
				const latencyComparison = this.getNodeParameter('latencyComparison') as string;
				const currentLatency = await si.inetLatency(latencyHost).catch(() => -1);

				if (latencyComparison === 'fails') {
					conditionMet = currentLatency === -1;
				} else {
					conditionMet = currentLatency > latencyThreshold;
				}

				outputData = { host: latencyHost, ms: currentLatency, limit: latencyThreshold, comparison: latencyComparison, conditionMet };
			}
			else if (triggerType === 'websiteStatus') {
				const siteUrl = this.getNodeParameter('siteUrl') as string;
				const websiteTriggerEvent = this.getNodeParameter('websiteTriggerEvent') as string;
				const responseTimeThreshold = this.getNodeParameter('responseTimeThreshold', 2000) as number;
				const check = await si.inetChecksite(siteUrl).catch(() => null);

				if (check) {
					const isSuccess = check.status === 200;
					const responseTime = check.ms;

					if (websiteTriggerEvent === 'statusNot200') {
						conditionMet = !isSuccess;
					} else if (websiteTriggerEvent === 'responseTimeExceeds') {
						conditionMet = responseTime > responseTimeThreshold;
					} else {
						conditionMet = !isSuccess || responseTime === null;
					}

					outputData = { url: siteUrl, statusCode: check.status, ms: responseTime, conditionMet };
				} else {
					conditionMet = true;
					outputData = { url: siteUrl, statusCode: 0, ms: null, conditionMet, error: 'Connection failed' };
				}
			}

			// Unified Transition Evaluation
			const lastConditionMet = staticData.lastConditionMet as boolean | undefined;
			staticData.lastConditionMet = conditionMet;

			if (conditionMet) {
				if (triggerMode === 'onTransition' && lastConditionMet === true) {
					return null;
				}
				outputData.timestamp = Date.now();
				return [this.helpers.returnJsonArray([outputData])];
			}

			return null;
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error as Error);
		}
	}
}
