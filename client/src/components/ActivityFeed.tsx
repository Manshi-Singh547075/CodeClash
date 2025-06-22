import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Phone, Calendar, Mail, Brain, AlertCircle } from "lucide-react";

export default function ActivityFeed() {
  const [realtimeActivities, setRealtimeActivities] = useState<any[]>([]);
  const { lastMessage } = useSocket();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Handle real-time activity updates
  useEffect(() => {
    if (lastMessage?.type === 'new_activity') {
      setRealtimeActivities(prev => [lastMessage.data, ...prev.slice(0, 4)]);
    }
  }, [lastMessage]);

  const getActivityIcon = (type: string, agentId?: number) => {
    switch (type) {
      case 'agent_action':
        // Determine icon based on agent type if available
        return <Phone className="text-success" size={16} />;
      case 'task_update':
        return <Calendar className="text-warning" size={16} />;
      case 'system':
        return <Brain className="text-primary" size={16} />;
      default:
        return <AlertCircle className="text-text-secondary" size={16} />;
    }
  };

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'agent_action': return 'bg-success/20';
      case 'task_update': return 'bg-warning/20';
      case 'system': return 'bg-primary/20';
      default: return 'bg-slate-700';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const combinedActivities = [
    ...realtimeActivities,
    ...(activities || [])
  ].slice(0, 10); // Show max 10 activities

  if (isLoading) {
    return (
      <Card className="bg-surface border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Live Activity Feed</CardTitle>
            <Skeleton className="w-16 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
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
          <CardTitle className="text-lg font-semibold">Live Activity Feed</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-text-secondary">Real-time</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-80">
          {combinedActivities.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={20} className="text-text-secondary" />
              </div>
              <p className="text-text-secondary text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {combinedActivities.map((activity: any, index: number) => (
                <div 
                  key={activity.id || `realtime-${index}`} 
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                    realtimeActivities.includes(activity) 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-slate-700/50'
                  }`}
                >
                  <div className={`w-8 h-8 ${getActivityIconBg(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {getActivityIcon(activity.type, activity.agentId)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center space-x-2">
                        {realtimeActivities.includes(activity) && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                            Live
                          </Badge>
                        )}
                        <span className="text-xs text-text-secondary">
                          {formatTimeAgo(activity.createdAt || activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {activity.description}
                    </p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {activity.metadata.taskCount && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.taskCount} tasks
                          </Badge>
                        )}
                        {activity.metadata.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(activity.metadata.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
