/** Parent route when browser history has nowhere sensible to go */
export function getBackFallback(pathname: string, search = ""): string {
  const params = new URLSearchParams(search.replace(/^\?/, ""));

  if (pathname.startsWith("/planner")) {
    if (params.get("view") === "chat") {
      const id = params.get("id");
      return id ? `/planner?id=${id}` : "/planner";
    }
    return "/dashboard";
  }

  if (/^\/properties\/[^/]+$/.test(pathname)) return "/hidden-gems";
  if (/^\/book\/[^/]+$/.test(pathname)) return "/hidden-gems";
  if (pathname === "/book/success") return "/dashboard";

  if (pathname.endsWith("/edit")) {
    return pathname.replace(/\/edit$/, "") || "/";
  }

  if (/^\/business\/properties\/[^/]+$/.test(pathname)) return "/business/properties";
  if (pathname.startsWith("/business/properties")) return "/business";
  if (pathname.startsWith("/business")) return "/";
  if (pathname.startsWith("/admin")) return "/";

  if (pathname.startsWith("/dashboard")) return "/";
  if (pathname === "/login" || pathname === "/register") return "/";
  if (pathname === "/hidden-gems") return "/";

  return "/";
}
