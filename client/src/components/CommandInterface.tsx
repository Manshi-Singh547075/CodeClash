import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Mic, Loader2, Brain } from "lucide-react";

export default function CommandInterface() {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: examples } = useQuery({
    queryKey: ['/api/examples'],
  });

  const executeCommandMutation = useMutation({
    mutationFn: async (instruction: string) => {
      const response = await apiRequest('POST', '/api/tasks', {
        originalInstruction: instruction
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Instruction Processed",
        description: `Created ${data.processed.tasks.length} tasks for agent execution`,
        variant: "default",
      });
      setCommand("");
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Command Failed",
        description: error.message || "Failed to process instruction",
        variant: "destructive",
      });
    },
  });

  const handleExecute = () => {
    if (!command.trim()) {
      toast({
        title: "Empty Command",
        description: "Please enter an instruction first",
        variant: "destructive",
      });
      return;
    }

    executeCommandMutation.mutate(command.trim());
  };

  const handleExampleClick = (example: string) => {
    setCommand(example);
  };

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      if (isListening) {
        setIsListening(false);
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to capture voice input",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice Input Unavailable",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-slate-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <Brain className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Natural Language Command Center</h2>
          <p className="text-sm text-text-secondary">Tell your agents what to do in plain English</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <Textarea 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-700 border-slate-600 text-white placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[80px]" 
            placeholder="Example: 'Call John Smith to schedule a meeting for next Tuesday at 2 PM, then book a conference room and send follow-up emails to all attendees'"
            disabled={executeCommandMutation.isPending}
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              disabled={executeCommandMutation.isPending}
              className={`text-text-secondary hover:text-white ${isListening ? 'text-error animate-pulse' : ''}`}
            >
              <Mic size={16} />
            </Button>
            <Button 
              onClick={handleExecute}
              disabled={executeCommandMutation.isPending || !command.trim()}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-1 text-sm font-medium"
            >
              {executeCommandMutation.isPending ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Execute'
              )}
            </Button>
          </div>
        </div>
        
        {examples && examples.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-text-secondary">Quick examples:</span>
            {examples.slice(0, 3).map((example: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer bg-slate-700 text-text-secondary hover:bg-slate-600 transition-colors text-xs"
                onClick={() => handleExampleClick(example)}
              >
                {example.length > 30 ? `${example.substring(0, 30)}...` : example}
              </Badge>
            ))}
          </div>
        )}

        {isListening && (
          <div className="flex items-center space-x-2 text-error">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
            <span className="text-sm">Listening...</span>
          </div>
        )}

        <div className="text-xs text-text-secondary">
          💡 Tip: Use Ctrl+Enter (Cmd+Enter on Mac) to quickly execute commands
        </div>
      </div>
    </div>
  );
}
