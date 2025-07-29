import { useState } from 'react';
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

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && projectDescription.trim()) {
      createProject(projectName.trim(), projectDescription.trim());
      setProjectName('');
      setProjectDescription('');
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              🤖 AgenteMeta IA
            </h1>
            <p className="text-xl text-muted-foreground">
              Sistema multi-agente com IA integrada - Trabalho contínuo até aprovação final
            </p>
          </div>

          <Tabs defaultValue="project" className="max-w-4xl mx-auto mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="project">
                <Plus className="mr-2 h-4 w-4" />
                Criar Projeto
              </TabsTrigger>
              <TabsTrigger value="setup">
                <Settings className="mr-2 h-4 w-4" />
                Configurar APIs IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="mt-6">
              <AIKeySetup />
            </TabsContent>

            <TabsContent value="project" className="mt-6">

          <Card className="max-w-2xl mx-auto shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Novo Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nome do Projeto
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: App de Delivery, Site Corporativo, Game Mobile..."
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição do Projeto
                  </label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Descreva o que você quer desenvolver, principais funcionalidades, público-alvo..."
                    rows={4}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  size="lg"
                >
                  🚀 Iniciar Projeto com Agentes
                </Button>
              </form>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">👥 Agentes Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {agents.slice(0, 6).map((agent) => (
                    <div key={agent.id} className="scale-90">
                      <AgentCard agent={agent} />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  E mais {agents.length - 6} agentes especializados prontos para trabalhar!
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {agents.filter(a => a.status === 'available').length} agentes disponíveis
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="report" className="flex items-center gap-2">
              📊 Painel Principal
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat IA
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="ai-setup" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              APIs IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={selectedAgent === agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            <ProjectReport project={project} agents={agents} />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <div className="h-[600px]">
              <ChatInterface
                messages={messages}
                agents={agents}
                onSendMessage={sendMessage}
                isLoading={isProcessing}
              />
            </div>
          </TabsContent>

          <TabsContent value="ai-setup" className="mt-0">
            <AIKeySetup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;