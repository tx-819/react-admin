import { Card, Row, Col, Statistic, Space } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { StatisticData } from "./types";

interface StatisticCardsProps {
  data: StatisticData[];
}

const StatisticCards = ({ data }: StatisticCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      {data.map((stat, index) => (
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
  );
};

export default StatisticCards;

