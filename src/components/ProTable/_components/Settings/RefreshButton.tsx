import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface RefreshButtonProps {
  /** 加载状态 */
  loading?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
}

const RefreshButton = ({ loading = false, onRefresh }: RefreshButtonProps) => {
  return (
    <Button
      icon={<ReloadOutlined spin={loading} />}
      onClick={onRefresh}
      loading={loading}
      disabled={loading}
    />
  );
};

export default RefreshButton;

