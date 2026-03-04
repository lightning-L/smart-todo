/** 扁平列表项：level 0 = 根的直接子任务，1 = 子任务的子任务，以此类推 */
export interface AISplitItemWithLevel {
  title: string;
  note?: string;
  level: number;
}

export interface AISplitResponse {
  items: AISplitItemWithLevel[];
  disclaimer: string;
}
