export interface AISplitItem {
  title: string;
  note?: string;
}

export interface AISplitGroup {
  name: string;
  items: AISplitItem[];
}

export interface AISplitResponse {
  groups: AISplitGroup[];
  disclaimer: string;
}

/** Mock AI split: returns preset templates based on title keywords. */
export function getMockSplit(
  rootTitle: string,
  _rootDescription?: string,
  _deadlineAt?: string
): AISplitResponse {
  const lower = rootTitle.toLowerCase();
  if (lower.includes("报税") || lower.includes("税")) {
    return {
      groups: [
        { name: "准备资料", items: [{ title: "收集 W-2 / 1099", note: "" }] },
        { name: "填写与核对", items: [{ title: "录入收入与扣除项并自查" }] },
        { name: "提交与留存", items: [{ title: "提交报税并保存回执" }] },
      ],
      disclaimer: "仅作清单建议，具体以官方/专业人士为准。",
    };
  }
  if (lower.includes("退货")) {
    return {
      groups: [
        { name: "打包", items: [{ title: "整理物品与包装" }] },
        { name: "寄送", items: [{ title: "预约取件或到点投递" }] },
        { name: "跟进", items: [{ title: "确认收款与退款" }] },
      ],
      disclaimer: "清单仅供参考。",
    };
  }
  return {
    groups: [
      { name: "第一步", items: [{ title: "拆解子任务 1" }] },
      { name: "第二步", items: [{ title: "拆解子任务 2" }] },
      { name: "第三步", items: [{ title: "拆解子任务 3" }] },
    ],
    disclaimer: "以上为示例拆解，请按需修改。",
  };
}
