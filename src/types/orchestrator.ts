export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string;
  fallbackStrategy: string[];
  outputDirectory: string;
  dependencies: string[];
}

export interface AgentExecution {
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  startTime?: Date;
  endTime?: Date;
  output?: string;
  errors: string[];
  retryCount: number;
  usedProvider?: string;
}

export interface OrchestrationSession {
  id: string;
  projectIdea: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  agents: AgentExecution[];
  currentAgentIndex: number;
  logs: OrchestrationLog[];
}

export interface OrchestrationLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  agentId?: string;
  message: string;
}

export interface ProjectDeliverable {
  agentId: string;
  directory: string;
  files: DeliverableFile[];
}

export interface DeliverableFile {
  name: string;
  path: string;
  content: string;
  type: 'code' | 'documentation' | 'config' | 'test';
}