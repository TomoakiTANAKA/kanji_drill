import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBlanks from "@/lib/remarkBlanks";
import Blank from "./Blank";

type BlankProps = { answer?: string };

/** 算数の 1 段階ぶんの本文。ビルド時に HTML 化され、空欄だけがクライアントで動く */
export default function StepBody({ markdown }: { markdown: string }) {
  return (
    <div className="math-body">
      <Markdown
        remarkPlugins={[remarkGfm, remarkBlanks]}
        components={
          {
            blank: ({ answer }: BlankProps) => <Blank answer={String(answer ?? "")} />,
          } as Record<string, React.ComponentType<BlankProps>>
        }
      >
        {markdown}
      </Markdown>
    </div>
  );
}
