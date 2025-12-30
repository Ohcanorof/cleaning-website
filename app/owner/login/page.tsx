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

  return (
   <main className="min-h-screen bg-background text-foreground">
     <div className="mx-auto max-w-lg px-6 py-10">
      <div className="rounded-2xl bg-card shadow-sm border border-transparent p-6">
         <LoginForm next={next} />
       </div>
     </div>
   </main>
 );
}