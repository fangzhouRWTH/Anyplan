# ADR 0003: Bounded Context Retrieval

## Status

Accepted

## Context

Anyplan's first case-study project showed that useful AI collaboration records can grow large quickly. A project can still fit its documents into a modern context window while becoming inefficient to use: repeated startup reads waste attention, duplicated summaries drift, and old reference material can accidentally outweigh current code or active guidance.

The framework already separates memory types, but it did not yet describe how AI collaborators should choose how much memory to load for a specific task.

## Decision

Anyplan adds bounded context retrieval to the portable guidance methodology.

Project instances should distinguish document **authority** from document **retrieval depth**. A highly authoritative document can be short and always read; a large evidence document can be valuable but read only on demand.

The recommended retrieval tiers are:

- `task-scope`: small current-task guidance and current-state entry points.
- `phase-context`: compact summaries prepared for a phase, milestone, release, or comparable work interval.
- `deep-source`: detailed architecture, decisions, reference reports, module descriptions, and historical records.
- `archive`: old evidence and chronological history read only for provenance, deliberate direction changes, or forensic debugging.

The schema now allows document records to carry optional metadata for memory type, authority, retrieval tier, default read behavior, context cost, summary/source relationships, read triggers, invalidation cues, and review date.

## Consequences

Benefits:

- Future project instances can reduce AI context cost without discarding detailed records.
- Visual tools can route users and AI agents to the right document depth.
- Deep reading remains allowed, but it becomes intentional and explainable.
- Phase summaries can act as working context without pretending to be the source of truth.

Costs:

- Existing instances may need document-map enrichment to get the full benefit.
- Visual engine support for the new optional fields is not implemented yet.
- Projects must keep phase context summaries honest by linking them back to sources and marking invalidation triggers.
