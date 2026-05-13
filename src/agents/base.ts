import Anthropic from "@anthropic-ai/sdk";

export interface AgentResult {
  success: boolean;
  output: string;
  metadata?: Record<string, unknown>;
}

export abstract class BaseAgent {
  protected client: Anthropic;
  protected systemPrompt: string;

  constructor(client: Anthropic, systemPrompt: string) {
    this.client = client;
    this.systemPrompt = systemPrompt;
  }

  abstract execute(targetPath: string, context: string): Promise<AgentResult>;

  protected async chat(userMessage: string, maxTokens = 4096): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: [
        {
          type: "text",
          text: this.systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  }
}
