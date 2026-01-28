import { Tag } from "antd";
import dayjs from "dayjs";
import ProTable from "@/components/ProTable";
import type { ProColumnType } from "@/components/ProTable/types";
import type { TableDataItem } from "./types";
import { getOrderList } from "@/api/order";

const RecentOrders = () => {
  const columns: ProColumnType<TableDataItem>[] = [
    {
      title: "订单ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入订单ID",
        },
      },
    },
    {
      title: "客户名称",
      dataIndex: "name",
      key: "name",
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入客户名称",
        },
      },
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
      formItem: {
        type: "select",
        fieldProps: {
          placeholder: "请选择状态",
        },
        options: [
          { label: "已完成", value: "已完成" },
          { label: "处理中", value: "处理中" },
          { label: "待支付", value: "待支付" },
          { label: "已取消", value: "已取消" },
        ],
      },
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `¥${amount.toLocaleString()}`,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入金额",
        },
      },
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      formItem: {
        type: "datePicker",
        fieldProps: {
          placeholder: "请选择日期",
        },
      },
    },
  ];

  return (
    <ProTable<TableDataItem>
      columns={columns}
      request={async (params) => {
        // 处理日期格式转换（将 dayjs 对象转换为字符串）
        const requestParams: Record<string, unknown> = { ...params };
        if (params?.date) {
          try {
            const date = dayjs(
              params?.date as string | number | Date | dayjs.Dayjs
            );
            if (date.isValid()) {
              requestParams.date = date.format("YYYY-MM-DD");
            }
          } catch (error) {
            console.warn("日期格式转换失败:", error);
          }
        }
        const result = await getOrderList(requestParams);
        return {
          data: result.data,
          total: result.total,
        };
      }}
      title="最近订单"
    />
  );
};

export default RecentOrders;
