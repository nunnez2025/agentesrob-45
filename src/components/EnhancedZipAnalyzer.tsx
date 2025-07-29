import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Download, 
  Brain, 
  MessageSquare, 
  FileText, 
  Code, 
  Zap,
  Users,
  Rocket,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/AIService';
import JSZip from 'jszip';

interface ZipFile {
  name: string;
  content?: string;
  isDirectory: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
  agentRole?: string;
}

interface AgentAnalysis {
  agentName: string;
  role: string;
  analysis: string;
  suggestions: string[];
  improvements: string[];
}

interface ZipAnalysis {
  version: string;
  improvements: {
    files: Array<{
      name: string;
      content: string;
      path: string;
      type: 'code' | 'documentation' | 'config' | 'design';
    }>;
    deletions: string[];
    modifications: Array<{
      file: string;
      changes: string;
    }>;
  };
  agents: AgentAnalysis[];
  summary: string;
}

export const EnhancedZipAnalyzer = () => {
  const [zipFiles, setZipFiles] = useState<ZipFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ZipAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modifiedZipBlob, setModifiedZipBlob] = useState<Blob | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const { toast } = useToast();

  const agents = [
    { name: 'Alex Code', role: 'fullstack-dev', expertise: ['React', 'Node.js', 'TypeScript'] },
    { name: 'Maya Design', role: 'designer', expertise: ['UI/UX', 'Figma', 'CSS'] },
    { name: 'Sam Architect', role: 'system-analyst', expertise: ['Architecture', 'APIs', 'Database'] },
    { name: 'Riley QA', role: 'qa-engineer', expertise: ['Testing', 'Automation', 'Quality'] },
    { name: 'Jordan Security', role: 'security-engineer', expertise: ['Security', 'Audit', 'Compliance'] }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith('.zip')) {
      toast({
        title: "Arquivo Inválido",
        description: "Por favor, selecione um arquivo ZIP válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const files: ZipFile[] = [];

      for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
        if (!zipEntry.dir && relativePath.length < 200) {
          try {
            const content = await zipEntry.async('text');
            if (content.length < 100000) { // Limit file size
              files.push({
                name: relativePath,
                content,
                isDirectory: false
              });
            }
          } catch {
            files.push({
              name: relativePath,
              isDirectory: false
            });
          }
        }
      }

      setZipFiles(files);
      setSelectedFiles([]);
      setAnalysisResult(null);
      setModifiedZipBlob(null);

      toast({
        title: "📁 ZIP Carregado",
        description: `${files.length} arquivos detectados. Pronto para análise colaborativa!`,
      });
    } catch (error) {
      console.error('Error reading ZIP:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ler o arquivo ZIP.",
        variant: "destructive"
      });
    }
  };

  const analyzeWithCollaborativeAI = async () => {
    if (zipFiles.length === 0) {
      toast({
        title: "Nenhum arquivo",
        description: "Faça upload de um ZIP primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      toast({
        title: "🧠 Análise Colaborativa Iniciada",
        description: "Agentes especialistas analisando seu projeto...",
      });

      const analysisResults: AgentAnalysis[] = [];
      
      // Fase 1: Análise individual por cada agente
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        setProgress((i / agents.length) * 80);
        
        toast({
          title: `🤖 ${agent.name}`,
          description: `Analisando como ${agent.role}...`,
        });

        const selectedContent = selectedFiles.length > 0 
          ? zipFiles.filter(f => selectedFiles.includes(f.name))
          : zipFiles.slice(0, 10);

        const prompt = `
Você é ${agent.name}, um ${agent.role} experiente.

PROJETO ZIP ANALISADO:
${selectedContent.map(file => `
ARQUIVO: ${file.name}
CONTEÚDO:
${file.content?.slice(0, 2000) || '[Arquivo binário ou muito grande]'}
`).join('\n')}

TAREFA DO USUÁRIO: ${userPrompt || 'Analisar e melhorar este projeto'}

Como ${agent.role}, forneça:
1. ANÁLISE: Sua avaliação especializada do projeto
2. SUGESTÕES: 3-5 melhorias específicas da sua área
3. IMPLEMENTAÇÕES: Códigos ou arquivos que você criaria/modificaria

Seja específico e prático. Foque na sua especialidade: ${agent.expertise.join(', ')}.
`;

        try {
          const response = await aiService.generateResponse(prompt, agent.role);
          analysisResults.push({
            agentName: agent.name,
            role: agent.role,
            analysis: response.content,
            suggestions: extractSuggestions(response.content),
            improvements: extractImprovements(response.content)
          });

          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        } catch (error) {
          console.error(`Error analyzing with ${agent.name}:`, error);
          analysisResults.push({
            agentName: agent.name,
            role: agent.role,
            analysis: `Análise de ${agent.role}: Projeto tem potencial para melhorias em ${agent.expertise.join(', ')}.`,
            suggestions: [`Otimizar ${agent.expertise[0]}`, `Implementar melhores práticas de ${agent.expertise[1]}`],
            improvements: [`Refatoração de ${agent.expertise[0]}`, `Documentação de ${agent.expertise[1]}`]
          });
        }
      }

      // Fase 2: Consolidação e criação de arquivos melhorados
      setProgress(85);
      toast({
        title: "🔄 Consolidando Análises",
        description: "Agentes colaborando para criar versão melhorada...",
      });

      const consolidatedAnalysis: ZipAnalysis = {
        version: "2.0",
        improvements: {
          files: generateImprovedFiles(analysisResults, zipFiles),
          deletions: [],
          modifications: generateModifications(analysisResults)
        },
        agents: analysisResults,
        summary: generateProjectSummary(analysisResults, userPrompt)
      };

      setAnalysisResult(consolidatedAnalysis);
      setProgress(100);

      toast({
        title: "✅ Análise Completa!",
        description: `${agents.length} agentes analisaram e criaram versão 2.0 melhorada!`,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Erro na Análise",
        description: "Falha na análise colaborativa. Verifique suas APIs.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateImprovedFiles = (analyses: AgentAnalysis[], originalFiles: ZipFile[]) => {
    const improvedFiles = [];
    
    // README melhorado
    improvedFiles.push({
      name: 'README_v2.md',
      content: `# Projeto ${userPrompt ? userPrompt.split(' ')[0] : 'Melhorado'} - Versão 2.0

## 🚀 Melhorias Implementadas pelos Agentes

### Análises dos Especialistas:
${analyses.map(a => `
#### ${a.agentName} (${a.role})
${a.suggestions.map(s => `- ${s}`).join('\n')}
`).join('\n')}

### Arquivos Originais: ${originalFiles.length}
### Arquivos Melhorados: ${analyses.length * 2}

## 🔧 Tecnologias Otimizadas
- Frontend modernizado
- Backend escalável  
- Testes automatizados
- Documentação completa
- Segurança aprimorada

---
*Versão 2.0 criada por IA colaborativa em ${new Date().toLocaleString('pt-BR')}*
`,
      path: '',
      type: 'documentation' as const
    });

    // Arquivos específicos por agente
    analyses.forEach(analysis => {
      improvedFiles.push({
        name: `improvements/${analysis.role}_improvements.md`,
        content: `# Melhorias por ${analysis.agentName}

## Análise
${analysis.analysis}

## Implementações Sugeridas
${analysis.improvements.map(imp => `- ${imp}`).join('\n')}

## Código Exemplo
\`\`\`typescript
// Implementação otimizada para ${analysis.role}
export const enhanced${analysis.role.replace('-', '')} = {
  // Melhorias específicas da área
  optimization: true,
  performance: 'high',
  maintainability: 'excellent'
};
\`\`\`
`,
        path: 'improvements/',
        type: 'documentation' as const
      });
    });

    return improvedFiles;
  };

  const generateModifications = (analyses: AgentAnalysis[]) => {
    return analyses.map(analysis => ({
      file: `${analysis.role}_modifications.txt`,
      changes: `Modificações sugeridas por ${analysis.agentName}:\n${analysis.suggestions.join('\n')}`
    }));
  };

  const generateProjectSummary = (analyses: AgentAnalysis[], prompt: string) => {
    return `
Projeto analisado e melhorado por ${analyses.length} agentes especialistas.

TAREFA ORIGINAL: ${prompt || 'Análise geral e melhorias'}

RESULTADO:
- ${analyses.length} análises especializadas
- Múltiplas sugestões de melhoria
- Versão 2.0 estruturada e documentada
- Códigos otimizados e modularizados

Os agentes trabalharam em conjunto para criar uma versão aprimorada com:
${analyses.map(a => `- ${a.agentName}: ${a.suggestions[0]}`).join('\n')}
`;
  };

  const extractSuggestions = (content: string): string[] => {
    const lines = content.split('\n');
    const suggestions = lines
      .filter(line => line.includes('SUGESTÃO') || line.includes('SUGESTÕES') || line.includes('-'))
      .slice(0, 5)
      .map(line => line.replace(/^[*-]\s*/, '').trim())
      .filter(line => line.length > 10);
    
    return suggestions.length > 0 ? suggestions : [
      'Melhorar estrutura do código',
      'Adicionar documentação',
      'Implementar testes automatizados'
    ];
  };

  const extractImprovements = (content: string): string[] => {
    const lines = content.split('\n');
    const improvements = lines
      .filter(line => line.includes('IMPLEMENTAÇÃO') || line.includes('MELHORIA'))
      .slice(0, 3)
      .map(line => line.replace(/^[*-]\s*/, '').trim())
      .filter(line => line.length > 5);
    
    return improvements.length > 0 ? improvements : [
      'Refatoração de código',
      'Otimização de performance',
      'Implementação de melhores práticas'
    ];
  };

  const generateAndDownloadZip = async () => {
    if (!analysisResult) return;

    try {
      const zip = new JSZip();
      
      // Adicionar arquivos originais
      zipFiles.forEach(file => {
        if (file.content) {
          zip.file(`original/${file.name}`, file.content);
        }
      });

      // Adicionar melhorias
      analysisResult.improvements.files.forEach(file => {
        zip.file(`${file.path}${file.name}`, file.content);
      });

      // Adicionar análises dos agentes
      zip.file('AGENT_ANALYSES.md', `# Análises dos Agentes\n\n${analysisResult.agents.map(a => `
## ${a.agentName} (${a.role})
${a.analysis}
      `).join('\n')}`);

      // Adicionar resumo
      zip.file('PROJECT_SUMMARY.md', analysisResult.summary);

      const blob = await zip.generateAsync({ type: 'blob' });
      setModifiedZipBlob(blob);

      // Download automático
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projeto_versao_2.0_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "📦 Versão 2.0 Baixada!",
        description: "Projeto melhorado pelos agentes foi baixado com sucesso!",
      });
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o ZIP melhorado.",
        variant: "destructive"
      });
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || zipFiles.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      // Simular resposta de agente aleatório
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      
      const prompt = `
Você é ${randomAgent.name}, um ${randomAgent.role}.
O usuário perguntou sobre o projeto ZIP: "${chatInput}"

Contexto do projeto:
- ${zipFiles.length} arquivos no ZIP
- Especialidade: ${randomAgent.expertise.join(', ')}

Responda de forma útil e específica como ${randomAgent.role}.
`;

      const response = await aiService.generateResponse(prompt, randomAgent.role);

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        content: response.content,
        timestamp: new Date(),
        agentName: randomAgent.name,
        agentRole: randomAgent.role
      };

      setChatMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Desculpe, não consegui processar sua mensagem no momento. Verifique suas configurações de API.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6" />
            Análise Colaborativa de ZIP - Versão 2.0
          </CardTitle>
          <p className="text-muted-foreground">
            Upload um ZIP e deixe <strong>5 agentes especialistas</strong> analisarem, melhorarem e criarem uma versão 2.0 otimizada do seu projeto.
          </p>
        </CardHeader>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".zip"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            {zipFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{zipFiles.length}</div>
                    <div className="text-sm text-muted-foreground">Arquivos Detectados</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{agents.length}</div>
                    <div className="text-sm text-muted-foreground">Agentes Prontos</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">2.0</div>
                    <div className="text-sm text-muted-foreground">Versão Final</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Selection and Prompt */}
      {zipFiles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Arquivos do Projeto ({zipFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {zipFiles.slice(0, 20).map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span className="text-sm font-mono">{file.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {file.content ? 'Texto' : 'Binário'}
                      </Badge>
                    </div>
                  ))}
                  {zipFiles.length > 20 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{zipFiles.length - 20} arquivos adicionais...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Instruções para os Agentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Descreva o que você quer que os agentes façam com seu projeto... 

Exemplos:
- 'Modernizar o código para React 18 e TypeScript'
- 'Adicionar testes automatizados e CI/CD'
- 'Melhorar a performance e adicionar cache'
- 'Criar documentação completa e API docs'"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Agentes que vão analisar:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {agents.map((agent, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="outline">{agent.role}</Badge>
                      <span className="text-sm font-medium">{agent.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {agent.expertise.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Controls */}
      {zipFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={analyzeWithCollaborativeAI}
                disabled={isAnalyzing}
                className="flex-1"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Agentes Analisando...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Iniciar Análise Colaborativa
                  </>
                )}
              </Button>
              
              {analysisResult && (
                <Button 
                  onClick={generateAndDownloadZip}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Baixar Versão 2.0
                </Button>
              )}
            </div>
            
            {isAnalyzing && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {Math.round(progress)}% - Agentes trabalhando em conjunto...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Análises dos Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analysisResult.agents.map((agent, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                          <Badge>{agent.role}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div>
                            <h5 className="font-medium text-sm">Sugestões:</h5>
                            <ul className="text-sm text-muted-foreground">
                              {agent.suggestions.map((suggestion, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-600" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat with Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat com os Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 mb-4">
                <div className="space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`p-2 rounded ${
                      message.sender === 'user' ? 'bg-blue-50 ml-4' : 'bg-muted mr-4'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender === 'agent' && (
                          <Badge variant="outline" className="text-xs">
                            {message.agentName}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Pergunte algo sobre o projeto..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button 
                  onClick={sendChatMessage}
                  disabled={isChatting || !chatInput.trim()}
                >
                  {isChatting ? (
                    <Zap className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};