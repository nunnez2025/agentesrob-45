import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AgentCard } from '@/components/AgentCard';
import { ChatInterface } from '@/components/ChatInterface';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { AIKeySetup } from '@/components/AIKeySetup';
import { ProjectReport } from '@/components/ProjectReport';
import { useAgentSystem } from '@/hooks/useAgentSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, MessageSquare, BarChart3, Settings, Bot } from 'lucide-react';

const Index = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const {
    project,
    agents,
    messages,
    isProcessing,
    createProject,
    sendMessage,
    approveProject,
    downloadProject,
    generateReport
  } = useAgentSystem();

  const handleCreateProject = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && projectDescription.trim()) {
      createProject(projectName.trim(), projectDescription.trim());
      setProjectName('');
      setProjectDescription('');
    }
  }, [projectName, projectDescription, createProject]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background digital-noise p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cyber font-black mb-4 glitch animate-chaos-pulse text-shadow-cyber" data-text="🃏 JOKER CYBER AGENTS">
              🃏 JOKER CYBER AGENTS
            </h1>
            <p className="text-xl text-muted-foreground font-mono animate-flicker terminal-text">
              &gt; Sistema multi-agente infiltrando ciberespaço... CAOS_CONTROLADO_ATIVO
            </p>
          </div>

          <Tabs defaultValue="project" className="w-full max-w-4xl mx-auto mb-8">
            <TabsList className="grid w-full grid-cols-2 h-auto terminal">
              <TabsTrigger value="project" className="cyber-button flex items-center gap-2 p-3 text-sm sm:text-base font-mono">
                <Plus className="h-4 w-4 flex-shrink-0 animate-flicker" />
                <span className="truncate">&gt; INICIAR_PROJETO</span>
              </TabsTrigger>
              <TabsTrigger value="setup" className="cyber-button flex items-center gap-2 p-3 text-sm sm:text-base font-mono">
                <Settings className="h-4 w-4 flex-shrink-0 animate-flicker" />
                <span className="truncate">&gt; CONFIG_APIS</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="mt-6">
              <AIKeySetup />
            </TabsContent>

            <TabsContent value="project" className="mt-6">

          <Card className="w-full max-w-2xl mx-auto hacker-card animate-chaos-pulse">
            <CardHeader className="p-4 sm:p-6 bg-grain">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-cyber chaos-text">
                <Plus className="h-5 w-5 flex-shrink-0 animate-glitch" />
                &gt; NOVO_PROJETO.INIT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 terminal">
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block chaos-text">
                    $ PROJECT_NAME:
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="&gt; Digite_nome_projeto..."
                    className="w-full font-mono bg-black/50 border-primary/50 text-primary placeholder:text-muted-foreground animate-flicker"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block chaos-text">
                    $ PROJECT_DESCRIPTION:
                  </label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="&gt; Descreva projeto e tecnologias (HTML, CSS, JS, Python, React, etc.)..."
                    rows={4}
                    className="w-full resize-none font-mono bg-black/50 border-primary/50 text-primary placeholder:text-muted-foreground animate-flicker"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full cyber-button bg-gradient-chaos hover:shadow-digital h-12 text-sm sm:text-base font-mono font-bold transition-all duration-300"
                  size="lg"
                >
                  🃏 EXECUTAR_INVASÃO_DIGITAL
                </Button>
              </form>
              
              <div className="mt-6 sm:mt-8">
                <h3 className="text-lg font-cyber font-bold mb-4 chaos-text animate-glitch" data-text="👾 AGENTES_INFILTRADOS">👾 AGENTES_INFILTRADOS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agents.slice(0, 6).map((agent) => (
                    <div key={agent.id} className="w-full">
                      <AgentCard agent={agent} />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center font-mono animate-flicker">
                  &gt; {agents.length - 6} agentes adicionais em standby... PRONTOS_PARA_INVASÃO
                </p>
              </div>
            </CardContent>
          </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background digital-noise overflow-hidden">
      <div className="border-b border-primary/30 bg-black/80 backdrop-blur-sm sticky top-0 z-10 terminal">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-cyber font-bold chaos-text animate-glitch" data-text={project.name}>
                🃏 {project.name}
              </h1>
              <p className="text-sm text-muted-foreground font-mono animate-flicker">
                &gt; {project.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono animate-flicker">
                &gt; {agents.filter(a => a.status === 'available').length} AGENTES_ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 bg-grain">
        {/* Painel Principal com Relatório */}
        <ProjectReport project={project} agents={agents} />

      </div>
    </div>
  );
};

export default Index;