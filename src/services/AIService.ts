interface AIProvider {
  name: string;
  endpoint: string;
  headers: (apiKey: string) => Record<string, string>;
  formatRequest: (prompt: string, role: string) => any;
  parseResponse: (response: any) => string;
}

interface AIResponse {
  success: boolean;
  content: string;
  provider: string;
  error?: string;
}

class AIService {
  private providers: AIProvider[] = [
    {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }),
      formatRequest: (prompt: string, role: string) => ({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um ${role} experiente. Responda de forma prática e concisa com código quando necessário.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
      parseResponse: (response: any) => response.choices[0]?.message?.content || 'Resposta não disponível'
    },
    {
      name: 'Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      headers: (apiKey: string) => ({
        'Content-Type': 'application/json',
      }),
      formatRequest: (prompt: string, role: string) => ({
        contents: [{
          parts: [{
            text: `Contexto: Você é um ${role} experiente.\n\nTarefa: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      }),
      parseResponse: (response: any) => response.candidates[0]?.content?.parts[0]?.text || 'Resposta não disponível'
    },
    {
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }),
      formatRequest: (prompt: string, role: string) => ({
        model: 'deepseek-coder',
        messages: [
          {
            role: 'system',
            content: `Você é um ${role} especializado. Foque em soluções práticas e código eficiente.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
      parseResponse: (response: any) => response.choices[0]?.message?.content || 'Resposta não disponível'
    },
    {
      name: 'Grok',
      endpoint: 'https://api.x.ai/v1/chat/completions',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }),
      formatRequest: (prompt: string, role: string) => ({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `Você é um ${role} criativo e eficiente. Forneça soluções inovadoras.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      }),
      parseResponse: (response: any) => response.choices[0]?.message?.content || 'Resposta não disponível'
    },
    {
      name: 'Flowise',
      endpoint: 'https://api.flowise.com/api/v1/prediction',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }),
      formatRequest: (prompt: string, role: string) => ({
        question: `Como ${role}: ${prompt}`,
        overrideConfig: {
          temperature: 0.7,
          maxTokens: 2000
        }
      }),
      parseResponse: (response: any) => response.text || response.answer || 'Resposta não disponível'
    },
    {
      name: 'Claude',
      endpoint: 'https://api.anthropic.com/v1/messages',
      headers: (apiKey: string) => ({
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }),
      formatRequest: (prompt: string, role: string) => ({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: `Contexto: Você é um ${role} experiente. Tarefa: ${prompt}`
          }
        ]
      }),
      parseResponse: (response: any) => response.content[0]?.text || 'Resposta não disponível'
    },
    {
      name: 'Perplexity',
      endpoint: 'https://api.perplexity.ai/chat/completions',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }),
      formatRequest: (prompt: string, role: string) => ({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `Você é um ${role} experiente. Responda de forma prática e concisa.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
      parseResponse: (response: any) => response.choices[0]?.message?.content || 'Resposta não disponível'
    }
  ];

  private huggingFaceModels = [
    'microsoft/DialoGPT-medium',
    'facebook/blenderbot-400M-distill',
    'microsoft/DialoGPT-small',
    'mistralai/Mistral-7B-Instruct-v0.1',
    'codellama/CodeLlama-7b-Python-hf',
    'WizardLM/WizardCoder-Python-7B-V1.0',
    'bigcode/starcoder',
    'microsoft/CodeT5p-770M-py'
  ];

  // API Keys storage
  private getApiKey(provider: string): string | null {
    return localStorage.getItem(`ai_api_key_${provider.toLowerCase()}`);
  }

  public setApiKey(provider: string, apiKey: string): void {
    localStorage.setItem(`ai_api_key_${provider.toLowerCase()}`, apiKey);
  }

  public async testApiKey(provider: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
    const providerConfig = this.providers.find(p => p.name.toLowerCase() === provider.toLowerCase());
    if (!providerConfig) {
      return { success: false, error: 'Provider not found' };
    }

    try {
      const testPrompt = "Responda apenas 'OK' se você conseguir me ouvir.";
      const response = await this.callProvider(providerConfig, testPrompt, 'system-test', apiKey);
      return { success: response.success, error: response.error };
    } catch (error) {
      console.error(`API test error for ${provider}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Teste da API falhou' 
      };
    }
  }

  public async generateResponse(prompt: string, agentRole: string): Promise<AIResponse> {
    // First check if any API keys are configured
    const hasAnyApiKey = this.providers.some(provider => this.getApiKey(provider.name));
    
    if (!hasAnyApiKey) {
      // No API keys configured, use direct mock response
      return {
        success: true,
        content: this.generateMockResponse(prompt, agentRole),
        provider: 'Mock System'
      };
    }

    // Try providers in order: OpenAI -> Gemini -> Public APIs -> Hugging Face
    for (const provider of this.providers) {
      const apiKey = this.getApiKey(provider.name);
      if (!apiKey) continue;

      try {
        const response = await this.callProvider(provider, prompt, agentRole, apiKey);
        if (response.success) {
          return response;
        }
      } catch (error) {
        console.warn(`${provider.name} failed, trying next provider:`, error);
        continue;
      }
    }

    // Ultimate fallback to mock response
    return {
      success: true,
      content: this.generateMockResponse(prompt, agentRole),
      provider: 'Mock System'
    };
  }

  private async callProvider(provider: AIProvider, prompt: string, role: string, apiKey: string): Promise<AIResponse> {
    try {
      const url = provider.name === 'Gemini' 
        ? `${provider.endpoint}?key=${apiKey}`
        : provider.endpoint;

      const response = await fetch(url, {
        method: 'POST',
        headers: provider.headers(apiKey),
        body: JSON.stringify(provider.formatRequest(prompt, role)),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          content: '',
          provider: provider.name,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`
        };
      }

      const data = await response.json();
      const content = provider.parseResponse(data);

      return {
        success: true,
        content,
        provider: provider.name
      };
    } catch (error) {
      console.error(`Provider ${provider.name} error:`, error);
      return {
        success: false,
        content: '',
        provider: provider.name,
        error: error instanceof Error ? error.message : 'Erro desconhecido na API'
      };
    }
  }

  private async callHuggingFace(prompt: string, role: string): Promise<AIResponse> {
    for (const model of this.huggingFaceModels) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `Como ${role}, responda: ${prompt}`,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              do_sample: true
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = Array.isArray(data) ? data[0]?.generated_text || data[0]?.text || 'Resposta processada' : 'Processando...';
          
          return {
            success: true,
            content,
            provider: `Hugging Face (${model})`
          };
        }
      } catch (error) {
        console.warn(`Hugging Face model ${model} failed:`, error);
        continue;
      }
    }

    // Ultimate fallback
    return {
      success: true,
      content: this.generateFallbackResponse(prompt, role),
      provider: 'Fallback System'
    };
  }

