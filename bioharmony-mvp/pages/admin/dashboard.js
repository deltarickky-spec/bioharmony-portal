import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/submissions");
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Unauthorized");
      window.location.href = "/admin";
      return;
    }
    setSubs(data.submissions || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadReport(submission_id, pdfFile, mp3File) {
    const form = new FormData();
    form.append("submission_id", submission_id);
    form.append("pdf", pdfFile);
    if (mp3File) form.append("mp3", mp3File);

    const res = await fetch("/api/admin/upload-report", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Upload failed");
    alert("Report delivered.");
    load();
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Admin Dashboard</h1>

      <div style={{ color: "#64748b", marginBottom: 12 }}>
        Tip: click “Download voice” → run scan → upload PDF (+ optional MP3) → client gets email.
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}>Created</th>
              <th style={th}>Client</th>
              <th style={th}>Email</th>
              <th style={th}>Status</th>
              <th style={th}>Voice</th>
              <th style={th}>Upload report</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td style={td}>{new Date(s.created_at).toLocaleString()}</td>
                <td style={td}>{s.name}</td>
                <td style={td}>{s.email}</td>
                <td style={td}>{s.status}</td>
                <td style={td}>
                  <a href={`/api/download?kind=voice&file=${encodeURIComponent(s.voice_file)}`} target="_blank" rel="noreferrer">
                    Download voice
                  </a>
                </td>
                <td style={td}>
                  {s.status === "complete" ? (
                    <div>
                      <a href={`/api/download?kind=reports&file=${encodeURIComponent(s.report_pdf)}`} target="_blank" rel="noreferrer">
                        PDF
                      </a>
                      {s.report_mp3 ? (
                        <>
                          {" | "}
                          <a href={`/api/download?kind=reports&file=${encodeURIComponent(s.report_mp3)}`} target="_blank" rel="noreferrer">
                            MP3
                          </a>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <UploadWidget onUpload={(pdf, mp3) => uploadReport(s.id, pdf, mp3)} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UploadWidget({ onUpload }) {
  const [pdf, setPdf] = useState(null);
  const [mp3, setMp3] = useState(null);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
      <input type="file" accept="audio/mpeg" onChange={(e) => setMp3(e.target.files?.[0] || null)} />
      <button
        onClick={() => {
          if (!pdf) return alert("PDF required");
          onUpload(pdf, mp3);
        }}
        style={{ padding: "8px 10px", borderRadius: 10, border: "none", background: "#0f172a", color: "white", fontWeight: 800, cursor: "pointer" }}
      >
        Send
      </button>
    </div>
  );
}

const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #e2e8f0", fontSize: 13, color: "#334155" };
const td = { padding: 10, borderBottom: "1px solid #e2e8f0", verticalAlign: "top", fontSize: 13, color: "#0f172a" };
