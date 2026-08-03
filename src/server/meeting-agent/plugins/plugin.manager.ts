export interface AgentPlugin {
  name: string;
  version: string;
  execute(action: string, payload: any): Promise<any>;
}

export class JiraPlugin implements AgentPlugin {
  name = 'Jira Issue Creator Plugin';
  version = '1.0.0';

  async execute(action: string, payload: any): Promise<any> {
    if (action === 'CREATE_ISSUE') {
      console.log(`[Jira Plugin] Syncing action item to Jira project '${payload.projectKey || 'BRH'}': ${payload.title}`);
      return { success: true, issueKey: `${payload.projectKey || 'BRH'}-${Math.floor(Math.random() * 100)}` };
    }
    return { success: true };
  }
}

export class AzureDevOpsPlugin implements AgentPlugin {
  name = 'Azure DevOps Board Plugin';
  version = '1.0.0';

  async execute(action: string, payload: any): Promise<any> {
    console.log(`[Azure DevOps Plugin] Executed action '${action}' for payload:`, payload);
    return { success: true, workItemId: Math.floor(Math.random() * 1000) };
  }
}

export class PluginManager {
  private plugins = new Map<string, AgentPlugin>();

  constructor() {
    this.registerPlugin(new JiraPlugin());
    this.registerPlugin(new AzureDevOpsPlugin());
  }

  registerPlugin(plugin: AgentPlugin): void {
    this.plugins.set(plugin.name, plugin);
    console.log(`[Plugin Manager] Registered plugin: ${plugin.name} (v${plugin.version})`);
  }

  async executePluginAction(pluginName: string, action: string, payload: any): Promise<any> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      console.warn(`[Plugin Manager] Plugin '${pluginName}' not found.`);
      return null;
    }
    return await plugin.execute(action, payload);
  }

  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}

export const pluginManager = new PluginManager();
