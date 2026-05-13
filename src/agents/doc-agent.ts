import { BaseAgent, AgentResult } from "./base";
import { glob } from "glob";
import * as fs from "fs/promises";
import * as path from "path";

const DOC_SYSTEM_PROMPT = `You are a technical writer generating developer documentation.
For each module, produce:
1. Purpose and responsibilities
2. Public API (functions/classes with types)
3. Usage examples
4. Dependencies and side effects
Output in markdown. Favor clarity over completeness.`;

export class DocAgent extends BaseAgent {
  constructor(client: any) {
    super(client, DOC_SYSTEM_PROMPT);
  }

  async execute(targetPath: string, context: string): Promise<AgentResult> {
    const files = await glob(`${targetPath}/**/*.{ts,js,py,go}`, {
      ignore: ["**/node_modules/**", "**/dist/**", "**/*.test.*"],
    });

    const docs: Record<string, string> = {};
    for (const file of files.slice(0, 100)) {
      const content = await fs.readFile(file, "utf-8");
      if (content.length < 50) continue;
      const doc = await this.chat(
        `Module: ${file}\nProject context: ${context}\n\nSource:\n${content}`,
        2048
      );
      docs[file] = doc;
    }

    const toc = await this.chat(
      `Build a table-of-contents for these modules:\n${Object.keys(docs).join("\n")}`,
      1024
    );

    const output = [
      "# Generated Documentation",
      "",
      "## Table of Contents",
      toc,
      "",
      ...Object.entries(docs).map(([f, d]) => `## ${path.basename(f)}\n\n${d}`),
    ].join("\n\n");

    return {
      success: true,
      output,
      metadata: { modulesDocumented: Object.keys(docs).length },
    };
  }
}
