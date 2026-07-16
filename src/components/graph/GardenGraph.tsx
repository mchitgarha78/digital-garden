"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type GraphNode = {
  id: string;
  title: string;
  slug: string;
  posX: number;
  posY: number;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

type GardenGraphProps = {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
};

export function GardenGraph({ initialNodes, initialEdges }: GardenGraphProps) {
  const [mounted, setMounted] = useState(false);

  const flowNodes: Node[] = useMemo(
    () =>
      initialNodes.map((n) => ({
        id: n.id,
        type: "default",
        position: { x: n.posX, y: n.posY },
        data: { label: n.title, slug: n.slug },
        style: {
          background: "#ecfdf5",
          border: "1px solid #6ee7b7",
          borderRadius: 12,
          padding: 10,
          fontSize: 13,
          fontWeight: 500,
          color: "#065f46",
          minWidth: 120,
          textAlign: "center" as const,
        },
      })),
    [initialNodes],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      initialEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: "#34d399" },
      })),
    [initialEdges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  const onNodeDragStop: OnNodeDrag = useCallback(async (_event, node) => {
    const slug = node.data.slug as string;
    await fetch(`/api/notes/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posX: node.position.x, posY: node.position.y }),
    });
  }, []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const slug = node.data.slug as string;
    window.location.href = `/notes/${slug}`;
  }, []);

  if (!mounted) {
    return <div className="h-[70vh] animate-pulse rounded-2xl bg-slate-100" />;
  }

  return (
    <div className="h-[70vh] overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#d1fae5" gap={20} />
        <Controls />
        <MiniMap
          nodeColor="#6ee7b7"
          maskColor="rgba(236, 253, 245, 0.7)"
          className="!bg-emerald-50"
        />
      </ReactFlow>
    </div>
  );
}

export function LocalGraphView({ slug }: { slug: string }) {
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(
    null,
  );

  useEffect(() => {
    fetch(`/api/graph/local/${slug}`)
      .then((r) => r.json())
      .then(setGraph)
      .catch(() => setGraph(null));
  }, [slug]);

  if (!graph) {
    return (
      <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
    );
  }

  const centerId = graph.nodes.find((n) => n.slug === slug)?.id;

  const nodes: Node[] = graph.nodes.map((n, i) => {
    const isCenter = n.id === centerId;
    const angle = (i / graph.nodes.length) * Math.PI * 2;
    const radius = isCenter ? 0 : 100;
    return {
      id: n.id,
      position: {
        x: 120 + Math.cos(angle) * radius,
        y: 80 + Math.sin(angle) * radius,
      },
      data: { label: n.title },
      style: {
        background: isCenter ? "#059669" : "#ecfdf5",
        color: isCenter ? "#fff" : "#065f46",
        border: `1px solid ${isCenter ? "#047857" : "#6ee7b7"}`,
        borderRadius: 8,
        padding: 6,
        fontSize: 11,
        fontWeight: isCenter ? 600 : 400,
        minWidth: 70,
        textAlign: "center" as const,
      },
      draggable: false,
    };
  });

  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: { stroke: "#34d399" },
  }));

  return (
    <div className="h-52 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f1f5f9" gap={16} />
      </ReactFlow>
    </div>
  );
}
