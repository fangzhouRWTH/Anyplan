const fallbackGuidance = {
  schemaVersion: "0.1.0",
  project: {
    id: "anyplan",
    name: "Anyplan",
    purpose: "Develop a portable guidance framework for AI-assisted software development and a visual interaction engine for project guidance instances.",
    documentationLanguage: "English",
    context: "Embedded fallback guidance. When opened through an HTTP server, the engine loads instances/anyplan/guidance.json first.",
    owners: ["fangzhou"]
  },
  principles: [
    {
      id: "english-documentation",
      title: "English documentation",
      statement: "Durable project documentation and guidance text should be written in English.",
      rationale: "A single documentation language improves search, review, and reuse."
    },
    {
      id: "portable-first",
      title: "Portable framework first",
      statement: "The framework body should remain independent of concrete project details.",
      rationale: "Framework and instance separation allows multiple projects to use the same engine."
    }
  ],
  roles: [
    {
      id: "human-owner",
      name: "Human Project Owner",
      responsibilities: ["Define research direction and acceptance criteria"],
      permissions: ["Change project goals"],
      handoffRules: ["High-impact decisions require human confirmation"]
    },
    {
      id: "ai-coding-agent",
      name: "AI Coding Agent",
      responsibilities: ["Recover context", "Implement scoped changes", "Run validation"],
      permissions: ["Edit repository files", "Run local non-destructive commands"],
      handoffRules: ["Do not overwrite user changes"]
    }
  ],
  workflows: [
    {
      id: "default-collaboration-loop",
      name: "Default AI Collaboration Loop",
      entrypoints: ["A human requests new work"],
      steps: [
        {
          id: "capture-intent",
          title: "Capture Intent",
          purpose: "Turn a natural-language goal into an executable task boundary.",
          actor: "human-owner, ai-coding-agent",
          inputs: ["User request"],
          actions: ["Identify goal, scope, and unknowns"],
          outputs: ["TaskBrief"],
          checks: ["The task has a deliverable"],
          next: ["recover-context"]
        },
        {
          id: "recover-context",
          title: "Recover Context",
          purpose: "Understand the current repository shape and durable guidance.",
          actor: "ai-coding-agent",
          inputs: ["TaskBrief"],
          actions: ["Read relevant files"],
          outputs: ["ContextSnapshot"],
          checks: ["Existing user changes are preserved"],
          next: ["plan-change"]
        },
        {
          id: "plan-change",
          title: "Plan Change",
          purpose: "Break the goal into executable, verifiable steps.",
          actor: "ai-coding-agent",
          inputs: ["ContextSnapshot"],
          actions: ["Choose an implementation path"],
          outputs: ["Implementation plan"],
          checks: ["The plan is small enough"],
          next: ["implement-change"]
        }
      ],
      exitCriteria: ["The requested artifact has been updated"]
    }
  ],
  constraints: [
    {
      id: "protect-user-work",
      category: "repository",
      rule: "Do not revert or overwrite user changes that were not created in the current task.",
      severity: "required",
      appliesTo: ["ai-coding-agent"],
      validation: "Check git status before edits."
    }
  ],
  interfaces: [
    {
      id: "task-brief",
      name: "TaskBrief",
      purpose: "Convert a user request into an executable task object.",
      producer: "human-owner or ai-coding-agent",
      consumer: "ai-coding-agent",
      fields: [
        {
          name: "intent",
          type: "string",
          required: true,
          description: "The core outcome requested by the user."
        }
      ]
    }
  ],
  documents: [
    {
      id: "framework-readme",
      title: "AI Collaboration Guidance Framework",
      path: "framework/README.md",
      kind: "framework",
      scope: "portable",
      portable: true
    }
  ],
  changeControl: {
    versioning: "The 0.x stage allows fast evolution.",
    proposalRequiredFor: ["Removing or renaming a top-level schema field"],
    reviewChecklist: ["The change keeps the framework body independent of concrete projects"]
  },
  selfGovernance: {
    activeWorkflow: "default-collaboration-loop",
    recordPath: "docs/ai-collaboration-log.md",
    minimumRecord: ["TaskBrief", "ContextSnapshot", "verification"]
  }
};

const state = {
  guidance: structuredClone(fallbackGuidance),
  selected: { type: "project", id: "anyplan" },
  activeWorkflowId: "default-collaboration-loop",
  query: "",
  dirty: false
};

