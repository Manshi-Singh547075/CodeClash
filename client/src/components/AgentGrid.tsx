import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Calendar, Mail, Loader2 } from "lucide-react";

export default function AgentGrid() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'communication': return <Phone className="text-success" size={20} />;
      case 'booking': return <Calendar className="text-warning" size={20} />;
      case 'followup': return <Mail className="text-secondary" size={20} />;
      default: return <Phone className="text-primary" size={20} />;
    }
  };

  const getAgentIconBg = (type: string) => {
    switch (type) {
      case 'communication': return 'bg-success/20';
      case 'booking': return 'bg-warning/20';
      case 'followup': return 'bg-secondary/20';
      default: return 'bg-primary/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'busy': return 'bg-success animate-pulse';
      case 'idle': return 'bg-warning';
      case 'error': return 'bg-error';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: string, currentTask?: string) => {
    switch (status) {
      case 'active': return currentTask || 'Active - Ready for tasks';
      case 'busy': return currentTask || 'Busy - Processing task';
      case 'idle': return 'Standby - Ready for tasks';
      case 'error': return 'Error - Needs attention';
      default: return 'Unknown status';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'busy': return Math.floor(Math.random() * 40) + 60; // 60-100%
      case 'active': return Math.floor(Math.random() * 30) + 20; // 20-50%
      case 'idle': return 0;
      default: return 0;
    }
  };

  const formatStatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value || '0';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-surface border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="w-3 h-3 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-xl border border-slate-700">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 size={24} className="text-text-secondary animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Agents Available</h3>
        <p className="text-text-secondary">Agents are initializing...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent: any) => (
        <Card key={agent.id} className="bg-surface border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getAgentIconBg(agent.type)} rounded-lg flex items-center justify-center`}>
                  {getAgentIcon(agent.type)}
                </div>
                <div>
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <p className="text-xs text-text-secondary">
                    {getStatusText(agent.status, agent.currentTask)}
                  </p>
                </div>
              </div>
              <div className={`w-3 h-3 ${getStatusColor(agent.status)} rounded-full`}></div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="text-sm font-medium mb-1">
                {agent.status === 'busy' ? 'Current Task' : agent.status === 'idle' ? 'Next Task' : 'Status'}
              </div>
              <div className="text-xs text-text-secondary mb-2">
                {agent.currentTask || (agent.status === 'idle' ? 'Waiting for assignments' : 'Ready for tasks')}
              </div>
              {agent.status !== 'idle' && (
                <div className="mt-2">
                  <Progress 
                    value={getProgressValue(agent.status)} 
                    className="h-1.5 bg-slate-600"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-xs">
              {agent.type === 'communication' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Calls Today:</span>
                    <span className="text-white">{formatStatValue(agent.stats?.callsToday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Success Rate:</span>
                    <span className="text-success">{formatStatValue(agent.stats?.successRate)}%</span>
                  </div>
                </>
              )}
              
              {agent.type === 'booking' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bookings Today:</span>
                    <span className="text-white">{formatStatValue(agent.stats?.bookingsToday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Availability:</span>
                    <span className="text-success">{formatStatValue(agent.stats?.availability)}%</span>
                  </div>
                </>
              )}
              
              {agent.type === 'followup' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Emails Sent:</span>
                    <span className="text-white">{formatStatValue(agent.stats?.emailsSent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Response Rate:</span>
                    <span className="text-success">{formatStatValue(agent.stats?.responseRate)}%</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
