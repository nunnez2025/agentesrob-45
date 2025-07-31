import { Agent, Project, AgentRole } from '@/types/agent';
import { aiService } from './AIService';

export interface ProjectFile {
  name: string;
  content: string;
  type: 'code' | 'documentation' | 'config' | 'design';
  path: string;
}

class FileGeneratorService {
  // Analisar descrição EXATAMENTE como pedida - modo ULTRA-RESTRITIVO
  private analyzeProjectDescription(description: string): {
    requestedTechnologies: string[];
    specificFiles: string[];
    exactRequirements: string[];
    allowedAgentRoles: AgentRole[];
  } {
    const lowerDesc = description.toLowerCase();
    
    // Detectar APENAS tecnologias EXPLICITAMENTE mencionadas - sem inferências
    const techMentions = {
      'html': ['html', 'html5', '.html'],
      'css': ['css', 'css3', '.css'],
      'javascript': ['javascript', 'js', '.js'],
      'typescript': ['typescript', 'ts', '.ts'],
      'react': ['react', 'reactjs', '.jsx', '.tsx'],
      'vue': ['vue', 'vuejs', '.vue'],
      'angular': ['angular', 'angularjs'],
      'nodejs': ['node', 'nodejs', 'node.js'],
      'express': ['express', 'expressjs'],
      'python': ['python', '.py'],
      'django': ['django'],
      'flask': ['flask'],
      'php': ['php', '.php'],
      'java': ['java', '.java'],
      'csharp': ['c#', 'csharp', '.cs'],
      'sql': ['sql', 'mysql', 'postgresql', 'sqlite'],
      'mongodb': ['mongodb', 'mongo'],
      'api': ['api', 'rest api', 'restful'],
      'json': ['json', '.json'],
      'bootstrap': ['bootstrap'],
      'tailwind': ['tailwind', 'tailwindcss'],
      'sass': ['sass', 'scss', '.scss'],
      'webpack': ['webpack'],
      'vite': ['vite']
    };

    const requestedTechnologies: string[] = [];
    
    // REGRA ABSOLUTA: Só adicionar se estiver LITERALMENTE na descrição
    Object.entries(techMentions).forEach(([tech, keywords]) => {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        requestedTechnologies.push(tech);
      }
    });

    // Detectar arquivos específicos mencionados
    const fileExtensions = lowerDesc.match(/\.\w+/g) || [];
    const specificFiles = fileExtensions.map(ext => ext.toLowerCase());

    // Extrair requisitos EXATOS da descrição
    const exactRequirements = description.split(/[.,;!?]/).map(req => req.trim()).filter(req => req.length > 0);

    // Mapear APENAS para agentes das tecnologias EXPLICITAMENTE pedidas
    const allowedAgentRoles: AgentRole[] = [];
    
    // HTML PURO
    if (requestedTechnologies.includes('html') && !requestedTechnologies.includes('react') && !requestedTechnologies.includes('vue') && !requestedTechnologies.includes('angular')) {
      allowedAgentRoles.push('frontend-dev');
    }
    
    // CSS PURO
    if (requestedTechnologies.includes('css') && !requestedTechnologies.includes('react')) {
      allowedAgentRoles.push('designer');
    }
    
    // JAVASCRIPT PURO (sem frameworks)
    if (requestedTechnologies.includes('javascript') && !requestedTechnologies.includes('react') && !requestedTechnologies.includes('vue') && !requestedTechnologies.includes('angular')) {
      allowedAgentRoles.push('frontend-dev');
    }
    
    // REACT ESPECÍFICO
    if (requestedTechnologies.includes('react')) {
      allowedAgentRoles.push('react-dev');
    }
    
    // NODEJS ESPECÍFICO
    if (requestedTechnologies.includes('nodejs') || requestedTechnologies.includes('express')) {
      allowedAgentRoles.push('nodejs-dev');
    }
    
    // PYTHON ESPECÍFICO
    if (requestedTechnologies.includes('python') || requestedTechnologies.includes('django') || requestedTechnologies.includes('flask')) {
      allowedAgentRoles.push('python-dev');
    }
    
    // BANCO DE DADOS ESPECÍFICO
    if (requestedTechnologies.includes('sql') || requestedTechnologies.includes('mongodb')) {
      allowedAgentRoles.push('database-dev');
    }
    
    // API ESPECÍFICA
    if (requestedTechnologies.includes('api')) {
      allowedAgentRoles.push('api-dev');
    }

    // Se NENHUMA tecnologia específica foi mencionada, APENAS documentação básica
    if (requestedTechnologies.length === 0) {
      allowedAgentRoles.push('product-manager');
    }