const els = {
  schemaVersion: document.querySelector("#schemaVersion"),
  projectName: document.querySelector("#projectName"),
  workflowTitle: document.querySelector("#workflowTitle"),
  documentList: document.querySelector("#documentList"),
  workflowList: document.querySelector("#workflowList"),
  constraintList: document.querySelector("#constraintList"),
  interfaceList: document.querySelector("#interfaceList"),
  workflowGraph: document.querySelector("#workflowGraph"),
  detailType: document.querySelector("#detailType"),
  detailTitle: document.querySelector("#detailTitle"),
  detailMeta: document.querySelector("#detailMeta"),
  detailEditor: document.querySelector("#detailEditor"),
  dirtyState: document.querySelector("#dirtyState"),
  saveButton: document.querySelector("#saveButton"),
  resetButton: document.querySelector("#resetButton"),
  statusLine: document.querySelector("#statusLine"),
  exportButton: document.querySelector("#exportButton"),
  importFile: document.querySelector("#importFile"),
  searchInput: document.querySelector("#searchInput"),
  addStepButton: document.querySelector("#addStepButton"),
  moveUpButton: document.querySelector("#moveUpButton"),
  moveDownButton: document.querySelector("#moveDownButton"),
  deleteButton: document.querySelector("#deleteButton")
};

async function init() {
  try {
    const response = await fetch("../instances/anyplan/guidance.json", { cache: "no-store" });
    if (response.ok) {
      state.guidance = await response.json();
      state.activeWorkflowId = state.guidance.selfGovernance?.activeWorkflow || state.guidance.workflows[0]?.id;
      state.selected = { type: "workflow", id: state.activeWorkflowId };
      setStatus("Loaded instances/anyplan/guidance.json");
    }
  } catch {
    setStatus("Using embedded guidance");
  }

  bindEvents();
  render();
}

function bindEvents() {
  els.saveButton.addEventListener("click", applyEditor);
  els.resetButton.addEventListener("click", renderInspector);
  els.exportButton.addEventListener("click", exportGuidance);
  els.importFile.addEventListener("change", importGuidance);
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderNavigation();
  });
  els.addStepButton.addEventListener("click", addStep);
  els.moveUpButton.addEventListener("click", () => moveStep(-1));
  els.moveDownButton.addEventListener("click", () => moveStep(1));
  els.deleteButton.addEventListener("click", deleteSelected);
  els.detailEditor.addEventListener("input", () => setDirty(true));
}

function render() {
  els.schemaVersion.textContent = state.guidance.schemaVersion;
  els.projectName.textContent = state.guidance.project.name;
  const workflow = getActiveWorkflow();
  els.workflowTitle.textContent = workflow?.name || "No workflow selected";
  renderNavigation();
  renderGraph();
  renderInterfaces();
  renderInspector();
  updateActionState();
}

function renderNavigation() {
  renderItemList(els.documentList, state.guidance.documents, "document", (item) => item.title, (item) => item.path);
  renderItemList(els.workflowList, state.guidance.workflows, "workflow", (item) => item.name, (item) => `${item.steps.length} stages`);
  renderItemList(els.constraintList, state.guidance.constraints, "constraint", (item) => item.id, (item) => item.category);
}

function renderItemList(container, items, type, titleOf, metaOf) {
  container.replaceChildren();
  filtered(items).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `navItem ${state.selected.type === type && state.selected.id === item.id ? "isActive" : ""}`;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong").textContent = titleOf(item);
    button.querySelector("span").textContent = metaOf(item);
    button.addEventListener("click", () => selectItem(type, item.id));
    container.append(button);
  });
}

function filtered(items) {
  if (!state.query) return items;
  return items.filter((item) => JSON.stringify(item).toLowerCase().includes(state.query));
}

function selectItem(type, id) {
  state.selected = { type, id };
  if (type === "workflow") {
    state.activeWorkflowId = id;
  }
  if (type === "step") {
    const workflow = state.guidance.workflows.find((item) => item.steps.some((step) => step.id === id));
    state.activeWorkflowId = workflow?.id || state.activeWorkflowId;
  }
  render();
}

