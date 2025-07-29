import { Agent, Project, AgentRole } from '@/types/agent';
import { aiService } from './AIService';

export interface ProjectFile {
  name: string;
  content: string;
  type: 'code' | 'documentation' | 'config' | 'design';
  path: string;
}

class FileGeneratorService {
  private getRolePrompts(role: AgentRole, projectName: string, description: string): string[] {
    const baseContext = `Projeto: ${projectName}\nDescrição: ${description}`;
    
    const rolePrompts: Record<AgentRole, string[]> = {
      'product-manager': [
        `${baseContext}\n\nCrie um PRD (Product Requirements Document) completo em markdown com: objetivos, público-alvo, requisitos funcionais, não-funcionais, user stories e cronograma.`,
        `${baseContext}\n\nCrie um README.md profissional com: descrição do projeto, tecnologias, instalação, uso e contribuição.`
      ],
      'developer': [
        `${baseContext}\n\nCrie um arquivo App.tsx completo em React com TypeScript, incluindo componentes funcionais, hooks e estrutura moderna.`,
        `${baseContext}\n\nCrie um package.json com todas as dependências necessárias, scripts de build, test e deploy.`,
        `${baseContext}\n\nCrie um arquivo de configuração vite.config.ts otimizado para produção.`
      ],
      'frontend-dev': [
        `${baseContext}\n\nCrie componentes React modernos com TypeScript e hooks.`,
        `${baseContext}\n\nCrie interfaces responsivas com Tailwind CSS.`
      ],
      'designer': [
        `${baseContext}\n\nCrie um arquivo CSS/SCSS com design system completo: cores, tipografia, espaçamentos, componentes.`,
        `${baseContext}\n\nCrie um guia de estilo em markdown com paleta de cores, fontes e diretrizes de UI/UX.`
      ],
      'backend-dev': [
        `${baseContext}\n\nCrie um servidor Express.js completo com rotas, middleware, autenticação e conexão com banco.`,
        `${baseContext}\n\nCrie um arquivo de configuração docker-compose.yml para ambiente de desenvolvimento.`
      ],
      'qa-engineer': [
        `${baseContext}\n\nCrie testes unitários Jest/Testing Library completos para componentes principais.`,
        `${baseContext}\n\nCrie testes E2E com Playwright/Cypress para fluxos críticos da aplicação.`
      ],
      'copywriter': [
        `${baseContext}\n\nCrie um arquivo de conteúdo com todos os textos da interface: títulos, botões, mensagens de erro/sucesso.`,
        `${baseContext}\n\nCrie documentação de onboarding e help para usuários finais.`
      ],
      'creative-writer': [
        `${baseContext}\n\nCrie narrativas envolventes e storytelling para o projeto.`,
        `${baseContext}\n\nCrie conteúdo criativo e copy persuasivo.`
      ],
      'system-analyst': [
        `${baseContext}\n\nCrie diagramas de arquitetura e documentação técnica em markdown.`,
        `${baseContext}\n\nCrie especificação de APIs REST com endpoints, parâmetros e respostas.`
      ],
      'financial-analyst': [
        `${baseContext}\n\nCrie análise de custos e ROI do projeto em formato de planilha (CSV).`,
        `${baseContext}\n\nCrie relatório de métricas e KPIs para acompanhamento do projeto.`
      ],
      'game-analyst': [
        `${baseContext}\n\nCrie mecânicas de gamificação e análise de engajamento.`,
        `${baseContext}\n\nCrie documentação de game design e balanceamento.`
      ],
      'philosopher': [
        `${baseContext}\n\nCrie reflexões filosóficas sobre o impacto do projeto.`,
        `${baseContext}\n\nCrie análise ética e social da solução proposta.`
      ],
      'director': [
        `${baseContext}\n\nCrie visão estratégica e direcionamento executivo.`,
        `${baseContext}\n\nCrie planejamento de roadmap e decisões de produto.`
      ],
      'seo-specialist': [
        `${baseContext}\n\nCrie arquivo robots.txt e sitemap.xml otimizados para SEO.`,
        `${baseContext}\n\nCrie meta tags e structured data para melhor indexação.`
      ]
    };

    return rolePrompts[role] || [`${baseContext}\n\nCrie documentação relevante para ${role}.`];
  }