    return {
      requestedTechnologies,
      specificFiles,
      exactRequirements,
      allowedAgentRoles
    };
  }

  // Sistema ULTRA CRIATIVO mas RESTRITIVO em linguagem
  private getFilteredPrompts(role: AgentRole, projectName: string, description: string, analysis: {
    requestedTechnologies: string[];
    specificFiles: string[];
    exactRequirements: string[];
    allowedAgentRoles: AgentRole[];
  }): string[] {
    
    // BLOQUEIO TOTAL: Se agente não permitido = ZERO prompts
    if (!analysis.allowedAgentRoles.includes(role)) {
      return [];
    }

    const ultraCreativeContext = `PROJETO: ${projectName}
DESCRIÇÃO: "${description}"
TECNOLOGIA SOLICITADA: ${analysis.requestedTechnologies[0] || 'NENHUMA'}

🎨 SEJA ULTRA CRIATIVO E INOVADOR DENTRO DAS LIMITAÇÕES:
1. Use TODA sua criatividade na linguagem solicitada
2. Crie código elegante, moderno e bem estruturado
3. Implemente as melhores práticas da linguagem
4. Use nomenclatura criativa e comentários úteis
5. Crie funcionalidades impressionantes dentro do escopo
6. LIMITE ABSOLUTO: Apenas a linguagem/tecnologia pedida
7. SEM outras tecnologias além da solicitada
8. Máximo potencial criativo na linguagem especificada`;

    const creativeLimitedPrompts: string[] = [];

    // SE PEDIU HTML → HTML PURO ULTRA CRIATIVO
    if (analysis.requestedTechnologies.includes('html') && role === 'frontend-dev') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um index.html ESPETACULAR com:
- HTML5 semântico e moderno
- Estrutura criativa e bem organizada
- Uso inteligente de elementos HTML5 (sections, articles, aside, nav, etc.)
- Formulários interativos se relevante
- Meta tags otimizadas
- Acessibilidade (ARIA, alt texts, etc.)
- SEM CSS interno - APENAS HTML puro
- SEM JavaScript interno
- Use toda criatividade possível em HTML puro
- Comentários explicativos criativos

SEJA O MESTRE DO HTML! Crie o HTML mais impressionante e criativo possível para: ${description}`);
    }

    // SE PEDIU CSS → CSS PURO ULTRA CRIATIVO
    else if (analysis.requestedTechnologies.includes('css') && role === 'designer') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um styles.css DESLUMBRANTE com:
- Design system completo (variáveis CSS custom properties)
- Animações e transições elegantes
- Layouts modernos (Grid, Flexbox)
- Responsividade perfeita
- Hover effects criativos
- Gradientes e sombras artísticas
- Tipografia harmoniosa
- Paleta de cores profissional
- Micro-interações em CSS puro
- SEM frameworks externos
- Comentários organizacionais
- Arquitetura CSS bem estruturada

SEJA O MESTRE DO CSS! Crie o CSS mais visual e impressionante para: ${description}`);
    }

    // SE PEDIU JAVASCRIPT → JS VANILLA ULTRA CRIATIVO
    else if (analysis.requestedTechnologies.includes('javascript') && role === 'frontend-dev') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um script.js GENIAL com:
- JavaScript ES6+ moderno
- Funções criativas e úteis
- Classes bem estruturadas
- Event listeners inteligentes
- Manipulação DOM elegante
- Algoritmos eficientes
- Pattern matching criativo
- Local Storage se apropriado
- Validações inteligentes
- SEM bibliotecas externas
- SEM imports/requires
- Comentários educativos
- Código limpo e performático

SEJA O MESTRE DO JAVASCRIPT! Crie o JS mais funcional e criativo para: ${description}`);
    }

    // SE PEDIU REACT → COMPONENTE REACT ULTRA CRIATIVO
    else if (analysis.requestedTechnologies.includes('react') && role === 'react-dev') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um App.jsx REVOLUCIONÁRIO com:
- Componente React moderno e funcional
- Hooks criativos (useState, useEffect, useCallback, useMemo)
- Custom hooks se apropriado
- Context API se necessário
- Conditional rendering inteligente
- Event handling sofisticado
- State management elegante
- Props drilling evitado
- Performance optimizations
- SEM bibliotecas externas (apenas React)
- Comentários explicativos
- Código limpo e reutilizável

SEJA O MESTRE DO REACT! Crie o componente React mais funcional e elegante para: ${description}`);
    }

    // SE PEDIU PYTHON → PYTHON ULTRA CRIATIVO
    else if (analysis.requestedTechnologies.includes('python') && role === 'python-dev') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um main.py BRILHANTE com:
