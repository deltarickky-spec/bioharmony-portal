import { useEffect, useMemo, useRef, useState } from "react";

export default function Record() {
  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const session_id = params.get("session_id");

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    async function run() {
      try {
        if (!session_id) throw new Error("Missing session_id. Please return to the pricing page and purchase first.");
        const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(session_id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to verify payment.");
        setVerified(true);
      } catch (e) {
        alert(e.message);
        setVerified(false);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [session_id]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecording(true);
      setTimeout(() => {
        if (mr.state === "recording") mr.stop();
        setRecording(false);
      }, 10000);
    } catch (e) {
      alert("Please allow microphone access.");
    }
  }

  async function submit() {
    if (!consent) return alert("Please accept the consent agreement.");
    if (!name || !email) return alert("Please enter your name and email.");
    if (!audioBlob) return alert("Please record or upload your voice sample.");

    setUploading(true);
    try {
      const form = new FormData();
      form.append("session_id", session_id);
      form.append("name", name);
      form.append("email", email);
      form.append("consent", String(consent));
      form.append("voice", audioBlob, "voice.webm");

      const res = await fetch("/api/submit-voice-sample", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      window.location.href = `/thanks?submission_id=${encodeURIComponent(data.submission_id)}&session_id=${encodeURIComponent(session_id)}`;
    } catch (e) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Verifying payment…</div>;
  if (!verified) return <div style={{ padding: 24 }}>Payment not verified.</div>;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Step 2: Record your 10‑second voice sample</h1>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, background: "#f8fafc" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }} />
          </label>
          <label>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }} />
          </label>
        </div>

        <div style={{ marginTop: 12, maxHeight: 180, overflow: "auto", padding: 12, background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Consent and Privacy Agreement (Required)</div>
          <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.6 }}>
            By checking the box below, you consent to providing a short voice recording to BioHarmony Solutions for educational wellness frequency analysis.
            This is not medical advice, diagnosis, treatment, or cure. Your raw audio will be retained temporarily to complete delivery and is scheduled
            for deletion 30 days after report delivery (or sooner upon written request). BioHarmony Solutions does not sell or share your voice data.
          </p>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I have read and agree to the Consent and Privacy Agreement.</span>
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
          <button
            onClick={startRecording}
            disabled={!consent || recording}
            style={{ padding: "12px 14px", borderRadius: 12, border: "none", background: "#5AB2B8", color: "white", fontWeight: 800, cursor: "pointer", opacity: (!consent || recording) ? 0.6 : 1 }}
          >
            {recording ? "Recording… (10s)" : "Start Recording"}
          </button>

          {audioBlob && (
            <audio controls src={URL.createObjectURL(audioBlob)} />
          )}

          <button
            onClick={submit}
            disabled={uploading}
            style={{ marginLeft: "auto", padding: "12px 14px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontWeight: 800, cursor: "pointer", opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? "Submitting…" : "Submit Sample"}
          </button>
        </div>

        <div style={{ marginTop: 14, color: "#64748b", fontSize: 13 }}>
          Tip: Find a quiet space, speak naturally, and avoid fans/background audio.
        </div>
      </div>
    </div>
  );
}
