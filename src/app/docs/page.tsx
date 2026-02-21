import fs from "fs";
import path from "path";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function DocsPage() {
  const contentPath = path.join(process.cwd(), "content", "docs", "index.md");
  const content = fs.readFileSync(contentPath, "utf-8");

  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose prose-invert prose-zinc max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </article>
    </div>
  );
}
