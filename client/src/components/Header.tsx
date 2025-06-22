import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Network } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const { connected } = useSocket();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="bg-surface border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Network className="text-white text-sm" size={16} />
            </div>
            <h1 className="text-xl font-semibold">OmniDimension</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
            <Button variant="ghost" size="sm" className="bg-primary text-white hover:bg-primary/90">
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
              Analytics
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
              Settings
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
            <span className="text-sm text-text-secondary">
              {connected ? '5 Agents Active' : 'Connecting...'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-white">
              <Bell size={18} />
              <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-warning text-[10px] flex items-center justify-center">
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-text-secondary hover:text-white">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl} alt="User avatar" />
                    <AvatarFallback className="bg-slate-600 text-white text-xs">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{getDisplayName()}</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface border-slate-700">
                <DropdownMenuItem className="text-text-secondary hover:text-white">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-text-secondary hover:text-white">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-white"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
