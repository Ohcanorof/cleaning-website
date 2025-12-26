import LoginForm from "./LoginForm";

export default function OwnerLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next ?? "/owner";
  return <LoginForm next={next} />;
}