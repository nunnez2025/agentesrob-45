import React from 'react';
import { Agent } from '@/types/agent';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  onClick?: () => void;
}

const statusColors = {
  available: 'bg-success',
  busy: 'bg-warning',
  thinking: 'bg-info',
  offline: 'bg-muted'
};

const roleColors = {
  'product-manager': 'bg-agent-manager',
  'developer': 'bg-agent-developer',
  'designer': 'bg-agent-designer',
  'backend-dev': 'bg-agent-developer',
  'frontend-dev': 'bg-agent-developer',
  'qa-engineer': 'bg-agent-analyst',
  'copywriter': 'bg-agent-writer',
  'creative-writer': 'bg-agent-writer',
  'system-analyst': 'bg-agent-analyst',
  'financial-analyst': 'bg-agent-analyst',
  'game-analyst': 'bg-agent-analyst',
  'philosopher': 'bg-agent-writer',
  'director': 'bg-agent-manager',
  'seo-specialist': 'bg-agent-analyst'
};

export const AgentCard = React.memo(({ agent, isActive, onClick }: AgentCardProps) => {
  return (
    <Card 
      className={cn(
        "hacker-card transition-all duration-300 cursor-pointer hover:shadow-chaos border-primary/30 animate-flicker",
        isActive && "ring-2 ring-primary shadow-digital animate-chaos-pulse",
        "hover:border-primary/70 hover:transform hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 bg-grain">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 joker-avatar animate-pulse">
              <AvatarFallback 
                className={cn(
                  "text-black font-mono font-bold text-sm border border-primary/50",
                  roleColors[agent.role]
                )}
              >
                {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div 
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background animate-flicker",
                statusColors[agent.status]
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-cyber font-bold text-foreground truncate chaos-text">
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize mb-2 font-mono">
              &gt; {agent.role.replace('-', '_').toUpperCase()}
            </p>
            
            {agent.currentTask && (
              <p className="text-xs text-primary mb-2 truncate font-mono animate-flicker">
                🔥 {agent.currentTask}
              </p>
            )}
            
            <div className="flex flex-wrap gap-1">
              {agent.expertise.slice(0, 2).map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary"
                  className="text-xs px-2 py-0 font-mono bg-primary/20 text-primary border border-primary/50 animate-flicker"
                >
                  {skill}
                </Badge>
              ))}
              {agent.expertise.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0 font-mono border-accent text-accent animate-flicker">
                  +{agent.expertise.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});