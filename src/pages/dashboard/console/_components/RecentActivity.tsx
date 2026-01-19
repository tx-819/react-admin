import { Card, List, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { ActivityItem } from "./types";

interface RecentActivityProps {
  data: ActivityItem[];
}

const RecentActivity = ({ data }: RecentActivityProps) => {
  return (
    <Card title="最近活动" size="small">
      <List
        dataSource={data}
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
  );
};

export default RecentActivity;

