import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Users,
  Brain,
  Code,
  FileText,
  Settings,
  Zap
} from 'lucide-react';
import { orchestratorService } from '@/services/OrchestratorService';
import { OrchestrationSession, AgentExecution } from '@/types/orchestrator';
import { useToast } from '@/hooks/use-toast';

export const OrchestratorInterface: React.FC = () => {
  const [projectIdea, setProjectIdea] = useState('');
  const [currentSession, setCurrentSession] = useState<OrchestrationSession | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const agentIcons = {
    'ana-clara': <FileText className="h-4 w-4" />,
    'marina': <Settings className="h-4 w-4" />,
    'carlos': <Code className="h-4 w-4" />,
    'lucas': <Settings className="h-4 w-4" />,
    'fernanda': <CheckCircle className="h-4 w-4" />,
    'beatriz': <FileText className="h-4 w-4" />,
    'camila': <Download className="h-4 w-4" />
  };

  const getStatusIcon = (status: AgentExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'retrying':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: AgentExecution['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'retrying':
        return 'bg-yellow-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const startOrchestration = async () => {
    if (!projectIdea.trim()) {
      toast({
        title: "❌ Ideia Necessária",
        description: "Por favor, descreva sua ideia de projeto antes de iniciar.",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      const sessionId = await orchestratorService.createSession(projectIdea);
      const session = await orchestratorService.executeSession(sessionId);
      setCurrentSession(session);
      
      toast({
        title: "🎉 Orquestração Concluída",
        description: "Todos os agentes executaram com sucesso!",
      });
    } catch (error) {
      toast({
        title: "❌ Falha na Orquestração",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const pauseOrchestration = async () => {
    if (currentSession) {
      await orchestratorService.pauseSession(currentSession.id);
      const updatedSession = orchestratorService.getSession(currentSession.id);
      if (updatedSession) {
        setCurrentSession(updatedSession);
      }
    }
  };

  const downloadResults = () => {
    if (!currentSession) return;

    const results = {
      session: currentSession,
      deliverables: currentSession.agents
        .filter(agent => agent.output)
        .map(agent => ({
          agentId: agent.agentId,
          output: agent.output,
          provider: agent.usedProvider
        }))
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projeto-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📥 Download Iniciado",
      description: "Arquivo com todos os entregáveis baixado com sucesso!",
    });
  };

  const calculateProgress = () => {
    if (!currentSession) return 0;
    const completed = currentSession.agents.filter(a => a.status === 'completed').length;
    return (completed / currentSession.agents.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-corruption border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 chaos-text">
            <Brain className="h-6 w-6" />
            🤖 MOTOR ORQUESTRADOR MULTI-AGENTE
          </CardTitle>
          <p className="text-muted-foreground">
            Sistema de execução sequencial de 7 agentes especializados
          </p>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Descreva Sua Ideia de Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={projectIdea}
            onChange={(e) => setProjectIdea(e.target.value)}
            placeholder="Ex: Criar um aplicativo de tarefas colaborativo com IA integrada, dashboard em tempo real e notificações push..."
            className="min-h-[120px]"
            disabled={isExecuting}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={startOrchestration}
              disabled={isExecuting || !projectIdea.trim()}
              className="cyber-button"
            >
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? 'Executando...' : '🚀 INICIAR ORQUESTRAÇÃO'}
            </Button>
            
            {currentSession && currentSession.status === 'running' && (
              <Button 
                onClick={pauseOrchestration}
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            )}
            
            {currentSession && currentSession.status === 'completed' && (
              <Button 
                onClick={downloadResults}
                variant="secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Projeto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📊 Progresso da Execução</span>
              <Badge variant={currentSession.status === 'completed' ? 'default' : 'secondary'}>
                {currentSession.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={calculateProgress()} className="w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSession.agents.map((agent, index) => {
                  const agentName = {
                    'ana-clara': 'Ana Clara (PM)',
                    'marina': 'Marina (Design)',
                    'carlos': 'Carlos (Frontend)',
                    'lucas': 'Lucas (DevOps)',
                    'fernanda': 'Fernanda (QA)',
                    'beatriz': 'Beatriz (Legal)',
                    'camila': 'Camila (Release)'
                  }[agent.agentId] || agent.agentId;

                  return (
                    <Card key={agent.agentId} className="hacker-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {agentIcons[agent.agentId as keyof typeof agentIcons]}
                            <span className="font-medium text-sm">{agentName}</span>
                          </div>
                          {getStatusIcon(agent.status)}
                        </div>
                        
                        <div className={`h-2 rounded-full ${getStatusColor(agent.status)}`} />
                        
                        {agent.usedProvider && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {agent.usedProvider}
                            </Badge>
                          </div>
                        )}
                        
                        {agent.errors.length > 0 && (
                          <div className="mt-2 text-xs text-red-500">
                            {agent.errors.length} erro(s)
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Section */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Logs de Execução</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {currentSession.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground text-xs">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`${
                      log.level === 'error' ? 'text-red-500' :
                      log.level === 'warn' ? 'text-yellow-500' :
                      log.level === 'success' ? 'text-green-500' :
                      'text-foreground'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Agent Outputs */}
      {currentSession && currentSession.agents.some(a => a.output) && (
        <Card>
          <CardHeader>
            <CardTitle>📄 Entregáveis dos Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentSession.agents
                .filter(agent => agent.output)
                .map(agent => {
                  const agentName = {
                    'ana-clara': 'Ana Clara (PM)',
                    'marina': 'Marina (Design)',
                    'carlos': 'Carlos (Frontend)',
                    'lucas': 'Lucas (DevOps)',
                    'fernanda': 'Fernanda (QA)',
                    'beatriz': 'Beatriz (Legal)',
                    'camila': 'Camila (Release)'
                  }[agent.agentId] || agent.agentId;

                  return (
                    <div key={agent.agentId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge>{agentName}</Badge>
                        {agent.usedProvider && (
                          <Badge variant="outline">{agent.usedProvider}</Badge>
                        )}
                      </div>
                      <ScrollArea className="h-[200px] border rounded p-4 bg-muted/50">
                        <pre className="text-xs whitespace-pre-wrap">
                          {agent.output}
                        </pre>
                      </ScrollArea>
                      <Separator />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};