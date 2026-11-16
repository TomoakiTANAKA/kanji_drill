"use client";
import { useState } from "react";
import { type Backup, dateStamp, downloadText, exportAll, importAll } from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";

/** 全記録を JSON で書き出し／読み込み。端末の引っ越しや、サイトの URL が変わるときに使う */
export default function RecordsTool() {
  const hydrated = useHydrated();
  const [msg, setMsg] = useState("");
  const keys = hydrated ? Object.keys(exportAll().data) : [];

  const onExport = () => {
    const b = exportAll();
    downloadText(`study_records_${dateStamp()}.json`, JSON.stringify(b, null, 2), "application/json");
    setMsg(`${Object.keys(b.data).length}こ のきろくを かきだしました`);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const b = JSON.parse(await file.text()) as Backup;
      if (!confirm("いまの端末のきろくを、ファイルの内容で上書きします。よろしいですか？")) return;
      setMsg(`${importAll(b)}こ のきろくを よみこみました`);
    } catch (err) {
      setMsg(`よみこめませんでした：${(err as Error).message}`);
    }
  };

  return (
    <div className="card" style={{ textAlign: "left" }}>
      <p className="lead">
        記録はこの端末のブラウザにだけ保存されています。別の端末や別のURLに移すときは、ここで書き出したファイルを移した先で読み込んでください。
      </p>
      <div className="controls">
        <button className="btn-ok" onClick={onExport}>
          かきだす（JSON）
        </button>
        <label className="file-row" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          よみこむ：
          <input type="file" accept=".json,application/json" onChange={onImport} />
        </label>
      </div>
      {msg && <p style={{ marginTop: 16 }}>{msg}</p>}
      <p className="lead" style={{ marginTop: 20, marginBottom: 0 }}>
        保存されているキー：{hydrated ? keys.join(", ") || "なし" : "…"}
      </p>
    </div>
  );
}
