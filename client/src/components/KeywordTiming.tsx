/**
 * Signal Room design reminder: this is the comparison chamber—one shared vocabulary,
 * three visibly different clocks. Never conflate indexed timing with volume or causality.
 */
import { useMemo, useState } from "react";
import { ArrowRight, CircleAlert, Github, Search, Sparkles } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import keywordData from "@/data/keywordTimingData.json";
import "./KeywordTiming.css";

const timing: any = keywordData;
const streamMeta = {
  google: { label: "Google search", color: "#2859C5", icon: Search, cadence: "monthly relative interest" },
  yc: { label: "YC language", color: "#E26B3A", icon: Sparkles, cadence: "cohort-period description share" },
  github: { label: "GitHub building", color: "#13826D", icon: Github, cadence: "new public repository windows" },
};

const reading: Record<string, string> = {
  agents: "Founder language appears before the 2025 acceleration in both public search and repository creation—an early product frame that later became a broad construction and attention wave.",
  chatbots: "This is the early, broad interface category: search, founder language, and public repositories are all visible close to the start of the study window.",
  voice_ai: "Voice is public-facing early, while its sharp repository-creation ramp shows later. The language matures from interface promise into a more explicit build surface.",
  agent_skills: "Skills are a late engineering vocabulary: founder descriptions first appear in 2025, then search and GitHub activity accelerate together in 2026.",
  agent_harnesses: "Harnesses are highly engineering-specific. The repository ramp is much clearer than mass search, so the code stream is the most informative clock here.",
  agent_loops: "Loops are initially sparse and dispersed, then become materially visible in search and public repositories as agent construction turns into an explicit pattern.",
  recursive_self_improvement: "The expanded term avoids RSI’s financial meaning. It remains sparse in search, with the clearest later evidence in public repository creation rather than broad attention.",
  automated_research: "Founder descriptions include research-workflow language early; public search and GitHub repository growth accelerate later, alongside the broader agent wave.",
};

const keywordColors: Record<string, string> = {
  agents: "#2859C5", chatbots: "#E26B3A", voice_ai: "#B67A10", agent_skills: "#13826D",
  agent_harnesses: "#7A3E78", agent_loops: "#936231", recursive_self_improvement: "#6D7482", automated_research: "#087C93",
};

function DensityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return <div className="density-tooltip"><b>{label}</b>{payload.filter((item: any) => item.value > 0).map((item: any) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<em>{Math.round(item.value)}</em></span>)}</div>;
}

function DensityLane({ platform, values, selectedKeywords, labels }: { platform: "google" | "yc" | "github"; values: any[]; selectedKeywords: string[]; labels: Record<string, string> }) {
  const meta = streamMeta[platform];
  const Icon = meta.icon;
  return <article className={`density-lane density-${platform}`}>
    <header><div><Icon size={17} /><span>{meta.label}</span><small>{meta.cadence}</small></div><b>0–100</b></header>
    <ResponsiveContainer width="100%" height={190}><LineChart data={values} margin={{ top: 11, right: 12, left: -25, bottom: 0 }}><CartesianGrid vertical={false} stroke="#D7CEC1" strokeDasharray="2 4" /><XAxis dataKey="month" tickFormatter={(value) => value.endsWith("-01") ? value.slice(0, 4) : ""} tick={{ fontSize: 10, fill: "#766E64" }} interval={0} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 9, fill: "#766E64" }} axisLine={false} tickLine={false} /><Tooltip content={<DensityTooltip />} />{selectedKeywords.map((keyword) => <Line key={keyword} type={platform === "google" ? "monotone" : "stepAfter"} dataKey={`${platform}__${keyword}`} name={labels[keyword]} stroke={keywordColors[keyword]} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} connectNulls={false} />)}</LineChart></ResponsiveContainer>
  </article>;
}

function colorWithStrength(hex: string, index: number, minimum = 0.10) {
  if (!index) return "rgba(47,45,41,.045)";
  const alpha = minimum + Math.min(1, index / 100) * (0.80 - minimum);
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function displayMonth(value?: string | null) {
  if (!value) return "No sustained signal";
  const [year, month] = value.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(month) - 1]} ’${year.slice(2)}`;
}

function GoogleRow({ months, values }: { months: string[]; values: Map<string, number> }) {
  return <div className="keyword-cells keyword-google-cells" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(4px, 1fr))` }}>{months.map((month) => <span key={month} title={`${month}: ${values.get(month) ?? 0}`} style={{ background: colorWithStrength(streamMeta.google.color, values.get(month) ?? 0) }} />)}</div>;
}

