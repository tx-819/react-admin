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
  ActivityItem,
  SalesProgressItem,
  ToDoItem,
} from "./_components/types";
import ToDoList from "./_components/ToDoList/ToDoList";
import { useEffect, useState } from "react";

const Console = () => {
  const [todoData, setTodoData] = useState<ToDoItem[]>([]);

  useEffect(() => {
    // 模拟获取待办数据
    // 待办数据
    const todoDataResponse: ToDoItem[] = [
      {
        id: "1",
        task: "学node",
        time: "上午 9:00",
        completed: false,
      },
      {
        id: "2",
        task: "学React",
        time: "上午 10:00",
        completed: true,
      },
      {
        id: "3",
        task: "写组件",
        time: "下午 2:00",
        completed: false,
      },
    ];
    setTodoData(todoDataResponse);
  }, []);
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
          <RecentOrders />
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ToDoList data={todoData} setData={setTodoData} />
        </Col>
      </Row>
    </div>
  );
};

export default Console;