  private async tryPublicAPIs(prompt: string, role: string): Promise<AIResponse> {
    // Try Ollama local API (if available)
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `Como ${role}, responda: ${prompt}`,
          stream: false
        })
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        return {
          success: true,
          content: data.response || 'Resposta gerada localmente',
          provider: 'Ollama Local'
        };
      }
    } catch (error) {
      console.warn('Ollama local API failed:', error);
    }

    // Try GitHub Copilot Chat API (public endpoints)
    try {
      const githubResponse = await fetch('https://api.github.com/copilot/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Você é um ${role} experiente.` },
            { role: 'user', content: prompt }
          ],
          model: 'gpt-4'
        })
      });

      if (githubResponse.ok) {
        const data = await githubResponse.json();
        return {
          success: true,
          content: data.choices?.[0]?.message?.content || 'Código gerado com GitHub Copilot',
          provider: 'GitHub Copilot'
        };
      }
    } catch (error) {
      console.warn('GitHub Copilot failed:', error);
    }

    return { success: false, content: '', provider: 'None' };
  }

  private generateMockResponse(prompt: string, role: string): string {
    const codeTemplates = {
      'developer': `// ${prompt.includes('README') ? 'README.md' : 'App.tsx'}
${prompt.includes('README') ? 
`# Projeto Desenvolvido

## Descrição
Este projeto foi desenvolvido com React, TypeScript e Vite.

## Instalação
\`\`\`bash
npm install
npm run dev
\`\`\`

## Estrutura
- src/components/ - Componentes React
- src/hooks/ - Custom hooks
- src/types/ - Definições de tipos
- src/services/ - Serviços da aplicação

## Tecnologias
- React 18
- TypeScript
- Vite
- Tailwind CSS
` :
`import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Aplicação Funcional</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Esta é uma aplicação React funcional criada pelos agentes.</p>
            <Button className="mt-4">
              Botão de Exemplo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;`}`,
      'frontend-dev': `// components/UserInterface.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UserInterfaceProps {
  title: string;
}

