/**
 * Signal Room design reminder: an asymmetric, warm editorial research desk where evidence,
 * provenance, and uncertainty are visible. Cobalt = Google, persimmon = YC, verdigris = GitHub.
 */
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Braces,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FileSearch,
  Github,
  LineChart as LineChartIcon,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import researchData from "@/data/revisedSiteData.json";
import "./AgentMap.css";
import KeywordTiming from "@/components/KeywordTiming";

const research: any = researchData;

const signalMeta = {
  google: { name: "Google attention", color: "#2859C5", icon: Search },
  yc: { name: "YC founder supply", color: "#E26B3A", icon: Sparkles },
  github: { name: "GitHub building", color: "#13826D", icon: Github },
};

const githubModes = {
  broad_ai_declared_repositories_created: {
    label: "AI-agent repos", unit: "new public repositories", color: "#13826D",
    note: "Broad self-description signal — non-fork public repositories matching the exact phrase “AI agent”.",
  },
  narrow_ai_topic_repositories_created: {
    label: "Topic-tagged repos", unit: "new repositories", color: "#7E8B84",
    note: "Narrow comparison only — topic membership is observed at retrieval and can be added later.",
  },
  signed_agent_share_pct: {
    label: "Signed agent commits", unit: "% of public commits", color: "#0F5D50",
    note: "Independent public tracker signal — detects only commits where agents leave recognizable signatures; excludes private and unsigned activity.",
  },
};

const agentColors: Record<string, string> = {
  "Claude Code": "#2859C5", Cursor: "#E26B3A", "GitHub Copilot": "#13826D", Devin: "#7A3E78",
  Aider: "#B67A10", "OpenAI Codex": "#2778A7", OpenCode: "#9B4C38", "Google Jules": "#7B9367", "Amazon Q": "#766B61",
};

function SectionKicker({ index, children, stream }: { index: string; children: React.ReactNode; stream?: "google" | "yc" | "github" }) {
  const color = stream ? signalMeta[stream].color : "#2F2D29";
  return <div className="section-kicker" style={{ color }}><span>{index}</span><i />{children}</div>;
}

function SourceChip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "google" | "yc" | "github" }) {
  return <span className={`source-chip source-chip-${tone}`}>{children}</span>;
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><p>{label}</p>{payload.map((entry: any) => <div key={entry.name}><span style={{ background: entry.color }} />{entry.name}<b>{typeof entry.value === "number" ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : entry.value}</b></div>)}</div>;
}

