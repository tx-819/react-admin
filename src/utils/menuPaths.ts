import type { MenuRecord } from "@/api/permission";

/** Trim trailing slashes (except root) and ensure leading `/`. */
export function normalizeMenuPath(path: string): string {
  const trimmed = path.trim();
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withSlash === "/") return "/";
  return withSlash.replace(/\/+$/, "") || "/";
}

/** DFS collect of every node's path in menu tree; normalize and dedupe (stable unique). */
export function collectNormalizedMenuPaths(menus: MenuRecord[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const walk = (nodes: MenuRecord[]) => {
    for (const n of nodes) {
      if (n.path) {
        const p = normalizeMenuPath(n.path);
        if (!seen.has(p)) {
          seen.add(p);
          out.push(p);
        }
      }
      if (n.children?.length) walk(n.children);
    }
  };

  walk(menus);
  return out;
}
