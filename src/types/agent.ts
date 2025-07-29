export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;
  status: AgentStatus;
  expertise: string[];
  currentTask?: string;
  color: string;
}

export type AgentRole = 
  | 'product-manager'
  | 'developer'
  | 'designer'
  | 'backend-dev'
  | 'frontend-dev'
  | 'qa-engineer'
  | 'copywriter'
  | 'creative-writer'
  | 'system-analyst'
  | 'financial-analyst'
  | 'game-analyst'
  | 'philosopher'
  | 'director'
  | 'seo-specialist'
  | 'ai-specialist'
  | 'ml-engineer'
  | 'data-scientist'
  | 'python-dev'
  | 'react-dev'
  | 'nodejs-dev'
  | 'mobile-dev'
  | 'devops'
  | 'security-engineer'
  | 'blockchain-dev'
  | 'fullstack-dev'
  | 'api-dev'
  | 'database-dev'
  | 'cloud-architect'
  | 'code-reviewer'
  | 'performance-optimizer';

export type AgentStatus = 'available' | 'busy' | 'thinking' | 'offline' | 'working';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  agentId: string;
  type: 'message' | 'file' | 'code' | 'report';
  metadata?: {
    files?: string[];
    codeLanguage?: string;
    reportType?: string;
  };
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignedAgents: string[];
  startDate?: Date;
  endDate?: Date;
  deliverables: string[];
  progress: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'review' | 'completed';
  phases: ProjectPhase[];
  agents: Agent[];
  messages: Message[];
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
  approvedByUser: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'code' | 'design' | 'document' | 'asset';
  content?: string;
  createdBy: string;
  createdAt: Date;
  size: number;
}

export interface AgentConversation {
  participants: string[];
  messages: Message[];
  topic: string;
  priority: 'low' | 'medium' | 'high';
}