import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Calendar, Mail, Brain } from "lucide-react";

export default function ServiceIntegrations() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'communication': return <Phone className="text-primary" size={20} />;
      case 'calendar': return <Calendar className="text-warning" size={20} />;
      case 'email': return <Mail className="text-secondary" size={20} />;
      case 'ai': return <Brain className="text-primary" size={20} />;
      default: return <Brain className="text-primary" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-success';
      case 'error': return 'bg-error';
      case 'warning': return 'bg-warning';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return 'Unknown';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'error': return 'text-error';
      case 'warning': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  const formatUsage = (usage: any, name: string) => {
    switch (name) {
      case 'Twilio':
        return `${usage?.callsToday || 0}/${usage?.callsLimit || 100} calls`;
      case 'Google Calendar':
        return `${usage?.eventsScheduled || 0} scheduled`;
      case 'SendGrid':
        return `${usage?.emailsSent || 0} sent`;
      case 'OpenAI':
        return `${(usage?.tokensUsed || 0).toLocaleString()} used`;
      default:
        return 'Active';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">External Service Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="w-2 h-2 rounded-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <Card className="bg-surface border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">External Service Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain size={20} className="text-text-secondary" />
            </div>
            <p className="text-text-secondary text-sm">No integrations configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">External Service Integrations</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration: any) => (
            <div key={integration.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getIntegrationIcon(integration.type)}
                  <span className="text-sm font-medium">{integration.name}</span>
                </div>
                <div className={`w-2 h-2 ${getStatusColor(integration.status)} rounded-full`}></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Status:</span>
                  <span className={getStatusTextColor(integration.status)}>
                    {getStatusText(integration.status)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Usage:</span>
                  <span className="text-white">
                    {formatUsage(integration.usage, integration.name)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
