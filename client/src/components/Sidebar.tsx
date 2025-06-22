import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Plus, History, Settings, Phone, Calendar, Mail, Loader2 } from "lucide-react";

export default function Sidebar() {
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['/api/agents'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: integrations, isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/integrations'],
    refetchInterval: 60000, // Refresh every minute
  });

  const getAgentsByType = () => {
    if (!agents) return {};
    return agents.reduce((acc: any, agent: any) => {
      if (!acc[agent.type]) acc[agent.type] = [];
      acc[agent.type].push(agent);
      return acc;
    }, {});
  };

  const agentsByType = getAgentsByType();

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'communication': return <Phone size={12} />;
      case 'booking': return <Calendar size={12} />;
      case 'followup': return <Mail size={12} />;
      default: return <Settings size={12} />;
    }
  };

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'communication': return 'bg-success';
      case 'booking': return 'bg-warning';
      case 'followup': return 'bg-secondary';
      default: return 'bg-slate-500';
    }
  };

  const getActiveAgentCount = (type: string) => {
    return agentsByType[type]?.filter((agent: any) => 
      agent.status === 'active' || agent.status === 'busy'
    ).length || 0;
  };

  const getSystemStatus = (name: string) => {
    const integration = integrations?.find((i: any) => i.name === name);
    return integration?.status === 'connected' ? 'success' : 'error';
  };

  const getPendingTasksCount = () => {
    // This would come from a real API in production
    return 3; // Mock value
  };

  return (
    <aside className="w-64 bg-surface border-r border-slate-700 p-6 hidden lg:block">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Plus size={16} className="mr-3" />
              <span className="text-sm">New Instruction</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-text-secondary hover:text-white hover:bg-slate-700"
            >
              <History size={16} className="mr-3" />
              <span className="text-sm">Recent Tasks</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-text-secondary hover:text-white hover:bg-slate-700"
            >
              <Settings size={16} className="mr-3" />
              <span className="text-sm">Workflows</span>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Agent Types
          </h3>
          {agentsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-text-secondary" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 ${getAgentColor('communication')} rounded-full`}></div>
                  <span className="text-sm">Communication</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getActiveAgentCount('communication')} active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 ${getAgentColor('booking')} rounded-full`}></div>
                  <span className="text-sm">Booking</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getActiveAgentCount('booking')} active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 ${getAgentColor('followup')} rounded-full`}></div>
                  <span className="text-sm">Follow-up</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getActiveAgentCount('followup')} active
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            System Status
          </h3>
          {integrationsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-text-secondary" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>OpenAI API</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 ${getSystemStatus('OpenAI') === 'success' ? 'bg-success' : 'bg-error'} rounded-full`}></div>
                  <span className={`text-xs ${getSystemStatus('OpenAI') === 'success' ? 'text-success' : 'text-error'}`}>
                    {getSystemStatus('OpenAI') === 'success' ? 'Active' : 'Error'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>External Services</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs text-success">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Agent Queue</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span className="text-xs text-warning">{getPendingTasksCount()} pending</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