export const UserInterface: React.FC<UserInterfaceProps> = ({ title }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite algo..."
        />
        <Button className="w-full">
          Processar
        </Button>
      </CardContent>
    </Card>
  );
};`,
      'designer': `/* styles/theme.css */
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14.3% 95.9%;
  --secondary-foreground: 220 8.9% 46.1%;
  --accent: 220 14.3% 95.9%;
  --accent-foreground: 220 8.9% 46.1%;
  --background: 0 0% 100%;
  --foreground: 220 8.9% 46.1%;
  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220 8.9% 46.1%;
  --border: 220 13% 91%;
  --card: 0 0% 100%;
  --card-foreground: 220 8.9% 46.1%;
}

.theme-modern {
  @apply bg-gradient-to-br from-blue-50 to-indigo-100;
}

.component-card {
  @apply bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl;
}

.button-primary {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200;
}`,
      'backend-dev': `// server/api.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoints
app.get('/api/data', (req, res) => {
  res.json({
    message: 'API funcionando',
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]
  });
});

app.post('/api/data', (req, res) => {
  const { name } = req.body;
  res.json({
    message: 'Dados recebidos',
    id: Date.now(),
    name
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Servidor rodando na porta \${PORT}\`);
});`,
      'qa-engineer': `// tests/App.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Component', () => {
  it('renders main content', () => {
    render(<App />);
    expect(screen.getByText('Aplicação Funcional')).toBeInTheDocument();
  });

  it('handles button click', () => {
    render(<App />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toBeInTheDocument();
  });

  it('has responsive design', () => {
    render(<App />);
    const container = screen.getByRole('main') || document.querySelector('.min-h-screen');
    expect(container).toHaveClass('min-h-screen');
  });
});`
    };

    return codeTemplates[role as keyof typeof codeTemplates] || this.generateFallbackResponse(prompt, role);
  }

  private generateFallbackResponse(prompt: string, role: string): string {
    const responses = {
      'product-manager': `# Documento de Requisitos do Produto (PRD)

## Visão Geral
${prompt.includes('projeto') ? 'Este projeto visa criar uma solução inovadora que atenda às necessidades dos usuários.' : 'Funcionalidade analisada e aprovada para desenvolvimento.'}

## Objetivos
- Entregar valor aos usuários
- Manter alta qualidade
- Garantir escalabilidade

## Requisitos Funcionais
1. Interface intuitiva
2. Performance otimizada
3. Segurança implementada

## Cronograma
- Fase 1: Planejamento (1 semana)
- Fase 2: Desenvolvimento (2-3 semanas)
- Fase 3: Testes e Deploy (1 semana)`,
      
      'copywriter': `# Conteúdo do Projeto

## Título Principal
Solução Inovadora para suas Necessidades

## Descrição
Uma aplicação moderna e eficiente que resolve problemas reais dos usuários.

## Benefícios
- ✅ Fácil de usar
- ✅ Interface moderna
- ✅ Performance otimizada
- ✅ Suporte completo

## Call to Action
Experimente agora e transforme sua experiência!`,

      'system-analyst': `# Análise de Sistema

## Arquitetura
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Banco de dados: PostgreSQL
- Deploy: Vercel/Netlify

## Fluxo de Dados
1. Interface do usuário
2. Processamento no frontend
3. API calls para backend
4. Persistência de dados

## Segurança
- Autenticação JWT
- Validação de entrada
- HTTPS obrigatório
- Rate limiting`
    };

    const roleResponses = responses[role as keyof typeof responses] || 
      `# Arquivo gerado para ${role}

Este arquivo foi criado automaticamente pelo sistema de agentes.

## Conteúdo
- Implementação específica para ${role}
- Código funcional e documentado
- Seguindo melhores práticas

## Próximos passos
1. Revisar implementação
2. Testar funcionalidades
3. Integrar com sistema`;

    return roleResponses;
  }

  public getAvailableProviders(): { name: string; hasKey: boolean }[] {
    return this.providers.map(provider => ({
      name: provider.name,
      hasKey: !!this.getApiKey(provider.name)
    }));
  }
}

export const aiService = new AIService();