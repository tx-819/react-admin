import { Card, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import ProTable from "@/components/ProTable";
import type { TableDataItem } from "./types";

interface RecentOrdersProps {
  data: TableDataItem[];
  loading?: boolean;
}

const RecentOrders = ({ data, loading }: RecentOrdersProps) => {
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
    <Card title="最近订单">
      <ProTable<TableDataItem>
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 5 }}
        size="middle"
      />
    </Card>
  );
};

export default RecentOrders;
