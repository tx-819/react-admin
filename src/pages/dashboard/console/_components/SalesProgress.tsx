import { Card, Progress } from "antd";
import type { SalesProgressItem } from "./types";

interface SalesProgressProps {
  data: SalesProgressItem[];
}

const SalesProgress = ({ data }: SalesProgressProps) => {
  return (
    <Card title="销售进度" size="small">
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: index < data.length - 1 ? 16 : 0 }}>
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
  );
};

export default SalesProgress;