function renderGraph() {
  const workflow = getActiveWorkflow();
  els.workflowGraph.replaceChildren();
  if (!workflow) return;

  const width = Math.max(840, workflow.steps.length * 220 + 120);
  const height = 520;
  els.workflowGraph.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const defs = svgEl("defs");
  const marker = svgEl("marker", {
    id: "arrow",
    markerWidth: "10",
    markerHeight: "10",
    refX: "8",
    refY: "3",
    orient: "auto",
    markerUnits: "strokeWidth"
  });
  marker.append(svgEl("path", { d: "M0,0 L0,6 L9,3 z", fill: "#9ca9a1" }));
  defs.append(marker);
  els.workflowGraph.append(defs);

  const positions = workflow.steps.map((step, index) => ({
    step,
    x: 70 + index * 220,
    y: index % 2 === 0 ? 150 : 260
  }));

  positions.forEach(({ step, x, y }, index) => {
    step.next.forEach((nextId) => {
      const target = positions.find((position) => position.step.id === nextId);
      if (!target) return;
      const path = svgEl("path", {
        class: "edge",
        d: `M${x + 170},${y + 52} C${x + 205},${y + 52} ${target.x - 35},${target.y + 52} ${target.x},${target.y + 52}`
      });
      els.workflowGraph.append(path);
    });

    if (!step.next.length && index < positions.length - 1) {
      const target = positions[index + 1];
      els.workflowGraph.append(svgEl("path", {
        class: "edge",
        d: `M${x + 170},${y + 52} C${x + 205},${y + 52} ${target.x - 35},${target.y + 52} ${target.x},${target.y + 52}`
      }));
    }
  });

  positions.forEach(({ step, x, y }) => {
    const group = svgEl("g", {
      class: `node ${state.selected.type === "step" && state.selected.id === step.id ? "isActive" : ""}`,
      tabindex: "0",
      role: "button"
    });
    group.append(svgEl("rect", { x, y, width: "170", height: "104" }));
    const title = svgEl("text", { x: x + 14, y: y + 28, class: "nodeTitle" });
    title.textContent = truncate(step.title, 12);
    const actor = svgEl("text", { x: x + 14, y: y + 52, class: "nodeMeta" });
    actor.textContent = truncate(step.actor, 18);
    const output = svgEl("text", { x: x + 14, y: y + 76, class: "nodeMeta" });
    output.textContent = truncate(step.outputs.join(", "), 18);
    group.append(title, actor, output);
    group.addEventListener("click", () => selectItem("step", step.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") selectItem("step", step.id);
    });
    els.workflowGraph.append(group);
  });
}

function renderInterfaces() {
  els.interfaceList.replaceChildren();
  filtered(state.guidance.interfaces).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `interfaceItem ${state.selected.type === "interface" && state.selected.id === item.id ? "isActive" : ""}`;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong").textContent = item.name;
    button.querySelector("span").textContent = `${item.fields.length} fields`;
    button.addEventListener("click", () => selectItem("interface", item.id));
    els.interfaceList.append(button);
  });
}

function renderInspector() {
  const target = getSelectedTarget();
  els.detailType.textContent = labelForType(state.selected.type);
  els.detailTitle.textContent = titleForTarget(target);
  els.detailEditor.value = JSON.stringify(target, null, 2);
  els.detailMeta.replaceChildren();

  const meta = metaForTarget(target);
  Object.entries(meta).forEach(([key, value]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = String(value);
    els.detailMeta.append(dt, dd);
  });
}

function applyEditor() {
  let parsed;
  try {
    parsed = JSON.parse(els.detailEditor.value);
  } catch (error) {
    setStatus(`JSON parse error: ${error.message}`, true);
    return;
  }

  replaceSelectedTarget(parsed);
  setDirty(true);
  setStatus("Applied in memory");
  render();
}

function replaceSelectedTarget(value) {
  const { type, id } = state.selected;
  if (type === "project") {
    state.guidance.project = value;
    return;
  }
  const collectionName = collectionForType(type);
  if (collectionName) {
    const collection = state.guidance[collectionName];
    const index = collection.findIndex((item) => item.id === id);
    if (index >= 0) {
      collection[index] = value;
      if (type === "workflow") state.activeWorkflowId = value.id;
      state.selected.id = value.id;
    }
    return;
  }
  if (type === "step") {
    const workflow = getActiveWorkflow();
    const index = workflow.steps.findIndex((step) => step.id === id);
    if (index >= 0) {
      workflow.steps[index] = value;
      state.selected.id = value.id;
    }
  }
}

