// 统计数据接口
export interface StatisticData {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  valueStyle?: React.CSSProperties;
  trend?: {
    value: number;
    isRise: boolean;
  };
}

// 表格数据接口
export interface TableDataItem {
  key: string;
  id: string;
  name: string;
  status: string;
  amount: number;
  date: string;
}

// 活动数据接口
export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar?: string;
}

// 销售进度数据接口
export interface SalesProgressItem {
  name: string;
  current: number;
  target: number;
  unit: string;
}

