import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold">OmniDimension</h1>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                AI Agent Orchestration
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Transform natural language instructions into coordinated agent actions. 
                Make calls, schedule meetings, and send follow-ups—all with simple commands.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Natural Language Processing
              </Badge>
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                Real-time Orchestration
              </Badge>
              <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                Multi-Agent Coordination
              </Badge>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                Automated Workflows
              </Badge>
            </div>

            <div className="pt-8">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Powerful Agent Capabilities</h3>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Our specialized agents work together to execute complex workflows from simple instructions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <CardTitle>Communication Agent</CardTitle>
              <CardDescription>
                Handles phone calls, voice interactions, and direct customer contact with intelligent conversation flows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-success">94%</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="text-white">&lt; 3 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Booking Agent</CardTitle>
              <CardDescription>
                Manages calendar events, room reservations, and scheduling across multiple platforms and time zones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span className="text-success">98%</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Speed:</span>
                  <span className="text-white">&lt; 30 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle>Follow-up Agent</CardTitle>
              <CardDescription>
                Sends targeted emails, manages follow-up sequences, and tracks communication engagement automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex justify-between">
                  <span>Response Rate:</span>
                  <span className="text-success">87%</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Rate:</span>
                  <span className="text-white">99.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-surface/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Simple natural language commands are transformed into coordinated agent actions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Speak Naturally</h4>
              <p className="text-text-secondary text-sm">
                Type or speak your instruction in plain English, no complex commands needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">AI Processing</h4>
              <p className="text-text-secondary text-sm">
                Advanced NLP breaks down your request into specific, actionable tasks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Agent Coordination</h4>
              <p className="text-text-secondary text-sm">
                Specialized agents execute tasks in the optimal order with real-time updates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-success">✓</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Results Delivered</h4>
              <p className="text-text-secondary text-sm">
                Get comprehensive feedback and results from all completed actions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-lg"></div>
            <span className="font-semibold">OmniDimension</span>
          </div>
          <p className="text-text-secondary text-sm">
            Intelligent agent orchestration for the modern workplace
          </p>
        </div>
      </footer>
    </div>
  );
}
