import LoginClient from "./LoginClient";

type SearchParams = { [key: string]: string | string[] | undefined };

function normalizeNextPath(value: unknown) {
  const v = Array.isArray(value) ? value[0] : value;
  if (typeof v !== "string") return "/dashboard";
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  return v;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const nextPath = normalizeNextPath(sp.next);
  return <LoginClient nextPath={nextPath} />;
}

