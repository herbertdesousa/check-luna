import { AdminNav } from "./admin-nav";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-8">
      <AdminNav />
      {children}
    </main>
  );
}
