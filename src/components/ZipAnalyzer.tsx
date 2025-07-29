import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Zap,
  Package,
  AlertCircle,
  Send,
  Bot,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/AIService';
import JSZip from 'jszip';

interface ZipFile {
  filename: string;
  content: string | null;
  isDirectory: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ZipAnalysis {
  files: Array<{
    filename: string;
    content: string;
  }>;
  delete?: string[];
  move?: Array<{
    from: string;
    to: string;
  }>;
}

export const ZipAnalyzer = () => {
  const [zipFiles, setZipFiles] = useState<ZipFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [userPrompt, setUserPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modifiedZip, setModifiedZip] = useState<Blob | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();

  const textFileExtensions = ['.html', '.js', '.css', '.txt', '.json', '.md', '.jsx', '.ts', '.tsx', '.py', '.php'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo ZIP",
        variant: "destructive"
      });
      return;
    }

    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      const files: ZipFile[] = [];

      for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
        const isTextFile = textFileExtensions.some(ext => 
          relativePath.toLowerCase().endsWith(ext)
        );

        let content = null;
        if (isTextFile && !zipEntry.dir) {
          try {
            content = await zipEntry.async('text');
          } catch (err) {
            console.warn(`Não foi possível ler ${relativePath}:`, err);
          }
        }

        files.push({
          filename: relativePath,
          content,
          isDirectory: zipEntry.dir
        });
      }

      setZipFiles(files);
      setSelectedFiles(new Set());
      setModifiedZip(null);
      
      toast({
        title: "ZIP carregado",
        description: `${files.length} arquivos encontrados`,
      });
    } catch (error) {
      toast({
        title: "Erro ao ler ZIP",
        description: "Não foi possível processar o arquivo",
        variant: "destructive"
      });
    }
  };

  const toggleFileSelection = (filename: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(filename)) {
      newSelection.delete(filename);
    } else {
      newSelection.add(filename);
    }
    setSelectedFiles(newSelection);
  };

  const analyzeWithAI = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Instrução necessária",
        description: "Digite uma instrução para a IA",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.size === 0) {
      toast({
        title: "Seleção necessária",
        description: "Selecione pelo menos um arquivo",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Construir contexto
      let context = "Estrutura do ZIP:\n\nArquivos selecionados:\n";
      const selectedEntries = zipFiles.filter(file => selectedFiles.has(file.filename));
      
      selectedEntries.forEach(file => {
        context += `\nArquivo: ${file.filename}\n`;
        if (file.content) {
          context += `Conteúdo:\n${file.content}\n`;
        } else {
          context += "Conteúdo: (não é arquivo de texto)\n";
        }
        context += "----\n";
      });

      const fullPrompt = `Você é um assistente especializado em manipulação de projetos ZIP. 
Analise a estrutura e conteúdo dos arquivos fornecidos e responda SOMENTE com um JSON no formato:

{
  "files": [
    {
      "filename": "caminho/do/arquivo.txt",
      "content": "conteúdo do arquivo"
    }
  ],
  "delete": ["arquivo_para_deletar.txt"],
  "move": [
    {
      "from": "arquivo_antigo.txt",
      "to": "arquivo_novo.txt"
    }
  ]
}

- "files": arquivos novos ou modificados
- "delete": arquivos a serem removidos
- "move": arquivos a serem movidos/renomeados

Responda APENAS com JSON válido, sem explicações.

${context}

Instrução: ${userPrompt}`;

      setProgress(50);

      const response = await aiService.generateResponse(fullPrompt, 'ai-specialist');
      const content = response.content;
      
      setProgress(100);
      setAnalysisResult(content);
      
      toast({
        title: "Análise concluída",
        description: "IA processou os arquivos com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível processar com a IA",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const applyChanges = async () => {
    if (!analysisResult) {
      toast({
        title: "Nenhuma análise",
        description: "Execute a análise primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const analysis: ZipAnalysis = JSON.parse(analysisResult);
      const zip = new JSZip();

      // Adicionar arquivos existentes (exceto os que serão deletados)
      for (const file of zipFiles) {
        if (file.isDirectory) continue;
        if (analysis.delete?.includes(file.filename)) continue;

        // Verificar se será movido
        const moveOperation = analysis.move?.find(m => m.from === file.filename);
        const finalFilename = moveOperation ? moveOperation.to : file.filename;

        if (file.content) {
          zip.file(finalFilename, file.content);
        } else {
          // Para arquivos binários, tentar manter o original
          try {
            const originalFile = zipFiles.find(f => f.filename === file.filename);
            if (originalFile) {
              zip.file(finalFilename, ""); // Placeholder para arquivos binários
            }
          } catch (err) {
            console.warn(`Não foi possível preservar ${file.filename}`);
          }
        }
      }

      // Adicionar/modificar arquivos da análise
      if (analysis.files) {
        for (const file of analysis.files) {
          zip.file(file.filename, file.content);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      setModifiedZip(blob);

      toast({
        title: "Alterações aplicadas",
        description: "ZIP modificado e pronto para download",
      });
    } catch (error) {
      toast({
        title: "Erro ao aplicar",
        description: "JSON inválido ou erro no processamento",
        variant: "destructive"
      });
    }
  };

  const downloadModifiedZip = () => {
    if (!modifiedZip) return;

    const url = URL.createObjectURL(modifiedZip);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projeto-modificado.zip';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "ZIP modificado baixado com sucesso",
    });
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !zipFiles.length) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Contexto dos arquivos analisados
      let context = "Arquivos no projeto ZIP:\n";
      zipFiles.forEach(file => {
        context += `- ${file.filename}${file.isDirectory ? ' (pasta)' : ''}\n`;
        if (file.content && file.content.length < 1000) {
          context += `  Conteúdo: ${file.content.substring(0, 500)}...\n`;
        }
      });

      const prompt = `Você é um especialista em análise de projetos. Analise os arquivos do ZIP e responda à solicitação do usuário.

${context}

Usuário: ${chatInput}

Responda de forma técnica e específica sobre o projeto, sugerindo melhorias, identificando problemas ou explicando a estrutura.`;

      const response = await aiService.generateResponse(prompt, 'ai-specialist');
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'agent',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      toast({
        title: "Erro no chat",
        description: "Não foi possível processar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Analisador de ZIP com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
              <Upload className="h-5 w-5" />
              <span>Carregar arquivo ZIP</span>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {zipFiles.length > 0 && (
            <>
              <div>
                <h4 className="font-medium mb-2">Arquivos no ZIP (clique para selecionar):</h4>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {zipFiles.map((file) => (
                    <div
                      key={file.filename}
                      onClick={() => toggleFileSelection(file.filename)}
                      className={`p-2 cursor-pointer hover:bg-accent/50 border-b last:border-0 ${
                        selectedFiles.has(file.filename) ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {file.isDirectory ? '📁' : '📄'}
                        <span className="text-sm">{file.filename}</span>
                        {file.content && <Badge variant="outline" className="text-xs">legível</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedFiles.size} arquivo(s) selecionado(s)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Instrução para IA:
                </label>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ex: Criar um arquivo README.md com instruções do projeto..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analisar com IA
                  </>
                )}
              </Button>

              {isAnalyzing && (
                <Progress value={progress} className="w-full" />
              )}

              {analysisResult && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Resultado da IA:
                  </label>
                  <Textarea
                    value={analysisResult}
                    onChange={(e) => setAnalysisResult(e.target.value)}
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={applyChanges} variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Aplicar Alterações
                    </Button>
                  </div>
                </div>
              )}

              {modifiedZip && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      ZIP modificado pronto!
                    </span>
                  </div>
                  <Button onClick={downloadModifiedZip} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar ZIP Modificado
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Chat com os Agentes */}
      {zipFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Conversar com Agentes sobre o Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Área de mensagens */}
            <ScrollArea className="h-80 mb-4 p-4 border rounded-lg">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Comece uma conversa sobre o projeto analisado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Agente pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input de chat */}
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte sobre o projeto, solicite melhorias ou análises..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                disabled={isChatLoading}
              />
              <Button 
                onClick={sendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Botão de download sempre visível quando há arquivos */}
            {modifiedZip && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Projeto modificado disponível para download
                  </span>
                </div>
                <Button onClick={downloadModifiedZip} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Projeto Final
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};