function YCRow({ months, values }: { months: string[]; values: any[] }) {
  return <div className="keyword-yc-bands" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(4px, 1fr))` }}>{values.map((item) => {
    const start = months.indexOf(item.band_start);
    const end = months.indexOf(item.band_end);
    if (start < 0 || end < start) return null;
    return <span key={item.batch} title={`${item.batch}: ${item.yc_mentions} matched descriptions among ${item.yc_discoverable_companies} discoverable companies (${item.yc_share_pct}%)`} style={{ gridColumn: `${start + 1} / ${end + 2}`, background: colorWithStrength(streamMeta.yc.color, item.yc_band_index) }}><b>{item.batch.replace("Summer ", "S").replace("Winter ", "W").replace("Spring ", "Sp").replace("Fall ", "F")}</b></span>;
  })}</div>;
}

function GithubRow({ months, values }: { months: string[]; values: any[] }) {
  return <div className="keyword-github-cells" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(4px, 1fr))` }}>{values.map((item) => {
    const start = months.indexOf(item.start.slice(0, 7));
    const end = months.indexOf(item.end_month);
    if (start < 0 || end < start) return null;
    return <span key={item.window} title={`${item.window}: ${item.github_repositories.toLocaleString()} new public repositories`} style={{ gridColumn: `${start + 1} / ${end + 2}`, background: colorWithStrength(streamMeta.github.color, item.github_index) }} />;
  })}</div>;
}

