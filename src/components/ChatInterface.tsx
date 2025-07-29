import { useState, useRef, useEffect } from 'react';
import { Message, Agent } from '@/types/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Code, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: Message[];
  agents: Agent[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

const messageTypeIcons = {
  message: null,
  file: FileText,
  code: Code,
  report: BarChart3
};

export const ChatInterface = ({ 
  messages, 
  agents, 
  onSendMessage, 
  isLoading 
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const getAgentById = (agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          💬 Chat do Projeto
          <Badge variant="outline" className="ml-auto">
            {messages.length} mensagens
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Nenhuma mensagem ainda.</p>
                <p className="text-sm">Comece uma conversa com os agentes!</p>
              </div>
            ) : (
              messages.map((message) => {
                const agent = getAgentById(message.agentId);
                const IconComponent = messageTypeIcons[message.type];
                
                return (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {agent ? agent.name.slice(0, 2) : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {agent?.name || 'Sistema'}
                        </span>
                        {agent && (
                          <Badge variant="outline" className="text-xs px-1">
                            {agent.role.replace('-', ' ')}
                          </Badge>
                        )}
                        {IconComponent && (
                          <IconComponent className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      <div className={cn(
                        "text-sm p-3 rounded-lg",
                        message.type === 'code' 
                          ? "bg-muted font-mono text-sm" 
                          : "bg-accent/50"
                      )}>
                        {message.content}
                      </div>
                      
                      {message.metadata?.files && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.metadata.files.map((file, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              📎 {file}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-accent/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Agentes processando...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex-shrink-0 p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem para os agentes..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};