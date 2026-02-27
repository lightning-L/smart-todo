import { AppLayout } from "@/components/AppLayout";
import { CommandBarQuickAdd } from "@/components/CommandBarQuickAdd";
import { AgendaView } from "@/components/AgendaView";

export default function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 p-6">
        <CommandBarQuickAdd />
        <AgendaView />
      </div>
    </AppLayout>
  );
}
