// Markdown 中の [[答え]] を <blank answer="答え"> 要素に変える remark プラグイン
import type { Root, Text, PhrasingContent } from "mdast";
import { visit, SKIP } from "unist-util-visit";

const RE = /\[\[(.+?)\]\]/g;

export default function remarkBlanks() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined || !RE.test(node.value)) return;
      RE.lastIndex = 0;
      const out: PhrasingContent[] = [];
      let last = 0;
      for (const m of node.value.matchAll(RE)) {
        if (m.index > last) out.push({ type: "text", value: node.value.slice(last, m.index) });
        const answer = m[1].trim();
        out.push({
          type: "text",
          value: answer,
          data: { hName: "blank", hProperties: { answer } },
        });
        last = m.index + m[0].length;
      }
      if (last < node.value.length) out.push({ type: "text", value: node.value.slice(last) });
      parent.children.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}
