# Design: Menu-based route access and 403 page

**Date:** 2026-05-08  
**Status:** Approved for implementation planning  
**Scope:** Authenticated users inside `basicLayout`; unauthorized URLs show 403. Unauthenticated access uses existing login redirect / global auth handling (out of scope for 403 semantics).

## 1. Goals

- Treat **user menu data** (`getUserMenus` → same tree as the sidebar) as the **set of allowed page paths**.
- When a **logged-in** user navigates to a URL **under `basicLayout`** that is **not** in that set, render a dedicated **403** view instead of the page component.
- Avoid **false 403 flashes** while menu data is still loading after session restore.

## 2. Non-goals

- Replacing or duplicating **unauthenticated** handling (e.g. redirect to `/login`). This feature assumes existing mechanisms handle guests; 403 applies only to **logged-in** users without menu rights for the current URL.
- Removing routes from the router table based on menu (no dynamic router rebuild in this spec).
- Changing **button-level** `Access` / `authActions` behavior (remains independent).

## 3. User-visible behavior

| State | URL | Result |
|--------|-----|--------|
| Not logged in | Business URL under layout | Existing login / 401 flow; **not** this 403 feature |
| Logged in, `isSuper === true` | Any business URL under layout | **Allow** (aligned with `Access` superuser bypass) |
| Logged in, menu still loading (`menuLoading === true`) | Any | **No 403**; show existing loading / skeleton pattern until menu is ready |
| Logged in, menu loaded | Path matches allowed set | Render matched route |
| Logged in, menu loaded | Path not in allowed set | Render **403** page |
| Any | `/login`, `/register`, etc. (outside layout) | Unchanged; no menu guard |

**Path matching:** Normalize both the current `location.pathname` and each menu `path` the same way: trim trailing `/`, ensure leading `/`. Match is **exact** after normalization. If the backend only returns **leaf** menu paths, visiting a **parent-only** URL (e.g. `/system` when only `/system/users` exists) is **not** allowed—documented product behavior; optional prefix rules are a future enhancement.

## 4. Architecture

**Approach:** Layout-level **route guard** wrapping the layout outlet (recommended option 1 from brainstorm).

- **Single responsibility:** One small component (working name `MenuRouteGuard`) reads auth + menu state, computes allow/deny, renders either `<Outlet />` or the 403 page.
- **Data source:** Allowed paths are derived from the same **`MenuRecord[]`** (or equivalent) that feeds `setMenuList`. Prefer storing a derived **`Set` of normalized path strings** in `menuStore` when menus are set, so the guard does not re-walk Ant Design `ItemType` trees or diverge from API types.

## 5. Components and data flow

1. **`useInitUser`** (or the code path that calls `setMenuList`): After successful `getUserMenus`, compute `allowedPathnames` from the **recursive** menu tree (`path` on every node that has one) and persist alongside `menuList` (e.g. `setAllowedPaths(paths: string[])` or store a `Set` in zustand state).
2. **On menu fetch failure:** Clear or replace menu state consistently: set `menuList` to `[]`, `allowedPathnames` to empty, `menuLoading` to `false`, and log / surface error per existing patterns—**do not** leave `menuLoading` stuck `true`.
3. **`MenuRouteGuard`:** Placed in `basicLayout` where `useOutlet()` is consumed today:
   - If `!isLogin`: render `<Outlet />` only (no 403); unauthenticated redirect remains elsewhere.
   - If `isLogin && menuLoading`: render `<Outlet />` or the same loading treatment the layout already uses for menu bootstrap (must not evaluate 403).
   - If `isLogin && !menuLoading && isSuper`: render `<Outlet />`.
   - If `isLogin && !menuLoading && !isSuper`: if normalized `pathname` is in `allowedPathnames`, render `<Outlet />`; else render **403 page**.
4. **403 page:** New route-level or inline component using Ant Design `Result` with `status="403"`, short copy, and a primary action (e.g. “Back to home”) navigating to a safe default (e.g. first allowed path or a fixed dashboard path—**pick one in implementation plan** and keep consistent).

## 6. Files likely touched (implementation hint)

- `src/layouts/basicLayout/index.tsx` — wrap outlet with guard.
- `src/store/menuStore.ts` — `allowedPathnames` (or similar) + setter; helper to flatten paths from `MenuRecord[]`.
- `src/hooks/useInitUser.ts` — pass raw menus into store logic that updates both `menuList` and allowed set; failure path clears loading and menu-derived state.
- `src/main.tsx` — already sets `menuLoading` when persisted login; no semantic change required unless loading flags need tightening.
- New: `src/pages/.../forbidden` or `403` — only if you prefer a lazy page; otherwise a `components/Forbidden403` used only by the guard is acceptable.

## 7. Testing / verification (manual)

- Logged-in user with menu only for `/dashboard/console`: direct navigation to `/system/users` shows 403.
- Super user: same URL still loads page.
- Refresh on allowed page: no 403 flash after menu loads.
- Logged-out user hitting business URL: still goes to login (or current app behavior), not 403.

## 8. Self-review checklist

- **Placeholders:** None; default redirect target for 403 is explicitly deferred to implementation plan.
- **Consistency:** Superuser and `Access` aligned; loading uses existing `menuLoading` contract.
- **Scope:** Single layout guard + store field + 403 UI; no dynamic router rebuild.
- **Ambiguity:** Unauthenticated behavior explicitly out of scope; exact match only unless a follow-up spec adds prefix rules.
