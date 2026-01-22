import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import ProTable from "@/components/ProTable";
import type { TableDataItem } from "./types";
import { getOrderList } from "@/api/order";

const RecentOrders = () => {
  const columns: ColumnsType<TableDataItem> = [
    {
      title: "订单ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "客户名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          已完成: "success",
          处理中: "processing",
          待支付: "warning",
          已取消: "error",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <ProTable<TableDataItem>
      columns={columns}
      request={async (params) => {
        const result = await getOrderList(params);
        return {
          data: result.data,
          total: result.total,
        };
      }}
      size="middle"
      title="最近订单"
    />
  );
};

export default RecentOrders;
