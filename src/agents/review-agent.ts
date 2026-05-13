import { BaseAgent, AgentResult } from "./base";
import { glob } from "glob";
import * as fs from "fs/promises";

const REVIEW_SYSTEM_PROMPT = `You are a senior code reviewer. For each file, produce:
1. Security issues (injection, auth, secrets)
2. Performance bottlenecks
3. Maintainability concerns
4. Suggested refactors with code examples
Return structured markdown with severity labels (CRITICAL/HIGH/MEDIUM/LOW).`;

export class ReviewAgent extends BaseAgent {
  constructor(client: any) {
    super(client, REVIEW_SYSTEM_PROMPT);
  }

  async execute(targetPath: string, context: string): Promise<AgentResult> {
    const files = await glob(`${targetPath}/**/*.{ts,js,py,go}`, {
      ignore: ["**/node_modules/**", "**/dist/**"],
    });

    const reviews: string[] = [];
    for (const file of files.slice(0, 50)) {
      const content = await fs.readFile(file, "utf-8");
      const review = await this.chat(
        `Context: ${context}\n\nReview this file (${file}):\n\n${content}`,
        2048
      );
      reviews.push(`## ${file}\n\n${review}`);
    }

    const summary = await this.chat(
      `Summarize the following ${reviews.length} reviews into a priority action list:\n\n${reviews.join("\n\n---\n\n")}`,
      4096
    );

    return {
      success: true,
      output: `# Review Summary\n\n${summary}\n\n# Details\n\n${reviews.join("\n\n")}`,
      metadata: { filesReviewed: reviews.length },
    };
  }
}
