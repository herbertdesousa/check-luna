import { TabsNav } from "@/ui/tabs-nav";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TabsNav />
      <main className="flex-1 px-6 pb-24 pt-8">{children}</main>
    </>
  );
}
