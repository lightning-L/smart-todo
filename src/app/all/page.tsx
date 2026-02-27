import { AppLayout } from "@/components/AppLayout";
import { AllSections } from "@/components/AllSections";

export default function AllPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-lg font-medium text-foreground">全部</h1>
        <AllSections />
      </div>
    </AppLayout>
  );
}
