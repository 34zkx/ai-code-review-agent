import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent, AgentResult } from "./base";

export class OrchestratorAgent {
  private client: Anthropic;
  private agents: Map<string, BaseAgent> = new Map();

  constructor(client: Anthropic) {
    this.client = client;
  }

  register(name: string, agent: BaseAgent) {
    this.agents.set(name, agent);
  }

  async run(command: string, targetPath: string): Promise<AgentResult> {
    const agent = this.agents.get(command);
    if (!agent) {
      return { success: false, output: `Unknown command: ${command}` };
    }

    // Step 1: Analyze the target to determine scope
    const analysis = await this.analyzeScope(targetPath);

    // Step 2: Dispatch to the appropriate agent with context
    const result = await agent.execute(targetPath, analysis);

    // Step 3: Post-process and validate output
    return this.validate(result);
  }

  private async analyzeScope(targetPath: string): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze the code structure at path "${targetPath}". Identify: 1) Language/framework 2) Key modules 3) Potential areas of concern. Return a structured JSON summary.`,
        },
      ],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  }

  private validate(result: AgentResult): AgentResult {
    if (!result.output || result.output.length < 10) {
      return { success: false, output: "Agent produced insufficient output" };
    }
    return result;
  }
}
