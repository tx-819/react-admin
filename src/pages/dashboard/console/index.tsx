import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Space,
  Button,
  Typography,
  Avatar,
  List,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

// 统计数据接口
interface StatisticData {
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
interface TableDataItem {
  key: string;
  id: string;
  name: string;
  status: string;
  amount: number;
  date: string;
}

// 活动数据接口
interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar?: string;
}

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

  // 表格列定义
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
  const salesProgress = [
    { name: "本月目标", current: 75, target: 100, unit: "万元" },
    { name: "季度目标", current: 180, target: 300, unit: "万元" },
    { name: "年度目标", current: 650, target: 1200, unit: "万元" },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <Title level={2} style={{ margin: 0 }}>
          控制台
        </Title>
        <Space>
          <Button>导出数据</Button>
          <Button type="primary">刷新</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statisticsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle}
              />
              {stat.trend && (
                <div style={{ marginTop: 8 }}>
                  <Space>
                    {stat.trend.isRise ? (
                      <ArrowUpOutlined style={{ color: "#3f8600" }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: "#cf1322" }} />
                    )}
                    <span
                      style={{
                        color: stat.trend.isRise ? "#3f8600" : "#cf1322",
                      }}
                    >
                      {Math.abs(stat.trend.value)}%
                    </span>
                    <span style={{ color: "#8c8c8c", fontSize: 12 }}>
                      较上月
                    </span>
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={[16, 16]}>
        {/* 最近订单表格 */}
        <Col xs={24} lg={24}>
          <Card title="最近订单" extra={<Button type="link">查看全部</Button>}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近活动" size="small">
            <List
              dataSource={activityData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#87d068" }}
                      />
                    }
                    title={item.user}
                    description={
                      <div>
                        <div>{item.action}</div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                          {item.time}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          {/* 销售进度 */}
          <Card title="销售进度" size="small">
            {salesProgress.map((item, index) => (
              <div key={index}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span>{item.name}</span>
                  <span>
                    {item.current}/{item.target} {item.unit}
                  </span>
                </div>
                <Progress
                  percent={Math.round((item.current / item.target) * 100)}
                  status={item.current >= item.target ? "success" : "active"}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Console;
