import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Code, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Zap,
  MessageSquare
} from 'lucide-react';
import { Project, Agent } from '@/types/agent';
import { fileGeneratorService, ProjectFile } from '@/services/FileGeneratorService';
import { useToast } from '@/hooks/use-toast';
import hackerJokerImage from '@/assets/hacker-joker.jpg';
import { ZipAnalyzer } from './ZipAnalyzer';
import { ChatInterface } from './ChatInterface';

interface ProjectReportProps {
  project: Project;
  agents: Agent[];
}

export const ProjectReport = ({ project, agents }: ProjectReportProps) => {
  const [generatingFiles, setGeneratingFiles] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateProjectFiles = async () => {
    setGeneratingFiles(true);
    setProgress(0);
    const allFiles: ProjectFile[] = [];

    try {
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        toast({
          title: `Gerando arquivos: ${agent.name}`,
          description: `${agent.role} está criando os deliverables...`,
        });

        const files = await fileGeneratorService.generateFilesForAgent(agent, project);
        allFiles.push(...files);
        
        setProgress(((i + 1) / agents.length) * 100);
        setGeneratedFiles([...allFiles]);
      }

      toast({
        title: "✅ Geração Completa!",
        description: `${allFiles.length} arquivos criados por ${agents.length} agentes`,
      });
    } catch (error) {
      toast({
        title: "Erro na Geração",
        description: "Alguns arquivos podem não ter sido criados",
        variant: "destructive"
      });
    } finally {
      setGeneratingFiles(false);
    }
  };

  const downloadProjectZip = async () => {
    if (generatedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo gerado",
        description: "Gere os arquivos primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const zipBlob = await fileGeneratorService.generateProjectZip(project, generatedFiles);
      fileGeneratorService.downloadZip(zipBlob, project.name);
      
      toast({
        title: "📦 Download Iniciado",
        description: `${project.name}.zip baixado com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Não foi possível gerar o ZIP",
        variant: "destructive"
      });
    }
  };

  const getAgentStats = () => {
    const available = agents.filter(a => a.status === 'available').length;
    const working = agents.filter(a => a.status === 'working').length;
    const busy = agents.filter(a => a.status === 'busy').length;

    return { available, working, busy, total: agents.length };
  };

  const getFileStats = () => {
    const byType = generatedFiles.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return byType;
  };

  const stats = getAgentStats();
  const fileStats = getFileStats();

  return (
    <div className="space-y-6">
      {/* Header with Hacker Joker */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-4">
            <img 
              src={hackerJokerImage} 
              alt="Hacker Joker" 
              className="w-16 h-16 rounded-full border-2 border-primary"
            />
            <div>
              <CardTitle className="text-2xl">Relatório do Projeto: {project.name}</CardTitle>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.available} disponíveis, {stats.working} trabalhando
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Arquivos Gerados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{generatedFiles.length}</div>
                <p className="text-xs text-muted-foreground">
                  Prontos para download
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do Projeto</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{project.status}</div>
                <p className="text-xs text-muted-foreground">
                  {project.phases.length} fases planejadas
                </p>
              </CardContent>
            </Card>
          </div>

          {generatingFiles && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Gerando Arquivos...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}% concluído
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <Badge variant={
                      agent.status === 'available' ? 'secondary' :
                      agent.status === 'working' ? 'default' : 'destructive'
                    }>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{agent.role}</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.expertise.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {/* Chat dos Agentes */}
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat com os Agentes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ChatInterface
                messages={[]}
                agents={agents}
                onSendMessage={() => {}}
                isLoading={false}
              />
            </CardContent>
          </Card>

          {/* Monitor do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monitor do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                <iframe
                  src="data:text/html,<html><body style='margin:0;padding:20px;font-family:Arial;background:linear-gradient(135deg,%23667eea,%23764ba2);color:white;text-align:center'><h1>🚀 Projeto Finalizado</h1><p>Preview do projeto funcionando</p><div style='margin-top:50px;font-size:48px'>✅</div></body></html>"
                  className="w-full h-full rounded-lg border-0"
                  title="Projeto Funcionando"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Gerar e Baixar Projeto Completo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Gere todos os arquivos do projeto organizados em pastas e baixe em formato ZIP.
              </p>
              <Button 
                onClick={async () => {
                  await generateProjectFiles();
                  setTimeout(() => downloadProjectZip(), 1000);
                }}
                disabled={generatingFiles}
                className="w-full"
              >
                {generatingFiles ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Gerando e Preparando ZIP...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar e Baixar Projeto ZIP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};