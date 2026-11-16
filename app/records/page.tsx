import type { Metadata } from "next";
import RecordsTool from "@/components/RecordsTool";

export const metadata: Metadata = { title: "きろく" };

export default function RecordsPage() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">きろくの かきだし・よみこみ</h1>
      </header>
      <main className="app-main top">
        <RecordsTool />
      </main>
    </div>
  );
}
