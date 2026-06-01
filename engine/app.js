/**
 * Anyplan dashboard engine — guidance.json + dashboard.json + doc-index.json
 */

const SECTIONS = [
  { id: "overview", label: "Project Overview" },
  { id: "roadmap", label: "Macro Roadmap" },
  { id: "completed", label: "Completed Tasks" },
  { id: "current", label: "Current Phase Progress" }
];

const DEFAULT_INSTANCE = "anyplan";

const state = {
  instanceId: DEFAULT_INSTANCE,
  guidance: null,
  dashboard: null,
  docIndex: null,
  indexByPath: new Map(),
  filter: "",
  openSections: new Set(SECTIONS.map((s) => s.id)),
  selected: null,
  showSource: false,
  docCache: new Map()
};

const els = {
  projectTitle: document.querySelector("#projectTitle"),
  instanceSelect: document.querySelector("#instanceSelect"),
  reloadButton: document.querySelector("#reloadButton"),
  statusLine: document.querySelector("#statusLine"),
  indexMeta: document.querySelector("#indexMeta"),
  filterInput: document.querySelector("#filterInput"),
  treeRoot: document.querySelector("#treeRoot"),
  detailBreadcrumb: document.querySelector("#detailBreadcrumb"),
  detailBadge: document.querySelector("#detailBadge"),
  structuredDetail: document.querySelector("#structuredDetail"),
  docSection: document.querySelector("#docSection"),
  docPath: document.querySelector("#docPath"),
  toggleSourceButton: document.querySelector("#toggleSourceButton"),
  docContent: document.querySelector("#docContent")
};

