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
        model: 'gpt-4',
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
        max_tokens: 1000
      }),
      parseResponse: (response: any) => response.choices[0]?.message?.content || 'Resposta não disponível'
    },
    {
      name: 'Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
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
          maxOutputTokens: 1000
        }
      }),
      parseResponse: (response: any) => response.candidates[0]?.content?.parts[0]?.text || 'Resposta não disponível'
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

  public async generateResponse(prompt: string, agentRole: string): Promise<AIResponse> {
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

    // Try public APIs
    try {
      const publicResponse = await this.tryPublicAPIs(prompt, agentRole);
      if (publicResponse.success) {
        return publicResponse;
      }
    } catch (error) {
      console.warn('Public APIs failed:', error);
    }

    // Fallback to Hugging Face (free)
    return await this.callHuggingFace(prompt, agentRole);
  }

  private async callProvider(provider: AIProvider, prompt: string, role: string, apiKey: string): Promise<AIResponse> {
    const url = provider.name === 'Gemini' 
      ? `${provider.endpoint}?key=${apiKey}`
      : provider.endpoint;

    const response = await fetch(url, {
      method: 'POST',
      headers: provider.headers(apiKey),
      body: JSON.stringify(provider.formatRequest(prompt, role)),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = provider.parseResponse(data);

    return {
      success: true,
      content,
      provider: provider.name
    };
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

  private generateFallbackResponse(prompt: string, role: string): string {
    const responses = {
      'product-manager': [
        'Analisando os requisitos do projeto. Vou coordenar com a equipe para implementar essa funcionalidade.',
        'Ótima solicitação! Isso se alinha com os objetivos do produto. Priorizando para o próximo sprint.',
        'Entendido. Vou atualizar o roadmap e comunicar as mudanças para todos os stakeholders.'
      ],
      'developer': [
        'Implementando a funcionalidade solicitada. Estimativa: 2-3 horas de desenvolvimento.',
        'Código em progresso. Utilizando as melhores práticas e padrões estabelecidos.',
        'Desenvolvimento concluído. Iniciando testes unitários e integração.'
      ],
      'designer': [
        'Criando wireframes e protótipos para a nova funcionalidade.',
        'Design focado na experiência do usuário. Seguindo o design system estabelecido.',
        'Prototipando interações e validando usabilidade com a equipe.'
      ]
    };

    const roleResponses = responses[role as keyof typeof responses] || responses['developer'];
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  public getAvailableProviders(): { name: string; hasKey: boolean }[] {
    return this.providers.map(provider => ({
      name: provider.name,
      hasKey: !!this.getApiKey(provider.name)
    }));
  }
}

export const aiService = new AIService();