- Python 3.8+ moderno
- Classes bem estruturadas
- Decorators criativos
- List/Dict comprehensions elegantes
- Context managers se apropriado
- Exception handling inteligente
- Type hints para clareza
- Docstrings informativos
- Algoritmos eficientes
- Design patterns apropriados
- SEM bibliotecas externas (apenas stdlib)
- Código pythônico e limpo
- Estrutura modular

SEJA O MESTRE DO PYTHON! Crie o código Python mais elegante e funcional para: ${description}`);
    }

    // SE PEDIU JAVA → JAVA ULTRA CRIATIVO
    else if (analysis.requestedTechnologies.includes('java') && role === 'developer') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um Main.java PODEROSO com:
- Classe Java moderna e bem estruturada
- Design patterns criativos
- Exception handling elegante
- Documentação JavaDoc completa
- Métodos utilitários inteligentes
- Encapsulamento perfeito
- SEM bibliotecas externas
- Código limpo e eficiente

SEJA O MESTRE DO JAVA! Crie a classe Java mais elegante para: ${description}`);
    }

    // SE NENHUMA LINGUAGEM → README ULTRA CRIATIVO
    else if (analysis.requestedTechnologies.length === 0 && role === 'product-manager') {
      creativeLimitedPrompts.push(`${ultraCreativeContext}

MISSÃO CRIATIVA: Crie um README.md ESPETACULAR com:
- Título impactante
- Descrição envolvente
- Emojis criativos
- Badges profissionais
- Estrutura bem organizada
- Seções bem definidas
- Call-to-actions interessantes
- Formatação markdown criativa
- SEM informações técnicas de implementação
- Foco na experiência do usuário

SEJA O MESTRE DA DOCUMENTAÇÃO! Crie o README mais atrativo para: ${description}`);
    }

    return creativeLimitedPrompts;
  }

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
      ],
      'ai-specialist': [
        `${baseContext}\n\nCrie modelos de IA e algoritmos de machine learning em Python.`,
        `${baseContext}\n\nCrie pipeline de treinamento e avaliação de modelos com TensorFlow/PyTorch.`
      ],
      'ml-engineer': [
        `${baseContext}\n\nCrie infraestrutura MLOps com Docker, Kubernetes e pipeline CI/CD.`,
        `${baseContext}\n\nCrie APIs de modelo de ML com FastAPI e monitoramento.`
      ],
      'data-scientist': [
        `${baseContext}\n\nCrie análise exploratória de dados com Pandas e visualizações.`,
        `${baseContext}\n\nCrie notebooks Jupyter com análise estatística e insights.`
      ],
      'python-dev': [
        `${baseContext}\n\nCrie aplicação Python com Flask/Django e estrutura clean code.`,
        `${baseContext}\n\nCrie scripts de automação e processamento de dados.`
      ],
      'react-dev': [
        `${baseContext}\n\nCrie aplicação React completa com hooks, context e estado global.`,
        `${baseContext}\n\nCrie componentes reutilizáveis e otimizados para performance.`
      ],
      'nodejs-dev': [
        `${baseContext}\n\nCrie API REST com Node.js, Express e autenticação JWT.`,
        `${baseContext}\n\nCrie microserviços com arquitetura escalável.`
      ],
      'mobile-dev': [
        `${baseContext}\n\nCrie aplicativo mobile com React Native e navegação.`,
        `${baseContext}\n\nCrie integração com APIs nativas e push notifications.`
      ],
      'devops': [
        `${baseContext}\n\nCrie pipeline CI/CD com GitHub Actions e deployment automático.`,
        `${baseContext}\n\nCrie infraestrutura como código com Terraform/CloudFormation.`
      ],
      'security-engineer': [
        `${baseContext}\n\nCrie análise de segurança e implementação de protocolos.`,
        `${baseContext}\n\nCrie testes de penetração e relatórios de vulnerabilidade.`
      ],
      'blockchain-dev': [
        `${baseContext}\n\nCrie smart contracts em Solidity e Web3 integration.`,
        `${baseContext}\n\nCrie DApp completo com frontend e blockchain backend.`
      ],
      'fullstack-dev': [
        `${baseContext}\n\nCrie aplicação full-stack com frontend React e backend Node.js.`,
        `${baseContext}\n\nCrie arquitetura completa com banco de dados e deploy.`
      ],
      'api-dev': [
        `${baseContext}\n\nCrie API RESTful completa com documentação OpenAPI/Swagger.`,
        `${baseContext}\n\nCrie GraphQL API com resolvers e schema otimizado.`
      ],
      'database-dev': [
        `${baseContext}\n\nCrie esquema de banco de dados SQL/NoSQL otimizado.`,
        `${baseContext}\n\nCrie queries complexas e procedures para performance.`
      ],
      'cloud-architect': [
        `${baseContext}\n\nCrie arquitetura cloud AWS/Azure com escalabilidade.`,
        `${baseContext}\n\nCrie configuração de serviços serverless e containers.`
      ],
      'code-reviewer': [
        `${baseContext}\n\nCrie review de código com análise de qualidade e sugestões.`,
        `${baseContext}\n\nCrie documentação de boas práticas e padrões de código.`
      ],
      'performance-optimizer': [
        `${baseContext}\n\nCrie análise de performance e otimizações de código.`,
        `${baseContext}\n\nCrie monitoramento e métricas de aplicação em produção.`
      ]
    };

    return rolePrompts[role] || [`${baseContext}\n\nCrie documentação relevante para ${role}.`];
  }

  async generateFilesForAgent(agent: Agent, project: Project): Promise<ProjectFile[]> {
    // Analisar descrição do projeto para identificar requisitos específicos
    const analysis = this.analyzeProjectDescription(project.description);
    
    // Filtrar prompts baseados na análise da descrição
    const prompts = this.getFilteredPrompts(agent.role, project.name, project.description, analysis);
    
    // Paralelizar as chamadas à API de IA para melhor performance
    const results = await Promise.allSettled(prompts.map(prompt =>
      aiService.generateResponse(prompt, agent.role)
    ));

    const files: ProjectFile[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const response = result.value;
        const fileName = this.extractFileName(response.content, agent.role);
        const fileType = this.determineFileType(fileName, agent.role);
        const filePath = this.generateFilePath(fileName, agent.role);
        
        files.push({
          name: fileName,
          content: this.cleanContent(response.content),
          type: fileType,
          path: filePath
        });
      } else {
        console.error(`Falha ao gerar arquivo para o prompt ${index}:`, result.status === 'rejected' ? result.reason : 'Erro desconhecido');
      }
    });

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
      'frontend-dev': ['index.html', 'styles.css'],
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
      'seo-specialist': ['robots.txt', 'sitemap.xml'],
      'ai-specialist': ['ai_model.py', 'training_pipeline.py'],
      'ml-engineer': ['mlops_config.yml', 'model_api.py'],
      'data-scientist': ['data_analysis.ipynb', 'insights.py'],
      'python-dev': ['main.py', 'requirements.txt'],
      'react-dev': ['components.tsx', 'hooks.ts'],
      'nodejs-dev': ['server.js', 'api.js'],
      'mobile-dev': ['App.tsx', 'navigation.tsx'],
      'devops': ['ci-cd.yml', 'infrastructure.tf'],
      'security-engineer': ['security_audit.md', 'pentest.py'],
      'blockchain-dev': ['contract.sol', 'dapp.js'],
      'fullstack-dev': ['fullstack_app.tsx', 'backend.js'],
      'api-dev': ['api_spec.yml', 'endpoints.js'],
      'database-dev': ['schema.sql', 'queries.sql'],
      'cloud-architect': ['cloud_architecture.yml', 'serverless.yml'],
      'code-reviewer': ['code_review.md', 'standards.md'],
      'performance-optimizer': ['performance_analysis.md', 'optimization.js']
    };

    const names = defaultNames[role] || ['document.md'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private determineFileType(fileName: string, role: AgentRole): ProjectFile['type'] {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.js') || fileName.endsWith('.json')) {
      return 'code';
    }
    if (fileName.endsWith('.css') || fileName.endsWith('.scss') || fileName.endsWith('.html')) {
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
      'frontend-dev': '',
      'designer': 'assets/',
      'backend-dev': 'server/',
      'qa-engineer': 'tests/',
      'copywriter': 'content/',
      'creative-writer': 'content/creative/',
      'system-analyst': 'docs/architecture/',
      'financial-analyst': 'docs/financial/',
      'game-analyst': 'docs/game/',
      'philosopher': 'docs/philosophy/',
      'director': 'docs/strategy/',
      'seo-specialist': 'public/',
      'ai-specialist': 'ai/',
      'ml-engineer': 'ml/',
      'data-scientist': 'data/',
      'python-dev': 'python/',
      'react-dev': 'src/components/',
      'nodejs-dev': 'backend/',
      'mobile-dev': 'mobile/',
      'devops': 'ops/',
      'security-engineer': 'security/',
      'blockchain-dev': 'blockchain/',
      'fullstack-dev': 'fullstack/',
      'api-dev': 'api/',
      'database-dev': 'database/',
      'cloud-architect': 'cloud/',
      'code-reviewer': 'reviews/',
      'performance-optimizer': 'performance/'
    };

    return rolePaths[role] || 'docs/';
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
      const fullPath = file.path + file.name;
      zip.file(fullPath, file.content);
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