export default function KeywordTiming() {
  const [concept, setConcept] = useState("agents");
  const [densityKeywords, setDensityKeywords] = useState(["agents", "chatbots", "voice_ai", "agent_skills"]);
  const selected = timing.concepts.find((item: any) => item.id === concept) ?? timing.concepts[0];
  const google = timing.google.filter((item: any) => item.concept === concept);
  const yc = timing.yc.filter((item: any) => item.concept === concept);
  const github = timing.github.filter((item: any) => item.concept === concept);
  const summary = timing.summary.find((item: any) => item.concept === concept);
  const months = useMemo(() => timing.google.filter((item: any) => item.concept === "agents").map((item: any) => item.month), []);
  const googleMap = new Map<string, number>(google.map((item: any): [string, number] => [item.month, item.google_index]));
  const isSparse = ["agent_harnesses", "agent_loops", "recursive_self_improvement"].includes(concept);
  const densityTimeline = timing.density_timeline;
  const conceptLabels = Object.fromEntries(timing.concepts.map((item: any) => [item.id, item.label]));
  const toggleDensityKeyword = (keyword: string) => setDensityKeywords((selected: string[]) => selected.includes(keyword) ? selected.filter((item) => item !== keyword) : selected.length < 5 ? [...selected, keyword] : selected);

  return <section id="keywords" className="keyword-timing-section">
    <div className="keyword-section-top">
      <div><div className="keyword-kicker"><span>00</span><i /> Shared vocabulary</div><h2>One vocabulary.<br /><em>Three clocks.</em></h2></div>
      <div className="keyword-intro"><span className="keyword-pill">TIMING MAP · MAR ’23—JUL ’26</span><p>Select a concept to align public search, YC’s founder language, and the public repository build surface. The rows retain their native cadence so differences are visible rather than averaged away.</p></div>
    </div>

    <div className="keyword-tabs" role="tablist" aria-label="Keyword concepts">{timing.concepts.map((item: any) => <button key={item.id} onClick={() => setConcept(item.id)} className={item.id === concept ? "active" : ""}>{item.label}{item.id === "recursive_self_improvement" && <small>RSI</small>}</button>)}</div>

    <section className="density-figure" aria-labelledby="density-title">
      <div className="density-head"><div><span className="mini-label">MULTI-KEYWORD DENSITY TREND</span><h3 id="density-title">Compare the same moment<br /><em>across keywords and platforms.</em></h3></div><div><p>Choose up to five concepts. Every lane uses the same 0–100 <b>within-keyword density index</b>, so you can compare the timing and shape of several concepts at once without treating the platforms as the same unit.</p><span className="density-hint">Google is observed monthly. YC and GitHub are honest step functions across their stated cohort and search windows.</span></div></div>
      <div className="density-selector" role="group" aria-label="Keywords in density chart">{timing.concepts.map((item: any) => <button key={item.id} onClick={() => toggleDensityKeyword(item.id)} className={densityKeywords.includes(item.id) ? "selected" : ""} disabled={!densityKeywords.includes(item.id) && densityKeywords.length >= 5}><i style={{ background: keywordColors[item.id] }} />{item.label}{item.id === "recursive_self_improvement" && <small>RSI</small>}</button>)}</div>
      <div className="density-lanes"><DensityLane platform="google" values={densityTimeline} selectedKeywords={densityKeywords} labels={conceptLabels} /><DensityLane platform="yc" values={densityTimeline} selectedKeywords={densityKeywords} labels={conceptLabels} /><DensityLane platform="github" values={densityTimeline} selectedKeywords={densityKeywords} labels={conceptLabels} /></div>
      <div className="density-foot"><CircleAlert size={16} /><span><b>How to read it:</b> a rise is an increase relative to that keyword’s own peak within the named platform. It is a density-and-timing comparison, not a claim that a 70 on Google equals a 70 on YC or GitHub.</span></div>
    </section>

    <div className="keyword-map-shell">
      <div className="keyword-map-heading"><div><span className="mini-label">SELECTED CONCEPT</span><h3>{selected.label}{concept === "recursive_self_improvement" ? " (RSI)" : ""}</h3></div><div className="keyword-scale-note"><CircleAlert size={15} /><span>Color strength is indexed within each stream. It shows <b>when</b> a signal is strongest, not which stream is largest.</span></div></div>
      <div className="keyword-axis"><span>MAR ’23</span><span>2024</span><span>2025</span><span>JUL ’26</span></div>
      <div className="keyword-stream-row"><div className="keyword-stream-label"><Search size={16} /><strong>Google</strong><small>{streamMeta.google.cadence}</small></div><GoogleRow months={months} values={googleMap} /></div>
      <div className="keyword-stream-row"><div className="keyword-stream-label"><Sparkles size={16} /><strong>YC</strong><small>{streamMeta.yc.cadence}</small></div><YCRow months={months} values={yc} /></div>
      <div className="keyword-stream-row"><div className="keyword-stream-label"><Github size={16} /><strong>GitHub</strong><small>{streamMeta.github.cadence}</small></div><GithubRow months={months} values={github} /></div>
      <div className="keyword-map-legend"><span><i style={{ background: streamMeta.google.color }} />Google monthly cells</span><span><i style={{ background: streamMeta.yc.color }} />YC cohort-period bands</span><span><i style={{ background: streamMeta.github.color }} />GitHub repository windows</span></div>
    </div>

    <div className="keyword-summary-grid">
      <article className="keyword-reading"><span className="mini-label">TIMING READING</span><p>{reading[concept]}</p>{isSparse && <div className="sparse-callout">Sparse signal: absence of a filled cell is not proof that the concept did not exist; it means this exact scoped public proxy did not produce a measurable signal.</div>}</article>
      <article className="keyword-milestone"><span>SEARCH ACCELERATION</span><b>{displayMonth(summary?.google_acceleration_month)}</b><p>25% of this concept’s own Google peak</p></article>
      <article className="keyword-milestone"><span>FOUNDER COHORT ENTRY</span><b>{summary?.yc_first_cohort ?? "No cohort match"}</b><p>first cohort with a description match in the YC discovery set</p></article>
      <article className="keyword-milestone"><span>GITHUB ACCELERATION</span><b>{summary?.github_acceleration_window ?? "No sustained signal"}</b><p>25% of this concept’s own repository-window peak</p></article>
    </div>

    <div className="keyword-method-strip"><ArrowRight size={17} /><span><b>Why the rows look different:</b> Google is monthly relative interest; YC spans its application-and-batch period as a cohort band and uses matched-description share; GitHub uses semiannual 2023–2024 and quarterly 2025–2026 new-public-repository windows. This is a lead–lag view, not a volume ranking.</span></div>
  </section>;
}
