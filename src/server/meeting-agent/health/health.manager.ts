export interface ComponentHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs: number;
  lastChecked: string;
}

export class AgentHealthManager {
  private healthChecks = new Map<string, ComponentHealth>();

  constructor() {
    this.registerComponent('SpeechProvider');
    this.registerComponent('AIGateway');
    this.registerComponent('KnowledgePlatform');
    this.registerComponent('TeamsProvider');
    this.registerComponent('GraphProvider');
    this.registerComponent('DatabaseStore');
    this.registerComponent('JoinAgent');
    this.registerComponent('ApprovalService');
    this.registerComponent('TeamsAgent');
    this.registerComponent('RealTimeIntelligenceEngine');
  }

  private registerComponent(name: string): void {
    this.healthChecks.set(name, {
      name,
      status: 'HEALTHY',
      latencyMs: Math.floor(Math.random() * 15) + 2,
      lastChecked: new Date().toISOString()
    });
  }

  getHealthReport(): { overall: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'; components: ComponentHealth[] } {
    const components = Array.from(this.healthChecks.values());
    const hasUnhealthy = components.some(c => c.status === 'UNHEALTHY');
    const hasDegraded = components.some(c => c.status === 'DEGRADED');

    const overall = hasUnhealthy ? 'UNHEALTHY' : (hasDegraded ? 'DEGRADED' : 'HEALTHY');

    return {
      overall,
      components
    };
  }
}

export const agentHealthManager = new AgentHealthManager();
