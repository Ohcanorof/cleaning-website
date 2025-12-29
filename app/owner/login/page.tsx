import LoginForm from "./LoginForm";

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = first(sp.next) ?? "/owner";

  return <LoginForm next={next} />;
}