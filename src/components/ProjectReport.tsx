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
  Upload
} from 'lucide-react';
import { Project, Agent } from '@/types/agent';
import { fileGeneratorService, ProjectFile } from '@/services/FileGeneratorService';
import { useToast } from '@/hooks/use-toast';
import hackerJokerImage from '@/assets/hacker-joker.jpg';
import { ZipAnalyzer } from './ZipAnalyzer';

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
      fileGeneratorService.downloadZip(zipBlob, `${project.name}_generated`);
      
      toast({
        title: "📦 Download Iniciado",
        description: `${project.name}_generated.zip baixado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="zip-analyzer">Análise ZIP</TabsTrigger>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(fileStats).map(([type, count]) => (
              <Card key={type}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            {generatedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.path}</p>
                  </div>
                </div>
                <Badge variant="outline">{file.type}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="zip-analyzer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Análise e Edição de ZIP pelos Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Faça upload de um arquivo ZIP e deixe os agentes analisarem, modificarem e entregarem uma versão atualizada baseada na sua descrição.
              </p>
              <ZipAnalyzer />
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
                  if (generatedFiles.length > 0) {
                    await downloadProjectZip();
                  }
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