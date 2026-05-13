import Anthropic from "@anthropic-ai/sdk";
import { ReviewAgent } from "./agents/review-agent";
import { DocAgent } from "./agents/doc-agent";
import { OrchestratorAgent } from "./agents/orchestrator";

async function main() {
  const client = new Anthropic();
  const command = process.argv[2] || "review";
  const targetPath = process.argv[3] || ".";

  const orchestrator = new OrchestratorAgent(client);
  const reviewAgent = new ReviewAgent(client);
  const docAgent = new DocAgent(client);

  orchestrator.register("review", reviewAgent);
  orchestrator.register("doc-gen", docAgent);

  const result = await orchestrator.run(command, targetPath);
  console.log(result);
}

main().catch(console.error);
