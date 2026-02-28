import { AppLayout } from "@/components/AppLayout";
import { InboxList } from "@/components/InboxList";

export default function InboxPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">收件箱</h1>
        <p className="text-sm text-slate-500">未安排日期的任务。安排后会自动移出收件箱。</p>
        <InboxList />
      </div>
    </AppLayout>
  );
}
