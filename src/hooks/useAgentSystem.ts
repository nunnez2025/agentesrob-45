import { useState, useCallback, useEffect } from 'react';
import { Agent, Message, Project, ProjectPhase, AgentRole } from '@/types/agent';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/AIService';
import { fileGeneratorService, ProjectFile } from '@/services/FileGeneratorService';

const createAgent = (id: string, name: string, role: AgentRole, expertise: string[]): Agent => ({
  id,
  name,
  role,
  avatar: '',
  status: 'available',
  expertise,
  color: '#000',
});

const initialAgents: Agent[] = [
  createAgent('pm-001', 'Ana Clara', 'product-manager', ['Estratégia', 'Roadmap', 'Stakeholders']),
  createAgent('dev-001', 'Carlos Santos', 'developer', ['React', 'TypeScript', 'Node.js']),
  createAgent('des-001', 'Marina Silva', 'designer', ['UI/UX', 'Figma', 'Design System']),
  createAgent('back-001', 'Roberto Lima', 'backend-dev', ['Python', 'API', 'Database']),
  createAgent('qa-001', 'Fernanda Costa', 'qa-engineer', ['Testing', 'Automation', 'Quality']),
  createAgent('copy-001', 'Juliana Oliveira', 'copywriter', ['Content', 'UX Writing', 'Brand']),
  createAgent('sys-001', 'Miguel Torres', 'system-analyst', ['Architecture', 'Requirements', 'Analysis']),
  createAgent('fin-001', 'Patricia Rocha', 'financial-analyst', ['Budget', 'ROI', 'Costs']),
  createAgent('seo-001', 'Lucas Ferreira', 'seo-specialist', ['SEO', 'Analytics', 'Content Strategy'])
];

