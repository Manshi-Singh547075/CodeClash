import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Settings, AlertCircle } from "lucide-react";

export default function TaskOrchestration() {
  const [realtimeTasks, setRealtimeTasks] = useState<any[]>([]);
  const { lastMessage } = useSocket();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Handle real-time task updates
  useEffect(() => {
    if (lastMessage?.type === 'task_update') {
      const taskUpdate = lastMessage.data;
      setRealtimeTasks(prev => {
        const existing = prev.find(t => t.id === taskUpdate.taskId);
        if (existing) {
          return prev.map(t => 
            t.id === taskUpdate.taskId 
              ? { ...t, status: taskUpdate.status, ...taskUpdate }
              : t
          );
        } else {
          return [taskUpdate, ...prev.slice(0, 4)];
        }
      });
    }
  }, [lastMessage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="text-white" size={12} />;
      case 'in_progress': return <Loader2 className="text-white animate-spin" size={12} />;
      case 'pending': return <Clock className="text-text-secondary" size={12} />;
      case 'failed': return <AlertCircle className="text-white" size={12} />;
      default: return <Clock className="text-text-secondary" size={12} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'pending': return 'bg-slate-600';
      case 'failed': return 'bg-error';
      default: return 'bg-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDuration = (createdAt: string, completedAt?: string) => {
    const start = new Date(createdAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffMin > 0) {
      return `${diffMin}m ${diffSec % 60}s`;
    }
    return `${diffSec}s`;
  };

  const getTaskTitle = (task: any) => {
    if (task.processedTasks && task.processedTasks.length > 0) {
      return task.processedTasks[0].action || 'Task';
    }
    return 'Task';
  };

  const getTaskDescription = (task: any) => {
    if (task.processedTasks && task.processedTasks.length > 0) {
      return task.processedTasks[0].description || task.originalInstruction;
    }
    return task.originalInstruction;
  };

  const getAgentName = (task: any) => {
    if (task.processedTasks && task.processedTasks.length > 0) {
      const agentType = task.processedTasks[0].type;
      switch (agentType) {
        case 'communication': return 'Communication';
        case 'booking': return 'Booking';
        case 'followup': return 'Follow-up';
        default: return 'Unknown';
      }
    }
    return 'System';
  };

  // Combine real-time tasks with API tasks
  const combinedTasks = [
    ...realtimeTasks,
    ...(tasks || [])
  ].slice(0, 6); // Show max 6 tasks

  if (isLoading) {
    return (
      <Card className="bg-surface border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Task Orchestration</CardTitle>
            <Skeleton className="w-24 h-6" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Task Orchestration</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-600 text-text-secondary hover:text-white"
          >
            <Settings size={14} className="mr-2" />
            Edit Workflow
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-80">
          {combinedTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={20} className="text-text-secondary" />
              </div>
              <p className="text-text-secondary text-sm">No active tasks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedTasks.map((task: any, index: number) => (
                <div 
                  key={task.id || `realtime-${index}`} 
                  className={`border border-slate-600 rounded-lg p-4 transition-colors ${
                    realtimeTasks.includes(task) 
                      ? 'border-primary/50 bg-primary/5' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 ${getStatusColor(task.status)} rounded-full flex items-center justify-center`}>
                        {getStatusIcon(task.status)}
                      </div>
                      <span className="text-sm font-medium">{getTaskTitle(task)}</span>
                    </div>
                    <Badge variant={getStatusVariant(task.status)} className="text-xs">
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">
                    {getTaskDescription(task)}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Agent: {getAgentName(task)}</span>
                    <span className="text-text-secondary">
                      {task.status === 'completed' 
                        ? `Duration: ${formatDuration(task.createdAt, task.updatedAt)}`
                        : task.status === 'in_progress'
                        ? `Running: ${formatDuration(task.createdAt)}`
                        : 'Waiting for dependencies'
                      }
                    </span>
                  </div>
                  
                  {realtimeTasks.includes(task) && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                        Live Update
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
