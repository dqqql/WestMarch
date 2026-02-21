import fs from "fs";
import path from "path";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";

export default async function DocPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const contentPath = path.join(
    process.cwd(),
    "content",
    "docs",
    `${slug}.md`
  );

  if (!fs.existsSync(contentPath)) {
    notFound();
  }

  const content = fs.readFileSync(contentPath, "utf-8");

  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose prose-invert prose-zinc max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </article>
    </div>
  );
}