export const useAgentSystem = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const { toast } = useToast();

  const createProject = useCallback((name: string, description: string) => {
    const phases: ProjectPhase[] = [
      {
        id: 'phase-1',
        name: 'Planejamento e Análise',
        status: 'in-progress',
        assignedAgents: ['pm-001', 'sys-001', 'fin-001'],
        deliverables: ['PRD', 'Análise de Requisitos', 'Orçamento'],
        progress: 20
      },
      {
        id: 'phase-2',
        name: 'Design e Prototipação',
        status: 'pending',
        assignedAgents: ['des-001', 'copy-001'],
        deliverables: ['Wireframes', 'UI Design', 'Protótipo'],
        progress: 0
      },
      {
        id: 'phase-3',
        name: 'Desenvolvimento',
        status: 'pending',
        assignedAgents: ['dev-001', 'back-001'],
        deliverables: ['Frontend', 'Backend', 'Integração'],
        progress: 0
      },
      {
        id: 'phase-4',
        name: 'Testes e Qualidade',
        status: 'pending',
        assignedAgents: ['qa-001'],
        deliverables: ['Testes Automatizados', 'QA Report'],
        progress: 0
      },
      {
        id: 'phase-5',
        name: 'SEO e Otimização',
        status: 'pending',
        assignedAgents: ['seo-001'],
        deliverables: ['SEO Strategy', 'Performance Optimization'],
        progress: 0
      }
    ];

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      status: 'planning',
      phases,
      agents: initialAgents,
      messages: [],
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedByUser: false
    };

    setProject(newProject);
    
    // Initial system message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Projeto "${name}" iniciado! Os agentes estão se organizando para começar o trabalho. Você pode interagir comigo a qualquer momento para acompanhar o progresso ou dar direcionamentos.`,
      timestamp: new Date(),
      agentId: 'system',
      type: 'message'
    };
    
    setMessages([welcomeMessage]);
    
    toast({
      title: "Projeto Criado!",
      description: `O projeto "${name}" foi iniciado com sucesso. Os agentes estão prontos para trabalhar.`,
    });

    return newProject;
  }, [toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!project) return;

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      agentId: 'user',
      type: 'message'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Get active agents
      const activeAgents = agents.filter(agent => 
        project.phases.some(phase => 
          phase.status === 'in-progress' && phase.assignedAgents.includes(agent.id)
        )
      );

      // Select responding agent
      const respondingAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)] || agents[0];
      
      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === respondingAgent.id 
          ? { ...agent, status: 'thinking' as const }
          : agent
      ));

      // Get AI response
      const aiResponse = await aiService.generateResponse(content, respondingAgent.role);
      
      const agentResponse: Message = {
        id: Date.now().toString() + '-agent',
        content: aiResponse.content,
        timestamp: new Date(),
        agentId: respondingAgent.id,
        type: 'message'
      };

      setMessages(prev => [...prev, agentResponse]);

      // Update agent status back to available
      setAgents(prev => prev.map(agent => 
        agent.id === respondingAgent.id 
          ? { ...agent, status: 'available' as const }
          : agent
      ));

      // Simulate progress update
      if (Math.random() > 0.3) {
        setProject(prev => {
          if (!prev) return prev;
          
          const updatedPhases = prev.phases.map(phase => {
            if (phase.status === 'in-progress' && Math.random() > 0.5) {
              const newProgress = Math.min(phase.progress + Math.floor(Math.random() * 15) + 5, 100);
              return {
                ...phase,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' as const : phase.status
              };
            }
            return phase;
          });

          return { ...prev, phases: updatedPhases, updatedAt: new Date() };
        });
      }

      // Auto-trigger next agent if needed (continuous work)
      if (activeAgents.length > 1 && Math.random() > 0.6) {
        setTimeout(() => {
          const nextAgent = activeAgents.find(a => a.id !== respondingAgent.id);
          if (nextAgent) {
            const collaborationPrompts = [
              `Baseado na resposta do ${respondingAgent.name}, como você pode contribuir para o projeto?`,
              `O ${respondingAgent.name} acabou de trabalhar. Qual é o próximo passo na sua área?`,
              `Como podemos integrar o trabalho do ${respondingAgent.name} com suas expertise?`
            ];
            
            sendMessage(collaborationPrompts[Math.floor(Math.random() * collaborationPrompts.length)]);
          }
        }, 3000);
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response
      const fallbackResponse: Message = {
        id: Date.now().toString() + '-fallback',
        content: 'Sistema processando sua solicitação. Continuarei trabalhando no projeto.',
        timestamp: new Date(),
        agentId: 'system',
        type: 'message'
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsProcessing(false);
    }
  }, [project, agents]);

  const approveProject = useCallback(() => {
    if (project) {
      setProject(prev => prev ? { ...prev, approvedByUser: true, status: 'completed' } : prev);
      toast({
        title: "Projeto Aprovado!",
        description: "O projeto foi aprovado e está pronto para entrega final.",
      });
    }
  }, [project, toast]);

  const downloadProject = useCallback(async () => {
    if (!project) return;

    toast({
      title: "Download Iniciado",
      description: "O arquivo ZIP do projeto está sendo preparado...",
    });
    
    try {
      // Generate ZIP with real files
      const zipBlob = await fileGeneratorService.generateProjectZip(project, generatedFiles);
      fileGeneratorService.downloadZip(zipBlob, project.name);
      
      toast({
        title: "Download Concluído",
        description: "O projeto foi baixado com sucesso!",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro no Download",
        description: "Ocorreu um erro ao gerar o arquivo ZIP.",
        variant: "destructive"
      });
    }
  }, [project, generatedFiles, toast]);

  const generateReport = useCallback(() => {
    if (!project) return;

    const reportMessage: Message = {
      id: Date.now().toString(),
      content: `📊 RELATÓRIO DO PROJETO "${project.name}"\n\n✅ Fases Concluídas: ${project.phases.filter(p => p.status === 'completed').length}/${project.phases.length}\n📈 Progresso Geral: ${Math.round(project.phases.reduce((acc, phase) => acc + phase.progress, 0) / project.phases.length)}%\n👥 Agentes Ativos: ${project.agents.length}\n📁 Arquivos Gerados: ${project.files.length}\n\nPróximos passos: Finalizar fases pendentes e preparar entrega.`,
      timestamp: new Date(),
      agentId: 'system',
      type: 'report'
    };

    setMessages(prev => [...prev, reportMessage]);
    
    toast({
      title: "Relatório Gerado",
      description: "O relatório completo foi adicionado ao chat.",
    });
  }, [project, toast]);

  // Auto-work system - agents work continuously
  useEffect(() => {
    if (!project || isProcessing) return;

    const autoWorkInterval = setInterval(async () => {
      // Get active agents
      const activeAgents = agents.filter(agent => 
        project.phases.some(phase => 
          phase.status === 'in-progress' && phase.assignedAgents.includes(agent.id)
        )
      );

      if (activeAgents.length === 0) return;

      // Select random active agent to work
      const workingAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      
      // Agent work prompts based on their role
      const workPrompts = {
        'product-manager': [
          'Analisando requisitos e atualizando o roadmap do projeto...',
          'Revisando métricas de progresso e identificando próximos passos...',
          'Validando entregáveis e alinhando expectativas...'
        ],
        'developer': [
          'Implementando nova funcionalidade no código...',
          'Refatorando código para melhor performance...',
          'Corrigindo bugs e otimizando a aplicação...'
        ],
        'designer': [
          'Criando wireframes para nova funcionalidade...',
          'Refinando interface do usuário...',
          'Desenvolvendo sistema de design consistente...'
        ],
        'backend-dev': [
          'Implementando APIs do backend...',
          'Otimizando queries do banco de dados...',
          'Configurando infraestrutura e deploy...'
        ],
        'qa-engineer': [
          'Executando testes automatizados...',
          'Validando funcionalidades implementadas...',
          'Criando cenários de teste para novas features...'
        ],
        'copywriter': [
          'Criando conteúdo para a aplicação...',
          'Revisando textos e melhorando UX writing...',
          'Desenvolvendo estratégia de conteúdo...'
        ],
        'system-analyst': [
          'Analisando arquitetura do sistema...',
          'Documentando requisitos técnicos...',
          'Validando integração entre componentes...'
        ],
        'financial-analyst': [
          'Analisando custos do projeto...',
          'Calculando ROI das funcionalidades...',
          'Otimizando orçamento e recursos...'
        ],
        'seo-specialist': [
          'Otimizando SEO da aplicação...',
          'Analisando performance e métricas...',
          'Implementando estratégias de visibilidade...'
        ]
      };

      const prompts = workPrompts[workingAgent.role] || ['Trabalhando no projeto...'];
      const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      // Update agent status
      setAgents(prev => prev.map(agent => 
        agent.id === workingAgent.id 
          ? { ...agent, status: 'working' as const }
          : agent
      ));

      try {
        // Get AI response for the work
        const aiResponse = await aiService.generateResponse(selectedPrompt, workingAgent.role);
        
        const workMessage: Message = {
          id: Date.now().toString(),
          content: `🔄 **${workingAgent.name}** (${workingAgent.role}): ${aiResponse.content}`,
          timestamp: new Date(),
          agentId: workingAgent.id,
          type: 'message'
        };

        setMessages(prev => [...prev, workMessage]);

        // Generate real files for the agent's work
        if (Math.random() > 0.7) { // 30% chance to generate files
          try {
            const newFiles = await fileGeneratorService.generateFilesForAgent(workingAgent, project);
            setGeneratedFiles(prev => [...prev, ...newFiles]);
            
            if (newFiles.length > 0) {
              const fileMessage: Message = {
                id: Date.now().toString() + '-files',
                content: `📁 **${workingAgent.name}** gerou ${newFiles.length} arquivo(s): ${newFiles.map(f => f.name).join(', ')}`,
                timestamp: new Date(),
                agentId: workingAgent.id,
                type: 'message'
              };
              setMessages(prev => [...prev, fileMessage]);
            }
          } catch (error) {
            console.error('File generation error:', error);
          }
        }

        // Update progress
        setProject(prev => {
          if (!prev) return prev;
          
          const updatedPhases = prev.phases.map(phase => {
            if (phase.status === 'in-progress' && phase.assignedAgents.includes(workingAgent.id)) {
              const increment = Math.floor(Math.random() * 8) + 2; // 2-10% progress
              const newProgress = Math.min(phase.progress + increment, 100);
              return {
                ...phase,
                progress: newProgress,
                status: newProgress === 100 ? 'completed' as const : phase.status
              };
            }
            return phase;
          });

          // Start next phase if current is completed
          const finalPhases = updatedPhases.map(phase => {
            if (phase.status === 'pending') {
              const phaseIndex = prev.phases.findIndex(p => p.id === phase.id);
              const previousPhase = updatedPhases[phaseIndex - 1];
              
              if (previousPhase && previousPhase.status === 'completed') {
                return { ...phase, status: 'in-progress' as const };
              }
            }
            return phase;
          });

          return { ...prev, phases: finalPhases, updatedAt: new Date() };
        });

      } catch (error) {
        console.error('Auto-work error:', error);
      } finally {
        // Update agent status back to available
        setTimeout(() => {
          setAgents(prev => prev.map(agent => 
            agent.id === workingAgent.id 
              ? { ...agent, status: 'available' as const }
              : agent
          ));
        }, 2000);
      }
    }, 3000); // Agents work every 3 seconds

    return () => clearInterval(autoWorkInterval);
  }, [project, agents, isProcessing]);

  return {
    project,
    agents,
    messages,
    isProcessing,
    generatedFiles,
    createProject,
    sendMessage,
    approveProject,
    downloadProject,
    generateReport
  };
};