function addStep() {
  const workflow = getActiveWorkflow();
  if (!workflow) return;
  const nextIndex = workflow.steps.length + 1;
  const step = {
    id: `new-step-${nextIndex}`,
    title: `New Stage ${nextIndex}`,
    purpose: "Define this stage's goal.",
    actor: "ai-coding-agent",
    inputs: [],
    actions: [],
    outputs: [],
    checks: [],
    next: []
  };
  const previous = workflow.steps.at(-1);
  if (previous && !previous.next.includes(step.id)) {
    previous.next = [step.id];
  }
  workflow.steps.push(step);
  state.selected = { type: "step", id: step.id };
  markChanged("Added workflow step");
}

function moveStep(direction) {
  if (state.selected.type !== "step") return;
  const workflow = getActiveWorkflow();
  const index = workflow.steps.findIndex((step) => step.id === state.selected.id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= workflow.steps.length) return;
  const [step] = workflow.steps.splice(index, 1);
  workflow.steps.splice(nextIndex, 0, step);
  markChanged("Moved workflow step");
}

function deleteSelected() {
  const { type, id } = state.selected;
  if (type === "step") {
    const workflow = getActiveWorkflow();
    workflow.steps = workflow.steps.filter((step) => step.id !== id);
    workflow.steps.forEach((step) => {
      step.next = step.next.filter((nextId) => nextId !== id);
    });
    state.selected = { type: "workflow", id: workflow.id };
    markChanged("Deleted workflow step");
    return;
  }

  const collectionName = collectionForType(type);
  if (!collectionName) return;
  state.guidance[collectionName] = state.guidance[collectionName].filter((item) => item.id !== id);
  state.selected = { type: "project", id: state.guidance.project.id };
  markChanged("Deleted selected item");
}

function markChanged(message) {
  setDirty(true);
  setStatus(message);
  render();
}

function exportGuidance() {
  const blob = new Blob([JSON.stringify(state.guidance, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.guidance.project.id || "guidance"}.guidance.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Exported JSON");
}

function importGuidance(event) {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state.guidance = JSON.parse(String(reader.result));
      state.activeWorkflowId = state.guidance.selfGovernance?.activeWorkflow || state.guidance.workflows[0]?.id;
      state.selected = { type: "workflow", id: state.activeWorkflowId };
      setDirty(true);
      setStatus(`Imported ${file.name}`);
      render();
    } catch (error) {
      setStatus(`Import failed: ${error.message}`, true);
    }
  };
  reader.readAsText(file);
}

function getSelectedTarget() {
  const { type, id } = state.selected;
  if (type === "project") return state.guidance.project;
  if (type === "step") {
    return getActiveWorkflow()?.steps.find((step) => step.id === id) || {};
  }
  const collectionName = collectionForType(type);
  if (!collectionName) return {};
  return state.guidance[collectionName].find((item) => item.id === id) || {};
}

function getActiveWorkflow() {
  return state.guidance.workflows.find((workflow) => workflow.id === state.activeWorkflowId) || state.guidance.workflows[0];
}

function collectionForType(type) {
  return {
    document: "documents",
    workflow: "workflows",
    constraint: "constraints",
    interface: "interfaces"
  }[type];
}

function titleForTarget(target) {
  return target.name || target.title || target.id || state.guidance.project.name;
}

function labelForType(type) {
  return {
    project: "Project",
    document: "Document",
    workflow: "Workflow",
    step: "Stage",
    constraint: "Constraint",
    interface: "Interface"
  }[type] || "Object";
}

function metaForTarget(target) {
  if (!target || !Object.keys(target).length) return {};
  const meta = {};
  ["id", "name", "title", "kind", "scope", "category", "severity", "actor"].forEach((key) => {
    if (target[key] !== undefined) meta[key] = target[key];
  });
  if (target.steps) meta.steps = target.steps.length;
  if (target.fields) meta.fields = target.fields.length;
  return meta;
}

function updateActionState() {
  const isStep = state.selected.type === "step";
  const isWorkflow = state.selected.type === "workflow";
  els.addStepButton.disabled = !getActiveWorkflow();
  els.moveUpButton.disabled = !isStep;
  els.moveDownButton.disabled = !isStep;
  els.deleteButton.disabled = !(isStep || ["document", "constraint", "interface"].includes(state.selected.type)) || isWorkflow;
}

function setDirty(isDirty) {
  state.dirty = isDirty;
  els.dirtyState.textContent = isDirty ? "Not exported" : "Synced";
  els.dirtyState.classList.toggle("isDirty", isDirty);
}

function setStatus(message, isError = false) {
  els.statusLine.textContent = message;
  els.statusLine.classList.toggle("isError", isError);
}

function svgEl(name, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function truncate(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

init();