export default function Home() {
  const [githubMode, setGithubMode] = useState<keyof typeof githubModes>("broad_ai_declared_repositories_created");
  const [auditFilter, setAuditFilter] = useState("all");
  const googleData = research.google.data.filter((row: any) => row.month <= "2026-07");
  const githubData = research.github.data.filter((row: any) => row.month <= "2026-07");
  const latestGoogle = googleData[googleData.length - 2];
  const filteredLedger = useMemo(() => research.yc.ledger.filter((record: any) => auditFilter === "all" || record.manual_ai_core === auditFilter), [auditFilter]);
  const layerData = research.yc.layers_among_manual_ai_core_yes.map((row: any) => ({ ...row, label: row.manual_product_layer.replaceAll("_", " ") }));
  const githubConfig = githubModes[githubMode];
  const githubChart = githubData.map((row: any) => ({ ...row, shortMonth: row.month.slice(2) })).filter((row: any) => githubMode !== "signed_agent_share_pct" || (row.tracker_days >= 28 && row.month !== "2025-03"));
  const agentTypes = research.github.signed_agent_types as string[];
  const agentTimeline = research.github.signed_agent_by_type.map((row: any) => ({ ...row, shortMonth: row.month.slice(2) }));
  const latestAgentMonth = agentTimeline[agentTimeline.length - 1];
  const latestAgentRank = [...agentTypes].map((agent) => ({ agent, commits: latestAgentMonth?.[agent] ?? 0, share: latestAgentMonth?.[`${agent} share`] ?? 0 })).sort((a, b) => b.commits - a.commits);

  return (
    <div className="atlas-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="AI Signals Atlas home">
          <img src="/manus-storage/atlas-signal-knot_182b341b.png" alt="" />
          <span>AI / Signals<br /><b>Atlas</b></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#attention">Attention</a>
          <a href="#keywords">Keywords</a>
          <a href="#founders">Founders</a>
          <a href="#builders">Builders</a>
          <a href="#methods">Methods</a>
        </nav>
        <a className="audit-link" href="#audit"><ShieldCheck size={15} /> Audited evidence</a>
      </header>

      <main id="top">
        <section className="hero">
          <img className="hero-field" src="/manus-storage/atlas-hero-field_3eaa5865.png" alt="" />
          <div className="hero-brand-object" aria-hidden="true"><img src="/manus-storage/atlas-signal-knot_182b341b.png" alt="" /><div><span>AI / SIGNALS</span><b>ATLAS</b></div><i /><i /><i /></div>
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" /> EVIDENCE ATLAS · 14 AUG 2026</div>
            <h1>What the world <em>searches,</em><br />what founders <em>sell,</em><br />what developers <em>build.</em></h1>
            <p className="hero-deck">An evidence-first atlas of the AI shift since GPT‑4. Google captures public attention, YC descriptions show founder supply, and GitHub reveals builder activity—because one label cannot explain the whole system.</p>
            <div className="hero-actions">
              <a href="#attention" className="button-primary">Explore the signals <ArrowDownRight size={18} /></a>
              <a href="#methods" className="text-action">Read the evidence standard <ChevronRight size={16} /></a>
            </div>
          </div>
          <aside className="hero-note">
            <p>THE EVIDENCE</p>
            <strong>Topic tags are not code authorship.<br />Directory tags are not ground truth.</strong>
            <span>Signed coding-agent commits and direct, company-by-company YC review sit beside the core signals.</span>
          </aside>
        </section>

        <section className="signal-strip" aria-label="Research evidence overview">
          <div><span className="signal-thread google" /><p>GOOGLE</p><b>42</b><small>monthly attention observations</small></div>
          <div><span className="signal-thread yc" /><p>YC</p><b>56</b><small>public descriptions manually reviewed</small></div>
          <div><span className="signal-thread github" /><p>GITHUB</p><b>3</b><small>distinct developer-activity signals</small></div>
          <div className="signal-caveat"><CircleAlert size={17} /><span>All monthly comparisons end in July 2026.</span></div>
        </section>

        <section className="thesis-layout" id="attention">
          <aside className="evidence-rail">
            <div className="rail-title">EVIDENCE RAIL</div>
            <a href="#attention" className="rail-item active"><span style={{ background: signalMeta.google.color }} />01 Search attention</a>
            <a href="#founders" className="rail-item"><span style={{ background: signalMeta.yc.color }} />02 Founder supply</a>
            <a href="#builders" className="rail-item"><span style={{ background: signalMeta.github.color }} />03 Builder activity</a>
            <a href="#methods" className="rail-item"><span style={{ background: "#34302B" }} />04 Methods & limits</a>
          </aside>
          <div className="thesis-main">
            <SectionKicker index="01" stream="google">Public attention</SectionKicker>
            <div className="thesis-grid">
              <h2>Search attention formed around a <em>brand</em>—then broadened into a vocabulary of assistants, integrations, and agent work.</h2>
              <div className="margin-copy"><SourceChip tone="google">WORLDWIDE WEB SEARCH</SourceChip><p>Google Trends captures normalized interest, not raw volume or usage. Its value here is the public’s evolving language for AI.</p><a href="https://support.google.com/trends/answer/4365533?hl=en" target="_blank" rel="noreferrer">Source methodology <ExternalLink size={13} /></a></div>
            </div>
            <div className="chart-card attention-card">
              <div className="chart-head"><div><span className="mini-label">JOINT-QUERY INDEX · 0–100</span><h3>Named assistant search attention</h3></div><SourceChip tone="google">Google Trends</SourceChip></div>
              <div className="chart-frame"><ResponsiveContainer width="100%" height={330}><LineChart data={googleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#D8D1C6" /><XAxis dataKey="month" tick={{ fill: "#726C63", fontSize: 11 }} interval={5} tickLine={false} axisLine={false} /><YAxis tick={{ fill: "#726C63", fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip content={<TooltipBox />} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} /><Line type="monotone" dataKey="ChatGPT" stroke="#2859C5" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="Gemini" stroke="#E26B3A" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="Claude" stroke="#7A3E78" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div>
              <div className="chart-foot"><span>Latest full month (Jul ’26)</span><b>ChatGPT {latestGoogle.ChatGPT} · Gemini {latestGoogle.Gemini} · Claude {latestGoogle.Claude}</b><span>Interpretation: durable category anchor, widening assistant portfolio</span></div>
            </div>
          </div>
        </section>

        <section className="evidence-banner">
          <div><FileSearch size={25} /><span>EVIDENCE STANDARD</span></div>
          <p>A directory tag narrows discovery. A public description establishes what a company says it builds. <b>This atlas places both signals side by side.</b></p>
          <a href="#audit">See the ledger <ArrowDownRight size={17} /></a>
        </section>

        <KeywordTiming />

        <section className="founder-section" id="founders">
          <div className="section-signal-thread" aria-hidden="true"><i /><i /><i /></div>
          <div className="section-wide-head"><div><SectionKicker index="02" stream="yc">Founder supply</SectionKicker><h2>YC’s AI tag is useful.<br /><em>It is not a census.</em></h2></div><div className="photo-note"><img src="/manus-storage/atlas-evidence-collage_bd1cda6a.png" alt="Abstract paper collage representing three evidence streams." /></div></div>
          <div className="audit-grid" id="audit">
            <article className="audit-hero-card"><span className="mini-label">DIRECT PUBLIC-DESCRIPTION REVIEW</span><div className="precision-number">75.0<span>–88.6%</span></div><p>of a random sample of <b>44 directory AI-tagged companies</b> were clearly AI-core under a strict reading; the range treats six sparse descriptions as unresolved rather than forcing a result.</p><div className="precision-bar"><i style={{ width: "75%" }} /><em style={{ width: "13.6%" }} /></div><div className="precision-labels"><span>33 AI-core</span><span>6 ambiguous</span><span>5 not evidenced</span></div></article>
            <article className="audit-side-card"><BadgeCheck size={24} /><h3>Clear false negatives exist.</h3><p>All <b>12 reviewed semantic AI candidates without an AI directory tag</b> were AI-core. This is not a recall estimate—the sample was intentionally semantic—but it proves tag-only analysis misses real companies.</p><SourceChip tone="yc">MANUAL AUDIT · N=56</SourceChip></article>
            <article className="layer-card"><div className="chart-head"><div><span className="mini-label">AMONG 45 MANUALLY CERTAIN AI-CORE COMPANIES</span><h3>What the sample actually builds</h3></div></div><ResponsiveContainer width="100%" height={220}><BarChart data={layerData} layout="vertical" margin={{ left: 5, right: 25, top: 5, bottom: 5 }}><XAxis type="number" hide /><YAxis type="category" dataKey="label" width={112} tick={{ fill: "#5E5650", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#F5E9E4" }} content={<TooltipBox />} /><Bar dataKey="companies" radius={[0, 7, 7, 0]}>{layerData.map((_: any, index: number) => <Cell key={index} fill={["#E26B3A", "#D1875C", "#ECA56D", "#B65F49", "#F0C1A7"][index]} />)}</Bar></BarChart></ResponsiveContainer></article>
          </div>
          <div className="founder-conclusion"><Sparkles size={22} /><p><b>What the evidence shows:</b> Founder activity in the reviewed sample is split between domain-specific operational workflows and the infrastructure that lets agents act, remember, evaluate, and connect.</p></div>
        </section>

        <section className="builders-section" id="builders">
          <div className="section-signal-thread section-signal-thread-light" aria-hidden="true"><i /><i /><i /></div>
          <SectionKicker index="03" stream="github">Developer building</SectionKicker>
          <div className="builder-head"><h2>Three GitHub lenses.<br /><em>One ecosystem, no false equivalence.</em></h2><div><SourceChip tone="github">GITHUB EVIDENCE</SourceChip><p>Repository metadata, topic tags, and signed coding-agent commits answer different questions. The charts keep them separate.</p></div></div>
          <div className="github-tabs" role="tablist" aria-label="GitHub evidence mode">{(Object.keys(githubModes) as Array<keyof typeof githubModes>).map((key) => <button key={key} className={githubMode === key ? "active" : ""} onClick={() => setGithubMode(key)}><span style={{ background: githubModes[key].color }} />{githubModes[key].label}</button>)}</div>
          <div className="github-chart-card">
            <div className="chart-head"><div><span className="mini-label">{githubConfig.unit.toUpperCase()} · MONTHLY</span><h3>{githubConfig.label}</h3></div><SourceChip tone="github">GitHub public data</SourceChip></div>
            <p className="chart-note">{githubConfig.note}</p>
            <div className="github-field-notes"><span><b>WINDOW</b> Public, non-fork repositories only</span><span><b>MEANING</b> Metadata describes a project; it does not prove authorship or usage</span><span><b>READ IT AS</b> A construction surface, not market share</span></div>
            <ResponsiveContainer width="100%" height={345}><AreaChart data={githubChart} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="githubFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={githubConfig.color} stopOpacity={0.35} /><stop offset="100%" stopColor={githubConfig.color} stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#C9D5CF" /><XAxis dataKey="shortMonth" tick={{ fill: "#536B62", fontSize: 11 }} interval={5} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#536B62", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip content={<TooltipBox />} /><Area type="monotone" dataKey={githubMode} name={githubConfig.label} stroke={githubConfig.color} strokeWidth={3} fill="url(#githubFill)" /></AreaChart></ResponsiveContainer>
            <div className="github-key"><Braces size={19} /><span><b>What changed:</b> by 2026, the public code conversation is not just model access. It is increasingly about agent execution, routing, tool connections, memory, and fleets of coding agents.</span></div>
          </div>
          <div className="agent-map-card">
            <div className="agent-map-head"><div><span className="mini-label">COMPLETED MONTHS ONLY · SHARE OF DETECTED SIGNED AGENT COMMITS</span><h3>Which coding agents leave public commit signatures?</h3><p>The map separates every detected agent family. It describes the mix of signatures observed by the tracker—not overall coding-agent market share.</p></div><SourceChip tone="github">Agent signature map</SourceChip></div>
            <div className="agent-map-chart"><ResponsiveContainer width="100%" height={370}><AreaChart data={agentTimeline} stackOffset="expand" margin={{ top: 15, right: 10, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#D4E0D9" /><XAxis dataKey="shortMonth" tick={{ fill: "#536B62", fontSize: 11 }} interval={2} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={{ fill: "#536B62", fontSize: 11 }} axisLine={false} tickLine={false} width={42} /><Tooltip content={<TooltipBox />} /><Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />{agentTypes.map((agent) => <Area key={agent} type="monotone" dataKey={`${agent} share`} name={agent} stackId="agent-mix" stroke={agentColors[agent]} fill={agentColors[agent]} fillOpacity={0.92} />)}</AreaChart></ResponsiveContainer></div>
            <div className="agent-map-foot"><div><span>Latest full month</span><b>{latestAgentMonth?.month}</b></div>{latestAgentRank.slice(0, 3).map((row) => <div key={row.agent}><i style={{ background: agentColors[row.agent] }} /><span>{row.agent}</span><b>{Math.round(row.share)}%</b></div>)}<p>Cursor merges editor and background signatures. March ’25 is omitted because the tracker has only one observed day.</p></div>
          </div>
          <div className="github-mini-grid"><article><span>REPOSITORY SELF-DESCRIPTION</span><b>31,381</b><p>new public repositories matched “AI agent” in Jul ’26</p></article><article><span>SIGNED CODING-AGENT ACTIVITY</span><b>5.72%</b><p>of detected public commits in May ’26, the highest full-month rate in this tracker</p></article><article><span>WHY NOT COMBINE THEM?</span><p>One is self-description; one is a changing topic label; one is partial but behavioral evidence of agent use.</p></article></div>
        </section>

        <section className="audit-ledger-section">
          <div className="ledger-head"><div><SectionKicker index="04">Inspection room</SectionKicker><h2>Every manual decision<br /><em>is inspectable.</em></h2></div><div><p>This direct-review ledger links each classification to the company’s public description. Filter it, read the reason, and decide whether you agree.</p><div className="filter-row">{["all", "yes", "ambiguous", "no"].map((filter) => <button key={filter} className={auditFilter === filter ? "selected" : ""} onClick={() => setAuditFilter(filter)}>{filter === "all" ? "All 56" : filter}</button>)}</div></div></div>
          <div className="ledger-table-wrap"><table><thead><tr><th>Company</th><th>Cohort</th><th>Audit stratum</th><th>AI core?</th><th>Layer</th><th>Manual reason</th></tr></thead><tbody>{filteredLedger.map((record: any) => <tr key={record.objectID}><td><b>{record.name}</b><span>{record.one_liner}</span></td><td>{record.batch.replace("Summer", "S").replace("Winter", "W").replace("Spring", "Sp").replace("Fall", "F")}</td><td><span className="stratum">{record.audit_source_stratum === "directory_ai_tagged" ? "directory tag" : "semantic / untagged"}</span></td><td><span className={`decision ${record.manual_ai_core}`}>{record.manual_ai_core}</span></td><td>{record.manual_product_layer.replaceAll("_", " ")}</td><td className="reason">{record.manual_reason}</td></tr>)}</tbody></table></div>
        </section>

        <section className="methods-section" id="methods">
          <img className="method-stamp" src="/manus-storage/atlas-method-stamp_f8a6113c.png" alt="" />
          <div className="methods-copy"><SectionKicker index="05">Methods & limits</SectionKicker><h2>The trend is real.<br /><em>The measurement is qualified.</em></h2><p>Each stream is useful only if its constraint travels with it. The site is designed to keep those constraints close to the interpretation rather than relegating them to a disclaimer.</p></div>
          <div className="methods-grid"><article><Search size={20} /><h3>Google</h3><p>Normalized, sampled relative interest. A spike is not user count, preference, or revenue.</p></article><article><Sparkles size={20} /><h3>YC</h3><p>Public directory descriptions from a selective accelerator. Manual sample evidence, not startup-population estimates.</p></article><article><Github size={20} /><h3>GitHub</h3><p>Public-only traces. Signed commits omit private and unsigned activity; repo descriptions do not prove AI-authored code.</p></article></div>
          <div className="source-list"><BookOpen size={18} />{research.sources.map((source: any) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</div>
        </section>
      </main>
      <footer><div className="brand footer-brand"><img src="/manus-storage/atlas-signal-knot_182b341b.png" alt="" /><span>AI / Signals <b>Atlas</b></span></div><p>Evidence first. Limits visible. © 2026</p><a href="#top">Back to top <ArrowUpRight size={15} /></a></footer>
    </div>
  );
}