function getInstanceFromQuery() {
  return new URLSearchParams(window.location.search).get("instance") || DEFAULT_INSTANCE;
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} (${response.status})`);
  return response.json();
}

function rebuildIndexMap() {
  state.indexByPath = new Map();
  if (!state.docIndex?.entries) return;
  state.docIndex.entries.forEach((entry) => {
    state.indexByPath.set(entry.path.replace(/\\/g, "/"), entry);
  });
}

function getIndexEntry(path) {
  if (!path) return null;
  return state.indexByPath.get(path.replace(/\\/g, "/")) || null;
}

function isReadableMarkdown(path) {
  if (!path || !path.toLowerCase().endsWith(".md")) return false;
  return Boolean(getIndexEntry(path));
}

async function loadInstance(instanceId) {
  const base = `../instances/${instanceId}`;
  const guidance = await fetchJson(`${base}/guidance.json`);
  let dashboard = null;
  let docIndex = null;

  try {
    dashboard = await fetchJson(`${base}/dashboard.json`);
  } catch {
    dashboard = synthesizeDashboard(guidance);
  }

  try {
    docIndex = await fetchJson(`${base}/doc-index.json`);
  } catch {
    docIndex = null;
  }

  state.instanceId = instanceId;
  state.guidance = guidance;
  state.dashboard = dashboard;
  state.docIndex = docIndex;
  rebuildIndexMap();
  state.docCache.clear();
  state.showSource = false;
  state.selected = { section: "overview", nodeId: "overview-root" };

  els.projectTitle.textContent = guidance.project.name;

  if (docIndex) {
    setStatus(`Loaded ${base}/ · ${docIndex.entryCount} indexed documents`);
  } else {
    setStatus(
      `Loaded ${base}/ · no doc-index.json — run: scripts/serve.sh ${instanceId}`,
      true
    );
  }

  render();
}

function synthesizeDashboard(guidance) {
  const p = guidance.project;
  return {
    schemaVersion: "0.1.0",
    projectId: p.id,
    overview: {
      status: "bootstrap",
      summary: p.context || p.purpose,
      highlights: (guidance.principles || []).slice(0, 4).map((x) => x.title)
    },
    roadmap: {
      summary: "Add dashboard.json per document-generation spec.",
      phases: [
        {
          id: "phase-default",
          title: "Default phase",
          status: "active",
          summary: p.context || ""
        }
      ]
    },
    completedTasks: [],
    currentPhase: {
      phaseId: "phase-default",
      title: "Current work",
      summary: "Define currentPhase.tasks in dashboard.json.",
      tasks: []
    }
  };
}

function buildTreeModel() {
  const d = state.dashboard;
  const g = state.guidance;
  const nodes = [];

  nodes.push({
    section: "overview",
    id: "overview-root",
    title: g.project.name,
    summary: d.overview.summary,
    status: d.overview.status,
    payload: { type: "overview", data: d.overview, project: g.project },
    documentPath: pickReadablePath(d.overview.documentPath, d.overview.documentId)
  });

  d.roadmap.phases.forEach((phase) => {
    nodes.push({
      section: "roadmap",
      id: `phase-${phase.id}`,
      title: phase.title,
      summary: phase.summary,
      status: phase.status,
      payload: { type: "phase", data: phase },
      documentPath: pickReadablePath(phase.documentPath)
    });
    (phase.milestones || []).forEach((m) => {
      nodes.push({
        section: "roadmap",
        id: `milestone-${phase.id}-${m.id}`,
        title: m.title,
        summary: m.summary,
        status: m.status || "planned",
        payload: { type: "milestone", data: m, phase },
        documentPath: null,
        parentId: `phase-${phase.id}`
      });
    });
  });

  d.completedTasks.forEach((task) => {
    nodes.push({
      section: "completed",
      id: `done-${task.id}`,
      title: task.title,
      summary: task.summary,
      status: "done",
      meta: task.completedAt,
      payload: { type: "completed", data: task },
      documentPath: pickReadablePath(task.documentPath, task.documentId)
    });
  });

  d.currentPhase.tasks.forEach((task) => {
    nodes.push({
      section: "current",
      id: `current-${task.id}`,
      title: task.title,
      summary: task.summary,
      status: task.status,
      payload: { type: "current-task", data: task, phase: d.currentPhase },
      documentPath: pickReadablePath(task.documentPath, task.documentId)
    });
  });

  if (!d.currentPhase.tasks.length) {
    nodes.push({
      section: "current",
      id: "current-phase-summary",
      title: d.currentPhase.title,
      summary: d.currentPhase.summary,
      status: "active",
      payload: { type: "current-phase", data: d.currentPhase },
      documentPath: pickReadablePath(d.currentPhase.documentPath, d.currentPhase.documentId)
    });
  }

  return nodes;
}

function pickReadablePath(path, documentId) {
  if (path && isReadableMarkdown(path)) return path;
  if (documentId && state.guidance?.documents) {
    const doc = state.guidance.documents.find((d) => d.id === documentId);
    if (doc?.path && isReadableMarkdown(doc.path)) return doc.path;
  }
  if (path && path.toLowerCase().endsWith(".md")) return null;
  return null;
}

function render() {
  renderIndexMeta();
  renderTree();
  renderDetail();
}

function renderIndexMeta() {
  if (!els.indexMeta) return;
  if (!state.docIndex) {
    els.indexMeta.textContent = "Index not built — use scripts/serve.sh";
    return;
  }
  const at = state.docIndex.generatedAt?.slice(0, 19).replace("T", " ") || "";
  els.indexMeta.textContent = `${state.docIndex.entryCount} docs indexed · ${at} UTC`;
}

function renderTree() {
  const nodes = buildTreeModel();
  els.treeRoot.replaceChildren();

  SECTIONS.forEach((section) => {
    const sectionNodes = nodes.filter((n) => n.section === section.id && matchesFilter(n));
    const topLevel = sectionNodes.filter((n) => !n.parentId);

    const wrap = document.createElement("div");
    wrap.className = `treeSection ${state.openSections.has(section.id) ? "isOpen" : ""}`;

    const head = document.createElement("button");
    head.type = "button";
    head.className = "treeSectionHead";
    head.innerHTML = `<span class="chevron">${state.openSections.has(section.id) ? "▼" : "▶"}</span><span class="label"></span><span class="count"></span>`;
    head.querySelector(".label").textContent = section.label;
    head.querySelector(".count").textContent = String(sectionNodes.length);
    head.addEventListener("click", () => {
      if (state.openSections.has(section.id)) state.openSections.delete(section.id);
      else state.openSections.add(section.id);
      renderTree();
    });

    const children = document.createElement("div");
    children.className = "treeChildren";

    const renderNode = (node, indent) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `treeItem ${state.selected?.nodeId === node.id ? "isActive" : ""}`;
      btn.style.paddingLeft = `${14 + indent * 12}px`;
      btn.innerHTML = "<strong></strong><span></span>";
      btn.querySelector("strong").textContent = node.title;
      btn.querySelector("span").textContent = node.summary;
      if (node.meta || node.status) {
        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = node.meta || node.status;
        btn.append(meta);
      }
      btn.addEventListener("click", () => {
        state.selected = { section: node.section, nodeId: node.id };
        state.showSource = false;
        render();
      });
      children.append(btn);
    };

    topLevel.forEach((node) => {
      renderNode(node, 0);
      sectionNodes.filter((n) => n.parentId === node.id).forEach((child) => renderNode(child, 1));
    });

    wrap.append(head, children);
    els.treeRoot.append(wrap);
  });
}

function matchesFilter(node) {
  if (!state.filter) return true;
  const hay = `${node.title} ${node.summary}`.toLowerCase();
  return hay.includes(state.filter.toLowerCase());
}

function renderDetail() {
  const nodes = buildTreeModel();
  const node = nodes.find((n) => n.id === state.selected?.nodeId) || nodes[0];
  if (!node) return;

  const sectionLabel = SECTIONS.find((s) => s.id === node.section)?.label || "";
  els.detailBreadcrumb.textContent = `${sectionLabel} / ${node.title}`;

  const badgeStatus = node.status || node.payload?.data?.status;
  els.detailBadge.textContent = badgeStatus || "";
  els.detailBadge.className = badgeStatus ? `badge status-${badgeStatus}` : "badge";

  els.structuredDetail.replaceChildren();
  renderStructuredBlocks(node);

  const docPath = node.documentPath || null;
  const indexEntry = docPath ? getIndexEntry(docPath) : null;

  if (indexEntry) {
    appendIndexBlock(indexEntry);
  }

  els.docPath.textContent = docPath || "—";

  if (docPath && indexEntry) {
    els.toggleSourceButton.hidden = false;
    els.toggleSourceButton.textContent = state.showSource ? "Hide markdown" : "Show markdown";
    els.docSection.classList.toggle("isCollapsed", !state.showSource);
    if (state.showSource) {
      loadDocument(docPath);
    } else {
      els.docContent.innerHTML =
        '<p class="placeholder">Indexed summary is shown above. Click <strong>Show markdown</strong> to load the full file.</p>';
    }
  } else {
    els.toggleSourceButton.hidden = true;
    els.docSection.classList.add("isCollapsed");
    const rawPath = resolveRawPath(node);
    if (rawPath && rawPath.toLowerCase().endsWith(".json")) {
      els.docContent.innerHTML =
        '<p class="placeholder">This item references structured JSON (<code>' +
        escapeHtml(rawPath) +
        "</code>). Use the fields above — raw JSON is not shown in the dashboard reader.</p>";
    } else if (rawPath) {
      els.docContent.innerHTML =
        '<p class="placeholder">No indexed markdown for this item. Run <code>scripts/build-doc-index.py</code> after adding markers or registering the file in guidance.json.</p>';
    } else {
      els.docContent.innerHTML =
        '<p class="placeholder">No linked document. Structured dashboard fields are the source of truth for this item.</p>';
    }
  }
}

function resolveRawPath(node) {
  if (node.payload?.data?.documentPath) return node.payload.data.documentPath;
  const docId = node.payload?.data?.documentId;
  if (docId && state.guidance?.documents) {
    return state.guidance.documents.find((d) => d.id === docId)?.path || null;
  }
  return null;
}

function appendIndexBlock(entry) {
  const el = document.createElement("div");
  el.className = "detailBlock indexBlock";
  let html = `<h4>Indexed document</h4><p>${escapeHtml(entry.summary)}</p>`;
  html += `<p class="indexMetaLine"><span>${escapeHtml(entry.category)}</span> · ${escapeHtml(entry.inclusionReason)}</p>`;
  if (entry.sections?.length) {
    html += "<h4>Sections</h4><ul>";
    entry.sections.forEach((s) => {
      html += `<li>${"·".repeat(s.level)} ${escapeHtml(s.title)}</li>`;
    });
    html += "</ul>";
  }
  el.innerHTML = html;
  els.structuredDetail.append(el);
}

function renderStructuredBlocks(node) {
  const { payload } = node;
  const blocks = [];

  if (payload.type === "overview") {
    blocks.push(block("Purpose", payload.project.purpose));
    blocks.push(block("Context", payload.project.context));
    blocks.push(block("Summary", payload.data.summary));
    blocks.push(listBlock("Highlights", payload.data.highlights));
    blocks.push(listBlock("Owners", payload.data.owners || payload.project.owners));
    if (state.docIndex) {
      blocks.push(
        block(
          "Indexed documentation",
          `${state.docIndex.entryCount} markdown files (run scripts/build-doc-index.py to refresh)`
        )
      );
    }
  }

  if (payload.type === "phase") {
    blocks.push(block("Summary", payload.data.summary));
    blocks.push(block("Status", payload.data.status));
    if (payload.data.milestones?.length) {
      blocks.push(
        listBlock(
          "Milestones",
          payload.data.milestones.map((m) => `${m.title} — ${m.summary}`)
        )
      );
    }
  }

  if (payload.type === "milestone") {
    blocks.push(block("Phase", payload.phase.title));
    blocks.push(block("Summary", payload.data.summary));
    if (payload.data.status) blocks.push(block("Status", payload.data.status));
  }

  if (payload.type === "completed") {
    blocks.push(block("Completed", payload.data.completedAt));
    blocks.push(block("Summary", payload.data.summary));
    if (payload.data.details) blocks.push(block("Details", payload.data.details));
  }

  if (payload.type === "current-task") {
    blocks.push(block("Status", payload.data.status));
    blocks.push(block("Summary", payload.data.summary));
    if (payload.data.details) blocks.push(block("Details", payload.data.details));
    if (payload.data.blockers?.length) blocks.push(listBlock("Blockers", payload.data.blockers));
  }

  if (payload.type === "current-phase") {
    blocks.push(block("Summary", payload.data.summary));
    if (payload.data.progressPercent != null) {
      const wrap = document.createElement("div");
      wrap.className = "detailBlock";
      wrap.innerHTML = `<h4>Progress</h4><p>${payload.data.progressPercent}%</p><div class="progressBar"><span style="width:${payload.data.progressPercent}%"></span></div>`;
      blocks.push(wrap);
    }
  }

  blocks.forEach((el) => els.structuredDetail.append(el));
}

function block(title, text) {
  const el = document.createElement("div");
  el.className = "detailBlock";
  el.innerHTML = "<h4></h4><p></p>";
  el.querySelector("h4").textContent = title;
  el.querySelector("p").textContent = text || "—";
  return el;
}

function listBlock(title, items) {
  const el = document.createElement("div");
  el.className = "detailBlock";
  const h = document.createElement("h4");
  h.textContent = title;
  el.append(h);
  if (!items?.length) {
    const p = document.createElement("p");
    p.textContent = "—";
    el.append(p);
    return el;
  }
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.append(li);
  });
  el.append(ul);
  return el;
}

async function loadDocument(path) {
  if (state.docCache.has(path)) {
    els.docContent.innerHTML = state.docCache.get(path);
    return;
  }
  els.docContent.innerHTML = '<p class="placeholder">Loading…</p>';
  try {
    const response = await fetch(`../${path}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = renderMarkdown(await response.text());
    state.docCache.set(path, html);
    els.docContent.innerHTML = html;
  } catch (error) {
    els.docContent.innerHTML = `<p class="docError">${escapeHtml(path)}: ${escapeHtml(error.message)}</p>`;
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let inCode = false;
  let codeBuf = [];
  let listType = null;

  const flushList = () => {
    if (!listType) return;
    out.push(listType === "ol" ? "</ol>" : "</ul>");
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushList();
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        inCode = false;
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)[0].length;
      out.push(`<h${level}>${inlineFormat(line.replace(/^#+\s*/, ""))}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
        out.push("<ul>");
      }
      out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (!line.trim()) {
      flushList();
      continue;
    }
    flushList();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function setStatus(message, isError = false) {
  els.statusLine.textContent = message;
  els.statusLine.classList.toggle("isError", isError);
}

function bindEvents() {
  els.filterInput.addEventListener("input", (e) => {
    state.filter = e.target.value.trim();
    renderTree();
  });

  els.reloadButton.addEventListener("click", () => {
    state.docCache.clear();
    loadInstance(state.instanceId).catch((err) => setStatus(err.message, true));
  });

  els.instanceSelect.addEventListener("change", (e) => {
    const id = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set("instance", id);
    window.history.replaceState({}, "", url);
    loadInstance(id).catch((err) => setStatus(err.message, true));
  });

  els.toggleSourceButton.addEventListener("click", () => {
    state.showSource = !state.showSource;
    renderDetail();
  });
}

async function init() {
  bindEvents();
  const instanceId = getInstanceFromQuery();
  els.instanceSelect.replaceChildren();
  for (const id of [instanceId, DEFAULT_INSTANCE].filter((v, i, a) => a.indexOf(v) === i)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = id;
    opt.selected = id === instanceId;
    els.instanceSelect.append(opt);
  }
  try {
    await loadInstance(instanceId);
  } catch (error) {
    setStatus(`Load failed: ${error.message}. Run scripts/serve.sh ${instanceId}`, true);
  }
}

init();
