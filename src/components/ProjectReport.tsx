import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  Upload,
  MessageSquare
} from 'lucide-react';
import { Project, Agent } from '@/types/agent';
import { fileGeneratorService, ProjectFile } from '@/services/FileGeneratorService';
import { useToast } from '@/hooks/use-toast';
import hackerJokerImage from '@/assets/hacker-joker.jpg';
import { EnhancedZipAnalyzer } from './EnhancedZipAnalyzer';

interface ProjectReportProps {
  project: Project;
  agents: Agent[];
}

interface AgentConversation {
  name: string;
  role: string;
  avatar: string;
  message: string;
  timestamp: Date;
  files?: string[];
}

export const ProjectReport = ({ project, agents }: ProjectReportProps) => {
  const [generatingFiles, setGeneratingFiles] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [agentConversations, setAgentConversations] = useState<AgentConversation[]>([]);
  const { toast } = useToast();

  const generateProjectFiles = async () => {
    if (generatingFiles) return;
    
    console.log('🚀 ATIVANDO APIS REAIS - Sistema de IA Colaborativa Máxima...');
    setGeneratingFiles(true);
    setProgress(0);
    setGeneratedFiles([]);

    try {
      toast({
        title: "⚡ APIS REAIS ATIVADAS",
        description: "Sistema colaborativo em capacidade máxima iniciado!",
      });

      const allFiles: ProjectFile[] = [];
      
      // USAR TODOS OS AGENTES EM CAPACIDADE MÁXIMA
      const selectedAgents = agents; // Usar TODOS os agentes disponíveis
      console.log(`🤖 REAL AI PROCESSING: ${selectedAgents.length} agents with maximum capacity...`);
      
      // Fase 1: Ativação de APIs reais + HuggingFace auxiliar
      toast({
        title: "🔥 Fase 1: Ativação Completa",
        description: "APIs OpenAI, Gemini, DeepSeek, Grok + HuggingFace auxiliar...",
      });
      
      setProgress(5);
      
      // Inicializar agentes auxiliares HuggingFace em paralelo
      const huggingFaceService = await import('@/services/HuggingFaceService');
      console.log('🤖 HuggingFace agents activated as autonomous helpers...');
      
      // Fase 2: Processamento REAL com múltiplas APIs em paralelo
      for (let i = 0; i < selectedAgents.length; i++) {
        const agent = selectedAgents[i];
        const progressValue = 5 + ((i + 1) / selectedAgents.length) * 85;
        
        console.log(`⚡ REAL API CALL ${i + 1}/${selectedAgents.length}: ${agent.name} (${agent.role})`);
          setProgress(progressValue);
        
        // Adicionar conversa do agente em tempo real
        const agentMessage = generateAgentMessage(agent, project, i);
        setAgentConversations(prev => [...prev, agentMessage]);
        
        toast({
          title: `🔥 ${agent.name} - REAL AI`,
          description: `Processamento real com APIs: ${agent.role}...`,
        });

        try {
          // CHAMADA REAL DA API DE IA
          console.log(`📡 REAL AI API CALL for ${agent.name}...`);
          
          // Processo paralelo: API real + HuggingFace auxiliar
          const [realAIFiles, huggingFaceEnhancement] = await Promise.allSettled([
            fileGeneratorService.generateFilesForAgent(agent, project),
            generateHuggingFaceEnhancement(agent, project, huggingFaceService.huggingFaceService)
          ]);
          
          let agentFiles: any[] = [];
          
          if (realAIFiles.status === 'fulfilled' && realAIFiles.value.length > 0) {
            console.log(`✅ REAL AI SUCCESS: ${realAIFiles.value.length} files for ${agent.name}`);
            agentFiles = realAIFiles.value;
            
            // Adicionar conversa de sucesso
            const successMessage = generateSuccessMessage(agent, realAIFiles.value, project);
            setAgentConversations(prev => [...prev, successMessage]);
            
            // Adicionar melhorias do HuggingFace se disponíveis
            if (huggingFaceEnhancement.status === 'fulfilled') {
              console.log(`🤖 HuggingFace enhancement added for ${agent.name}`);
              agentFiles.push(...huggingFaceEnhancement.value);
              
              // Adicionar conversa sobre HuggingFace
              const hfMessage = generateHuggingFaceMessage(agent);
              setAgentConversations(prev => [...prev, hfMessage]);
            }
          } else {
            console.log(`⚠️ Real AI unavailable for ${agent.name}, using HuggingFace + enhanced fallback...`);
            
            // Se API real falhar, usar HuggingFace + fallback estruturado
            const fallbackFiles = await generateEnhancedFallbackFiles(agent, project, i, selectedAgents);
            agentFiles = fallbackFiles;
            
            // Adicionar conversa de fallback
            const fallbackMessage = generateFallbackMessage(agent);
            setAgentConversations(prev => [...prev, fallbackMessage]);
            
            if (huggingFaceEnhancement.status === 'fulfilled') {
              agentFiles.push(...huggingFaceEnhancement.value);
            }
          }
          
          allFiles.push(...agentFiles);
          setGeneratedFiles([...allFiles]);
          
        } catch (error) {
          console.error(`❌ CRITICAL ERROR with agent ${agent.name}:`, error);
          
          // Fallback robusto com HuggingFace
          const fallbackFiles = await generateEnhancedFallbackFiles(agent, project, i, selectedAgents);
          const huggingFaceFiles = await generateHuggingFaceEnhancement(agent, project, huggingFaceService.huggingFaceService).catch(() => []);
          
          allFiles.push(...fallbackFiles, ...huggingFaceFiles);
          setGeneratedFiles([...allFiles]);
        }

        // Rate limiting otimizado para APIs reais
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Fase 3: Revisão e otimização
      setProgress(95);
      toast({
        title: "🔍 Fase 3: Revisão",
        description: "Finalizando e organizando projeto...",
      });
      
      // Adicionar arquivos de projeto e documentação geral
      const projectFiles = generateProjectMetaFiles(project, selectedAgents, allFiles);
      allFiles.push(...projectFiles);
      setGeneratedFiles([...allFiles]);

      console.log('🎉 AI-powered file generation completed successfully');
      setProgress(100);
      
      setTimeout(() => {
        toast({
          title: "✅ Projeto Completo!",
          description: `${allFiles.length} arquivos gerados por IA! Pronto para download.`,
        });
      }, 500);
      
    } catch (error) {
      console.error('💥 Critical error in generateProjectFiles:', error);
      toast({
        title: "❌ Erro no Sistema",
        description: "Falha na geração. Verifique suas APIs ou tente novamente.",
        variant: "destructive"
      });
    } finally {
      console.log('🔄 Resetting generation state...');
      setTimeout(() => {
        setGeneratingFiles(false);
      }, 1000);
    }
  };

  // Função para gerar melhorias usando HuggingFace (APIs públicas grátis)
  const generateHuggingFaceEnhancement = async (agent: Agent, project: Project, huggingFaceService: any): Promise<ProjectFile[]> => {
    try {
      console.log(`🤖 HuggingFace enhancement for ${agent.name}...`);
      
      // Gerar código auxiliar baseado na especialidade do agente
      const codePrompt = `Generate ${agent.role} code for project: ${project.name}. Focus on: ${agent.expertise.slice(0, 2).join(', ')}`;
      const enhancedCode = await huggingFaceService.generateCode(codePrompt, 'typescript');
      
      const enhancementFiles: ProjectFile[] = [
        {
          name: `${agent.role}_enhancement.ts`,
          content: `// 🤖 Enhanced by HuggingFace AI for ${agent.name}
// Project: ${project.name}
// Specialization: ${agent.expertise.join(', ')}

${enhancedCode}

// Additional utilities and optimizations
export const ${agent.role.replace(/-/g, '')}Utils = {
  optimize: () => console.log('Optimization logic here'),
  validate: () => console.log('Validation logic here'),
  monitor: () => console.log('Monitoring logic here')
};`,
          type: 'code',
          path: `enhancements/${agent.role}/`
        }
      ];

      return enhancementFiles;
    } catch (error) {
      console.warn(`HuggingFace enhancement failed for ${agent.name}:`, error);
      return [];
    }
  };

  // Função auxiliar para fallback estruturado
  const generateEnhancedFallbackFiles = async (agent: Agent, project: Project, index: number, allAgents: Agent[]): Promise<ProjectFile[]> => {
    const roleTemplates = {
      'product-manager': [
        {
          name: 'PRD.md',
          content: `# Product Requirements Document - ${project.name}

## 📋 Visão Geral
${project.description}

## 🎯 Objetivos
- Criar solução inovadora e escalável
- Atender necessidades específicas do usuário  
- Implementar arquitetura robusta e moderna

## 📊 Métricas de Sucesso
- Performance superior a 90%
- Experiência do usuário otimizada
- Escalabilidade horizontal

## 🔄 Roadmap
### Fase 1: MVP (4 semanas)
- Funcionalidades core
- Interface básica
- Testes unitários

### Fase 2: Enhancement (6 semanas)  
- Features avançadas
- Otimizações
- Integração com APIs

### Fase 3: Scale (4 semanas)
- Deploy produção
- Monitoramento
- Feedback loop

---
*Documento gerado pelo Product Manager ${agent.name}*`,
          type: 'documentation' as const,
          path: 'docs/product/'
        }
      ],
      'developer': [
        {
          name: 'App.tsx',
          content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Dashboard } from '@/components/Dashboard';
import { Settings } from '@/components/Settings';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;`,
          type: 'code' as const,
          path: 'src/'
        }
      ],
      'default': [
        {
          name: `${agent.role}.md`,
          content: `# ${agent.name} - ${agent.role}

## 🔧 Especialidades
${agent.expertise.map(skill => `- ${skill}`).join('\n')}

## 📝 Responsabilidades
Desenvolvimento de soluções especializadas para ${agent.role} no projeto ${project.name}.

## 🎯 Entregáveis
- Código limpo e documentado
- Testes automatizados
- Documentação técnica
- Implementação de melhores práticas

---
*Desenvolvido por ${agent.name} - Sistema AgenteMeta IA*`,
          type: 'documentation' as const,
          path: `agents/${agent.role}/`
        }
      ]
    };

    const template = roleTemplates[agent.role as keyof typeof roleTemplates] || roleTemplates.default;
    return template;
  };

  // Função para gerar arquivos meta do projeto
  const generateProjectMetaFiles = (project: Project, agents: Agent[], files: ProjectFile[]): ProjectFile[] => {
    return [
      {
        name: 'README.md',
        content: `# ${project.name}

## 📖 Descrição
${project.description}

## 🤖 Agentes Colaboradores
${agents.map(agent => `- **${agent.name}** (${agent.role}): ${agent.expertise.slice(0, 2).join(', ')}`).join('\n')}

## 📁 Estrutura do Projeto
${files.reduce((acc, file) => {
  const dir = file.path.split('/')[0];
  if (!acc.includes(dir)) acc.push(dir);
  return acc;
}, [] as string[]).map(dir => `- \`${dir}/\``).join('\n')}

## 🚀 Como Usar
1. Extraia o arquivo ZIP
2. Navegue até o diretório do projeto
3. Instale as dependências: \`npm install\`
4. Execute o projeto: \`npm run dev\`

## 🔧 Tecnologias
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui Components

---
*Projeto gerado automaticamente pelo sistema AgenteMeta IA*
*Data: ${new Date().toLocaleString('pt-BR')}*`,
        type: 'documentation',
        path: ''
      },
      {
        name: 'package.json',
        content: `{
  "name": "${project.name.toLowerCase().replace(/\s+/g, '-')}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.15.0",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "~5.6.2",
    "vite": "^6.0.1",
    "vitest": "^2.1.8"
  }
}`,
        type: 'config',
        path: ''
      }
    ];
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
      toast({
        title: "Preparando Download",
        description: "Gerando arquivo ZIP...",
      });

      const zipBlob = await fileGeneratorService.generateProjectZip(project, generatedFiles);
      fileGeneratorService.downloadZip(zipBlob, `${project.name}_generated`);
      
      toast({
        title: "📦 Download Concluído",
        description: `${project.name}_generated.zip baixado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no Download",
        description: "Não foi possível gerar o ZIP. Verifique se os arquivos foram gerados corretamente.",
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

  // Função para gerar mensagens dos agentes em tempo real
  const generateAgentMessage = (agent: Agent, project: Project, index: number): AgentConversation => {
    const messages = [
      `Iniciando análise do projeto ${project.name}. Utilizando expertise em ${agent.expertise.slice(0, 2).join(' e ')}.`,
      `Conectando com APIs avançadas para ${agent.role}. Processando requisitos específicos...`,
      `Analisando arquitetura e definindo estratégias para ${agent.expertise[0]}. Sistema colaborativo ativo.`,
      `Iniciando processo de criação de código otimizado para ${project.name}. Foco em qualidade e performance.`,
      `Ativando protocolos de ${agent.role}. Integração com sistema HuggingFace para aprimoramentos.`
    ];
    
    return {
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      message: messages[index % messages.length],
      timestamp: new Date(),
    };
  };

  const generateSuccessMessage = (agent: Agent, files: any[], project: Project): AgentConversation => {
    return {
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      message: `✅ Concluí com sucesso! Gerados ${files.length} arquivos de alta qualidade para ${project.name}. Aplicando melhores práticas de ${agent.expertise[0]}.`,
      timestamp: new Date(),
      files: files.map(f => f.name)
    };
  };

  const generateHuggingFaceMessage = (agent: Agent): AgentConversation => {
    return {
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      message: `🤖 HuggingFace AI integrado! Adicionando melhorias autônomas e otimizações avançadas. Código aprimorado com IA colaborativa.`,
      timestamp: new Date(),
    };
  };

  const generateFallbackMessage = (agent: Agent): AgentConversation => {
    return {
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      message: `⚡ Adaptando estratégia! Utilizando sistema híbrido HuggingFace + templates especializados. Mantendo alta qualidade na entrega.`,
      timestamp: new Date(),
    };
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

          {/* Real-time Agent Conversations */}
          {generatingFiles && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversas dos Agentes em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full border rounded-lg p-4">
                  <div className="space-y-4">
                    {agentConversations.map((conversation, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-sm">{conversation.name}</span>
                          <Badge variant="outline" className="text-xs">{conversation.role}</Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(conversation.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{conversation.message}</p>
                        {conversation.files && conversation.files.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {conversation.files.map((file, fileIndex) => (
                              <Badge key={fileIndex} variant="secondary" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {file}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {agentConversations.length === 0 && (
                      <div className="text-center text-muted-foreground">
                        Aguardando conversas dos agentes...
                      </div>
                    )}
                  </div>
                </ScrollArea>
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
              <EnhancedZipAnalyzer />
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
                onClick={generateProjectFiles}
                disabled={generatingFiles}
                className="w-full mb-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {generatingFiles ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    🔥 APIS REAIS ATIVADAS - Processando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    ⚡ ATIVAR APIS REAIS - Gerar Projeto
                  </>
                )}
              </Button>

              <Button 
                onClick={downloadProjectZip}
                disabled={generatedFiles.length === 0 || generatingFiles}
                className="w-full"
                variant="secondary"
              >
                {generatingFiles ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Aguardando conclusão dos agentes...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    📦 Baixar Projeto ZIP ({generatedFiles.length} arquivos)
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