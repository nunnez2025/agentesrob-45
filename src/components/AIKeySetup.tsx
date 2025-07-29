import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, CheckCircle } from 'lucide-react';
import { aiService } from '@/services/AIService';
import { useToast } from '@/hooks/use-toast';

export const AIKeySetup = () => {
  const [keys, setKeys] = useState({
    openai: '',
    gemini: '',
    deepseek: '',
    grok: '',
    flowise: ''
  });
  const [providers, setProviders] = useState(aiService.getAvailableProviders());
  const { toast } = useToast();

  const handleSaveKey = (provider: string, key: string) => {
    if (!key.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave válida",
        variant: "destructive"
      });
      return;
    }

    aiService.setApiKey(provider, key);
    setProviders(aiService.getAvailableProviders());
    
    toast({
      title: "Chave Salva",
      description: `Chave do ${provider} configurada com sucesso!`,
    });

    // Clear input
    setKeys(prev => ({
      ...prev,
      [provider.toLowerCase()]: ''
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuração de APIs de IA
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Chaves armazenadas localmente no seu navegador
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* OpenAI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">OpenAI GPT-4</label>
            {providers.find(p => p.name === 'OpenAI')?.hasKey && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configurado
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-proj-..."
              value={keys.openai}
              onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
            />
            <Button onClick={() => handleSaveKey('OpenAI', keys.openai)}>
              Salvar
            </Button>
          </div>
        </div>

        {/* Gemini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Google Gemini</label>
            {providers.find(p => p.name === 'Gemini')?.hasKey && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configurado
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="AIza..."
              value={keys.gemini}
              onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
            />
            <Button onClick={() => handleSaveKey('Gemini', keys.gemini)}>
              Salvar
            </Button>
          </div>
        </div>

        {/* DeepSeek */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">DeepSeek Coder</label>
            {providers.find(p => p.name === 'DeepSeek')?.hasKey && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configurado
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-..."
              value={keys.deepseek}
              onChange={(e) => setKeys(prev => ({ ...prev, deepseek: e.target.value }))}
            />
            <Button onClick={() => handleSaveKey('DeepSeek', keys.deepseek)}>
              Salvar
            </Button>
          </div>
        </div>

        {/* Grok */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Grok (X.AI)</label>
            {providers.find(p => p.name === 'Grok')?.hasKey && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configurado
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="xai-..."
              value={keys.grok}
              onChange={(e) => setKeys(prev => ({ ...prev, grok: e.target.value }))}
            />
            <Button onClick={() => handleSaveKey('Grok', keys.grok)}>
              Salvar
            </Button>
          </div>
        </div>

        {/* Flowise */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Flowise</label>
            {providers.find(p => p.name === 'Flowise')?.hasKey && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Configurado
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="V2Zu_..."
              value={keys.flowise}
              onChange={(e) => setKeys(prev => ({ ...prev, flowise: e.target.value }))}
            />
            <Button onClick={() => handleSaveKey('Flowise', keys.flowise)}>
              Salvar
            </Button>
          </div>
        </div>

        {/* Quick Setup */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Setup Rápido - Todas as APIs</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• <strong>OpenAI:</strong> GPT-4 - Melhor qualidade geral</p>
            <p>• <strong>Gemini:</strong> Google - Boa qualidade e velocidade</p>
            <p>• <strong>DeepSeek:</strong> Especializado em código</p>
            <p>• <strong>Grok:</strong> X.AI - Modelo criativo</p>
            <p>• <strong>Flowise:</strong> Workflows personalizados</p>
            <p>• <strong>Hugging Face:</strong> Modelos open source gratuitos</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              handleSaveKey('OpenAI', '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');
              handleSaveKey('Gemini', 'AIzaSyBRxsnUY-PTT95EiY6yVTCaDz7DeJLgc9E');
              handleSaveKey('DeepSeek', 'sk-4001fb4f0ab44836817907e524a520ae');
              handleSaveKey('Grok', 'xai-lm9TeAFhMVeOSjlzrUeTkth25T3dmy692MbBIGOKoibjGbajmeMwvxBJnRO3KyxIVelRnjCj7nRkm6M2');
              handleSaveKey('Flowise', 'V2Zu_LGe9GoO4JIbqejaAevJ62pew-7AD7uqvITCw40');
              toast({
                title: "Todas as Chaves Configuradas!",
                description: "Sistema de fallback automático ativado com 5 APIs",
              });
            }}
          >
            🚀 Configurar Todas as APIs
          </Button>
        </div>

        {/* Status */}
        <div className="text-xs text-muted-foreground">
          Sistema com fallback automático: OpenAI → Gemini → DeepSeek → Grok → Flowise → Hugging Face (gratuito)
        </div>
      </CardContent>
    </Card>
  );
};