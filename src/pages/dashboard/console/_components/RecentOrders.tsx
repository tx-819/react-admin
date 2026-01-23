import { useState, useRef } from "react";
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import ProTable from "@/components/ProTable";
import type { ProTableRef } from "@/components/ProTable/types";
import SearchForm from "@/components/SearchForm";
import type { SearchFormRef } from "@/components/SearchForm";
import type { ProFormItemConfig } from "@/components/ProForm/types";
import type { TableDataItem } from "./types";
import { getOrderList } from "@/api/order";

const RecentOrders = () => {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({});
  const tableRef = useRef<ProTableRef>(null);
  const searchFormRef = useRef<SearchFormRef>(null);

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

  // 搜索表单配置
  const searchItems: ProFormItemConfig[] = [
    {
      name: "orderId",
      label: "订单ID",
      type: "input",
      placeholder: "请输入订单ID",
    },
    {
      name: "customerName",
      label: "客户名称",
      type: "input",
      placeholder: "请输入客户名称",
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      placeholder: "请选择状态",
      options: [
        { label: "已完成", value: "已完成" },
        { label: "处理中", value: "处理中" },
        { label: "待支付", value: "待支付" },
        { label: "已取消", value: "已取消" },
      ],
    },
    {
      name: "dateRange",
      label: "日期范围",
      type: "dateRangePicker",
    },
  ];

  // 处理搜索
  const handleSearch = async (values: Record<string, unknown>) => {
    // 处理日期范围
    const params: Record<string, unknown> = { ...values };
    if (
      values.dateRange &&
      Array.isArray(values.dateRange) &&
      values.dateRange.length === 2
    ) {
      // 将 dayjs 对象转换为字符串
      params.startDate = values.dateRange[0]
        ? dayjs(values.dateRange[0]).format("YYYY-MM-DD")
        : undefined;
      params.endDate = values.dateRange[1]
        ? dayjs(values.dateRange[1]).format("YYYY-MM-DD")
        : undefined;
      delete params.dateRange;
    }
    setSearchParams(params);
    // 触发表格刷新
    if (tableRef.current) {
      await tableRef.current.refresh();
    }
  };

  // 处理重置
  const handleReset = () => {
    setSearchParams({});
    if (tableRef.current) {
      tableRef.current.refresh();
    }
  };

  return (
    <>
      <SearchForm
        ref={searchFormRef}
        items={searchItems}
        options={{
          onSearch: handleSearch,
          onReset: handleReset,
          collapsible: true,
          defaultShowItems: 3,
        }}
      />
      <ProTable<TableDataItem>
        ref={tableRef}
        columns={columns}
        request={async (params) => {
          // 合并搜索参数和分页参数
          const requestParams = {
            ...params,
            ...searchParams,
          };
          const result = await getOrderList(requestParams);
          return {
            data: result.data,
            total: result.total,
          };
        }}
        params={searchParams}
        size="middle"
        title="最近订单"
      />
    </>
  );
};

export default RecentOrders;
