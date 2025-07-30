import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Key, CheckCircle, AlertCircle, Zap, Brain, Rocket, Settings } from 'lucide-react';
import { aiService } from '@/services/AIService';
import { useToast } from '@/hooks/use-toast';

export const AIKeySetup = () => {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const providers = [
    { 
      name: 'OpenAI', 
      description: 'GPT-4.1, O3, O4-Mini - Modelos mais avançados', 
      key: 'openai',
      priority: 1,
      icon: Brain
    },
    { 
      name: 'Claude', 
      description: 'Claude 4 Sonnet - Raciocínio superior', 
      key: 'claude',
      priority: 2,
      icon: Rocket
    },
    { 
      name: 'Gemini', 
      description: 'Google Gemini Pro - IA conversacional avançada', 
      key: 'gemini',
      priority: 3,
      icon: Brain
    },
    { 
      name: 'Perplexity', 
      description: 'Perplexity Llama - Busca em tempo real', 
      key: 'perplexity',
      priority: 4,
      icon: Zap
    },
    { 
      name: 'DeepSeek', 
      description: 'DeepSeek Coder - Especialista em código', 
      key: 'deepseek',
      priority: 5,
      icon: Settings
    },
    { 
      name: 'Grok', 
      description: 'xAI Grok - IA criativa e inovadora', 
      key: 'grok',
      priority: 6,
      icon: Zap
    },
    { 
      name: 'Flowise', 
      description: 'Custom Flows - Workflows personalizados', 
      key: 'flowise',
      priority: 7,
      icon: Settings
    }
  ];

  const handleKeyChange = (provider: string, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value }));
  };

  const testAndSaveKey = async (provider: string) => {
    const key = keys[provider];
    if (!key?.trim()) {
      toast({
        title: "❌ Chave Vazia",
        description: "Por favor, insira uma chave de API válida.",
        variant: "destructive"
      });
      return;
    }

    setTesting(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Test real API call
      const testResponse = await aiService.testApiKey(provider, key);
      
      if (testResponse.success) {
        aiService.setApiKey(provider, key);
        toast({
          title: "✅ API Real Ativada",
          description: `${provider} conectado e funcionando com capacidade máxima!`,
        });
      } else {
        throw new Error(testResponse.error || 'Chave de API inválida');
      }
    } catch (error) {
      console.error(`Real API test failed for ${provider}:`, error);
      
      let errorMessage = 'Verifique sua chave de API';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Chave de API inválida ou expirada';
        } else if (error.message.includes('402')) {
          errorMessage = 'Saldo insuficiente na conta da API';
        } else if (error.message.includes('403')) {
          errorMessage = 'Chave de API bloqueada ou sem permissão';
        } else if (error.message.includes('404')) {
          errorMessage = 'Modelo não encontrado ou indisponível';
        } else if (error.message.includes('Load failed')) {
          errorMessage = 'Serviço temporariamente indisponível';
        }
      }
      
      toast({
        title: "❌ Chave de API Inválida",
        description: `${provider}: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const configureAllKeys = async () => {
    const validKeys = Object.entries(keys).filter(([_, key]) => key.trim());
    
    for (const [provider, key] of validKeys) {
      if (!testing[provider]) {
        await testAndSaveKey(provider);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      }
    }
    
    toast({
      title: "🚀 Configuração Completa",
      description: "Todas as APIs foram configuradas! Agentes prontos para trabalhar em capacidade máxima.",
    });
  };

  const availableProviders = aiService.getAvailableProviders();
  const configuredCount = availableProviders.filter(p => p.hasKey).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6" />
            Sistema de IA Colaborativo
          </CardTitle>
          <p className="text-muted-foreground">
            Configure múltiplas APIs para que os agentes trabalhem em <strong>capacidade máxima</strong>, 
            conversem entre si e entreguem projetos completos organizados em pastas.
          </p>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{configuredCount}</div>
            <div className="text-sm text-muted-foreground">APIs Ativas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{providers.length}</div>
            <div className="text-sm text-muted-foreground">APIs Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((configuredCount / providers.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Capacidade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {configuredCount >= 3 ? 'MÁXIMA' : 'LIMITADA'}
            </div>
            <div className="text-sm text-muted-foreground">Performance</div>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {providers.map((provider) => {
          const hasKey = availableProviders.find(p => p.name === provider.name)?.hasKey || false;
          const isLoading = testing[provider.key] || false;
          const IconComponent = provider.icon;
          
          return (
            <Card key={provider.key} className={hasKey ? "border-green-500/50 bg-green-50/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Prioridade {provider.priority}
                    </Badge>
                  </div>
                  <Badge variant={hasKey ? "default" : "secondary"}>
                    {hasKey ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> ATIVA</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" /> INATIVA</>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={provider.key}>Chave da API</Label>
                  <Input
                    id={provider.key}
                    type="password"
                    placeholder={`Cole sua chave da API ${provider.name}`}
                    value={keys[provider.key] || ''}
                    onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                    className={hasKey ? "border-green-500" : ""}
                  />
                </div>
                <Button 
                  onClick={() => testAndSaveKey(provider.key)}
                  disabled={!keys[provider.key] || isLoading}
                  className="w-full"
                  variant={hasKey ? "secondary" : "default"}
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Testando API...
                    </>
                  ) : hasKey ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reconfigurar
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Testar e Ativar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Configuração Rápida para Máxima Performance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cole todas as chaves acima e clique para configurar tudo de uma vez. 
            Recomendado: Configure ao menos OpenAI, Gemini e DeepSeek para melhor resultado.
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={configureAllKeys}
            disabled={Object.values(keys).filter(k => k.trim()).length === 0}
            className="w-full"
            size="lg"
          >
            <Brain className="h-5 w-5 mr-2" />
            Configurar Todas as APIs ({Object.values(keys).filter(k => k.trim()).length} APIs detectadas)
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Como Obter as Chaves de API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">OpenAI (Recomendado)</h4>
              <p className="text-muted-foreground">platform.openai.com → API Keys</p>
            </div>
            <div>
              <h4 className="font-semibold">Anthropic Claude</h4>
              <p className="text-muted-foreground">console.anthropic.com → API Keys</p>
            </div>
            <div>
              <h4 className="font-semibold">Google Gemini</h4>
              <p className="text-muted-foreground">aistudio.google.com → Get API Key</p>
            </div>
            <div>
              <h4 className="font-semibold">Perplexity AI</h4>
              <p className="text-muted-foreground">perplexity.ai → Settings → API</p>
            </div>
            <div>
              <h4 className="font-semibold">DeepSeek</h4>
              <p className="text-muted-foreground">platform.deepseek.com → API Keys</p>
            </div>
            <div>
              <h4 className="font-semibold">xAI Grok</h4>
              <p className="text-muted-foreground">console.x.ai → API Keys</p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-800 text-xs">
              💡 <strong>Dica:</strong> Configure pelo menos 3 APIs para que os agentes trabalhem em capacidade máxima e conversem entre si eficientemente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};