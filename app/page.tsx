import Advisor from "@/components/Advisor";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">PC Build Advisor</h1>
        <p className="text-sm text-slate-600">
          Tell us your budget and what you will use the PC for. We pick compatible parts from our catalogue and
          check them before you buy.
        </p>
      </header>
      <Advisor />
      <footer className="mt-6 text-xs text-slate-500">
        Course demo project. Catalogue and prices are sample data, not a real store. AI suggestions can be wrong;
        the compatibility check uses simplified rules, so confirm specs before buying.
      </footer>
    </main>
  );
}
