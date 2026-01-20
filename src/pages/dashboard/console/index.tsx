import { Row, Col } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import StatisticCards from "./_components/StatisticCards";
import RecentOrders from "./_components/RecentOrders";
import RecentActivity from "./_components/RecentActivity";
import SalesProgress from "./_components/SalesProgress";
import type {
  StatisticData,
  TableDataItem,
  ActivityItem,
  SalesProgressItem,
} from "./_components/types";

const Console = () => {
  // 统计数据
  const statisticsData: StatisticData[] = [
    {
      title: "总用户数",
      value: 11280,
      prefix: <UserOutlined />,
      trend: { value: 12.5, isRise: true },
    },
    {
      title: "今日访问",
      value: 3245,
      prefix: <RiseOutlined />,
      trend: { value: 8.2, isRise: true },
    },
    {
      title: "订单总数",
      value: 8567,
      prefix: <ShoppingCartOutlined />,
      trend: { value: -3.1, isRise: false },
    },
    {
      title: "总收入",
      value: 1284567,
      prefix: <DollarOutlined />,
      suffix: "元",
      trend: { value: 15.8, isRise: true },
      valueStyle: { color: "#3f8600" },
    },
  ];

  // 表格数据
  const tableData: TableDataItem[] = [
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
  ];

  // 最近活动数据
  const activityData: ActivityItem[] = [
    {
      id: "1",
      user: "张三",
      action: "创建了新订单",
      time: "2分钟前",
    },
    {
      id: "2",
      user: "李四",
      action: "更新了个人信息",
      time: "15分钟前",
    },
    {
      id: "3",
      user: "王五",
      action: "完成了支付",
      time: "1小时前",
    },
    {
      id: "4",
      user: "赵六",
      action: "提交了反馈",
      time: "2小时前",
    },
  ];

  // 销售进度数据
  const salesProgress: SalesProgressItem[] = [
    { name: "本月目标", current: 75, target: 100, unit: "万元" },
    { name: "季度目标", current: 180, target: 300, unit: "万元" },
    { name: "年度目标", current: 650, target: 1200, unit: "万元" },
  ];

  return (
    <div className="space-y-6">
      <StatisticCards data={statisticsData} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <RecentOrders data={tableData} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <RecentActivity data={activityData} />
        </Col>
        <Col xs={24} lg={12}>
          <SalesProgress data={salesProgress} />
        </Col>
      </Row>
    </div>
  );
};

export default Console;
