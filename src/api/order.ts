import { request } from "@/utils/request";
import type { TableDataItem } from "@/pages/dashboard/console/_components/types";

/**
 * 订单列表请求参数
 */
export interface GetOrderListParams {
  current?: number;
  page?: number;
  pageNum?: number;
  pageSize?: number;
  size?: number;
}

/**
 * 订单列表响应
 */
export interface GetOrderListResponse {
  data: TableDataItem[];
  total: number;
}

/**
 * Mock 订单数据
 */
const mockOrders: TableDataItem[] = [
  {
    key: "1",
    id: "ORD-001",
    name: "张三",
    status: "已完成",
    amount: 1280,
    date: "2024-01-15",
  },
  {
    key: "2",
    id: "ORD-002",
    name: "李四",
    status: "处理中",
    amount: 2560,
    date: "2024-01-15",
  },
  {
    key: "3",
    id: "ORD-003",
    name: "王五",
    status: "待支付",
    amount: 890,
    date: "2024-01-14",
  },
  {
    key: "4",
    id: "ORD-004",
    name: "赵六",
    status: "已完成",
    amount: 3450,
    date: "2024-01-14",
  },
  {
    key: "5",
    id: "ORD-005",
    name: "钱七",
    status: "已取消",
    amount: 1200,
    date: "2024-01-13",
  },
  {
    key: "6",
    id: "ORD-006",
    name: "孙八",
    status: "已完成",
    amount: 2100,
    date: "2024-01-13",
  },
  {
    key: "7",
    id: "ORD-007",
    name: "周九",
    status: "处理中",
    amount: 1580,
    date: "2024-01-12",
  },
  {
    key: "8",
    id: "ORD-008",
    name: "吴十",
    status: "待支付",
    amount: 3200,
    date: "2024-01-12",
  },
  {
    key: "9",
    id: "ORD-009",
    name: "郑一",
    status: "已完成",
    amount: 980,
    date: "2024-01-11",
  },
  {
    key: "10",
    id: "ORD-010",
    name: "王二",
    status: "处理中",
    amount: 2750,
    date: "2024-01-11",
  },
  {
    key: "11",
    id: "ORD-011",
    name: "李三",
    status: "已完成",
    amount: 1890,
    date: "2024-01-10",
  },
  {
    key: "12",
    id: "ORD-012",
    name: "张四",
    status: "待支付",
    amount: 1450,
    date: "2024-01-10",
  },
  {
    key: "13",
    id: "ORD-013",
    name: "刘五",
    status: "已完成",
    amount: 3200,
    date: "2024-01-09",
  },
  {
    key: "14",
    id: "ORD-014",
    name: "陈六",
    status: "处理中",
    amount: 2100,
    date: "2024-01-09",
  },
  {
    key: "15",
    id: "ORD-015",
    name: "杨七",
    status: "已完成",
    amount: 1680,
    date: "2024-01-08",
  },
];

/**
 * 获取订单列表（Mock 数据）
 * @param params 请求参数，包含分页信息
 * @returns 订单列表和总数
 */
export const getOrderList = async (
  params?: GetOrderListParams
): Promise<GetOrderListResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 获取分页参数
  const current = params?.current || params?.page || params?.pageNum || 1;
  const pageSize = params?.pageSize || params?.size || 10;

  // 计算分页
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = mockOrders.slice(start, end);

  return {
    data: paginatedData,
    total: mockOrders.length,
  };
};

/**
 * 获取订单列表（实际 API 调用）
 * 当有真实后端时，可以使用此函数替换 mock 版本
 */
export const getOrderListApi = async (
  params?: GetOrderListParams
): Promise<GetOrderListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.current) queryParams.append("current", String(params.current));
  if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.size) queryParams.append("size", String(params.size));

  const response = await request<GetOrderListResponse>(
    `/orders?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  return response;
};