  async generateFilesForAgent(agent: Agent, project: Project): Promise<ProjectFile[]> {
    const prompts = this.getRolePrompts(agent.role, project.name, project.description);
    const files: ProjectFile[] = [];

    for (const prompt of prompts) {
      try {
        const response = await aiService.generateResponse(prompt, agent.role);
        
        // Determine file properties based on content
        const fileName = this.extractFileName(response.content, agent.role);
        const fileType = this.determineFileType(fileName, agent.role);
        const filePath = this.generateFilePath(fileName, agent.role);

        files.push({
          name: fileName,
          content: this.cleanContent(response.content),
          type: fileType,
          path: filePath
        });

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating file for ${agent.role}:`, error);
      }
    }

    return files;
  }

  private extractFileName(content: string, role: AgentRole): string {
    // Try to extract filename from content
    const fileNameMatch = content.match(/(?:filename:|file:|nome:|arquivo:)\s*([^\n\r]+)/i);
    if (fileNameMatch) {
      return fileNameMatch[1].trim();
    }

    // Default filenames based on role
    const defaultNames: Record<AgentRole, string[]> = {
      'product-manager': ['PRD.md', 'README.md'],
      'developer': ['App.tsx', 'package.json', 'vite.config.ts'],
      'frontend-dev': ['components.tsx', 'hooks.ts'],
      'designer': ['styles.css', 'design-system.md'],
      'backend-dev': ['server.js', 'docker-compose.yml'],
      'qa-engineer': ['tests.test.tsx', 'e2e.spec.ts'],
      'copywriter': ['content.json', 'user-guide.md'],
      'creative-writer': ['story.md', 'narrative.md'],
      'system-analyst': ['architecture.md', 'api-spec.md'],
      'financial-analyst': ['budget.csv', 'metrics.md'],
      'game-analyst': ['gameplay.md', 'mechanics.md'],
      'philosopher': ['ethics.md', 'philosophy.md'],
      'director': ['strategy.md', 'vision.md'],
      'seo-specialist': ['robots.txt', 'sitemap.xml']
    };

    const names = defaultNames[role] || ['document.md'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private determineFileType(fileName: string, role: AgentRole): ProjectFile['type'] {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.js') || fileName.endsWith('.json')) {
      return 'code';
    }
    if (fileName.endsWith('.css') || fileName.endsWith('.scss')) {
      return 'design';
    }
    if (fileName.endsWith('.yml') || fileName.endsWith('.yaml') || fileName.endsWith('.xml') || fileName.endsWith('.txt')) {
      return 'config';
    }
    return 'documentation';
  }

  private generateFilePath(fileName: string, role: AgentRole): string {
    const rolePaths: Record<AgentRole, string> = {
      'product-manager': 'docs/',
      'developer': 'src/',
      'frontend-dev': 'src/components/',
      'designer': 'src/styles/',
      'backend-dev': 'server/',
      'qa-engineer': 'tests/',
      'copywriter': 'content/',
      'creative-writer': 'content/creative/',
      'system-analyst': 'docs/architecture/',
      'financial-analyst': 'docs/financial/',
      'game-analyst': 'docs/game/',
      'philosopher': 'docs/philosophy/',
      'director': 'docs/strategy/',
      'seo-specialist': 'public/'
    };

    return (rolePaths[role] || 'docs/') + fileName;
  }

  private cleanContent(content: string): string {
    // Remove AI response prefixes and clean up content
    return content
      .replace(/^(AI|Assistant|Response|Output):\s*/gm, '')
      .replace(/^```[\w]*\n?/gm, '')
      .replace(/\n?```$/gm, '')
      .trim();
  }

  async generateProjectZip(project: Project, files: ProjectFile[]): Promise<Blob> {
    // Using JSZip for client-side ZIP generation
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add project metadata
    zip.file('project.json', JSON.stringify({
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      phases: project.phases.map(p => ({
        name: p.name,
        status: p.status,
        progress: p.progress,
        deliverables: p.deliverables
      }))
    }, null, 2));

    // Add all generated files
    files.forEach(file => {
      zip.file(file.path, file.content);
    });

    // Generate and return ZIP blob
    return await zip.generateAsync({ type: 'blob' });
  }

  downloadZip(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const fileGeneratorService = new FileGeneratorService();