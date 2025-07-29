interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  category: 'text-generation' | 'code-generation' | 'text-classification' | 'image-generation' | 'speech-recognition';
  endpoint: string;
}

class HuggingFaceService {
  private models: HuggingFaceModel[] = [
    {
      id: 'microsoft/DialoGPT-medium',
      name: 'DialoGPT Medium',
      description: 'Modelo conversacional para chat',
      category: 'text-generation',
      endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium'
    },
    {
      id: 'codellama/CodeLlama-7b-Python-hf',
      name: 'CodeLlama Python',
      description: 'Modelo especializado em código Python',
      category: 'code-generation',
      endpoint: 'https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Python-hf'
    },
    {
      id: 'microsoft/CodeT5p-770M-py',
      name: 'CodeT5 Python',
      description: 'Modelo para geração e compreensão de código',
      category: 'code-generation',
      endpoint: 'https://api-inference.huggingface.co/models/microsoft/CodeT5p-770M-py'
    },
    {
      id: 'bigcode/starcoder',
      name: 'StarCoder',
      description: 'Modelo de código multi-linguagem',
      category: 'code-generation',
      endpoint: 'https://api-inference.huggingface.co/models/bigcode/starcoder'
    },
    {
      id: 'WizardLM/WizardCoder-Python-7B-V1.0',
      name: 'WizardCoder Python',
      description: 'Modelo especializado para coding em Python',
      category: 'code-generation',
      endpoint: 'https://api-inference.huggingface.co/models/WizardLM/WizardCoder-Python-7B-V1.0'
    },
    {
      id: 'runwayml/stable-diffusion-v1-5',
      name: 'Stable Diffusion',
      description: 'Geração de imagens a partir de texto',
      category: 'image-generation',
      endpoint: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5'
    },
    {
      id: 'openai/whisper-small',
      name: 'Whisper Small',
      description: 'Reconhecimento de fala',
      category: 'speech-recognition',
      endpoint: 'https://api-inference.huggingface.co/models/openai/whisper-small'
    }
  ];

  async generateCode(prompt: string, language: string = 'python'): Promise<string> {
    const codeModels = this.models.filter(m => m.category === 'code-generation');
    
    for (const model of codeModels) {
      try {
        const response = await fetch(model.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `# ${language.toUpperCase()} CODE\n# Task: ${prompt}\n\n`,
            parameters: {
              max_length: 512,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.95
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
          
          if (generatedText) {
            // Clean the response to extract only the code
            const codeStart = generatedText.indexOf('\n\n');
            return codeStart > -1 ? generatedText.substring(codeStart + 2) : generatedText;
          }
        }
      } catch (error) {
        console.warn(`Model ${model.name} failed:`, error);
        continue;
      }
    }

    return `# Generated code for: ${prompt}\n# No models available at the moment, please try again later`;
  }

  async generateImage(prompt: string): Promise<Blob | null> {
    const imageModels = this.models.filter(m => m.category === 'image-generation');
    
    for (const model of imageModels) {
      try {
        const response = await fetch(model.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 50
            }
          }),
        });

        if (response.ok) {
          return await response.blob();
        }
      } catch (error) {
        console.warn(`Image model ${model.name} failed:`, error);
        continue;
      }
    }

    return null;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const speechModels = this.models.filter(m => m.category === 'speech-recognition');
    
    for (const model of speechModels) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob);

        const response = await fetch(model.endpoint, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.text || 'Transcrição não disponível';
        }
      } catch (error) {
        console.warn(`Speech model ${model.name} failed:`, error);
        continue;
      }
    }

    return 'Transcrição não disponível no momento';
  }

  getAvailableModels(): HuggingFaceModel[] {
    return this.models;
  }

  getModelsByCategory(category: HuggingFaceModel['category']): HuggingFaceModel[] {
    return this.models.filter(m => m.category === category);
  }
}

export const huggingFaceService = new HuggingFaceService();