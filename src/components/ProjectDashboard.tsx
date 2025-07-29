import { Project, ProjectPhase } from '@/types/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle, Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDashboardProps {
  project: Project;
  onApproveProject: () => void;
  onDownloadProject: () => void;
  onGenerateReport: () => void;
}

const phaseStatusIcons = {
  pending: Clock,
  'in-progress': AlertCircle,
  completed: CheckCircle,
  blocked: AlertCircle
};

const phaseStatusColors = {
  pending: 'text-muted-foreground',
  'in-progress': 'text-info',
  completed: 'text-success',
  blocked: 'text-destructive'
};

export const ProjectDashboard = ({
  project,
  onApproveProject,
  onDownloadProject,
  onGenerateReport
}: ProjectDashboardProps) => {
  const totalProgress = project.phases.reduce((acc, phase) => acc + phase.progress, 0) / project.phases.length;
  const completedPhases = project.phases.filter(phase => phase.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
            <Badge 
              variant={project.status === 'completed' ? 'default' : 'secondary'}
              className={cn(
                project.status === 'completed' && 'bg-success text-success-foreground'
              )}
            >
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso Geral</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{project.phases.length}</div>
                <div className="text-xs text-muted-foreground">Fases Totais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{completedPhases}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">{project.agents.length}</div>
                <div className="text-xs text-muted-foreground">Agentes Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{project.files.length}</div>
                <div className="text-xs text-muted-foreground">Arquivos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Phases */}
      <Card>
        <CardHeader>
          <CardTitle>Fases do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.phases.map((phase) => {
              const StatusIcon = phaseStatusIcons[phase.status];
              
              return (
                <div key={phase.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon 
                        className={cn("h-4 w-4", phaseStatusColors[phase.status])} 
                      />
                      <h3 className="font-semibold">{phase.name}</h3>
                    </div>
                    <Badge variant="outline">
                      {phase.progress}% concluído
                    </Badge>
                  </div>
                  
                  <Progress value={phase.progress} className="h-2 mb-3" />
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {phase.assignedAgents.map((agentId) => {
                      const agent = project.agents.find(a => a.id === agentId);
                      return agent ? (
                        <Badge key={agentId} variant="secondary" className="text-xs">
                          {agent.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  
                  {phase.deliverables.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Entregas:</strong> {phase.deliverables.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onGenerateReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Gerar Relatório
            </Button>
            
            {project.status === 'completed' && (
              <>
                <Button 
                  onClick={onDownloadProject}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download ZIP
                </Button>
                
                {!project.approvedByUser && (
                  <Button 
                    onClick={onApproveProject}
                    className="flex items-center gap-2 bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprovar Projeto
                  </Button>
                )}
              </>
            )}
          </div>
          
          {project.approvedByUser && (
            <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Projeto aprovado! Pronto para entrega final.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};