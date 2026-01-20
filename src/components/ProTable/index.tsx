import { useImperativeHandle, forwardRef } from "react";
import { Table } from "antd";
import type { TableProps } from "antd/es/table";
import Settings from "./_components/Settings";
import useNormalizedProps from "./_hooks/useNormalizedProps";
import type { ProTableProps, ProTableRef } from "./types";

function ProTableInner<T = unknown>(
  props: ProTableProps<T>,
  ref: React.ForwardedRef<ProTableRef>
) {
  const {
    dataSource,
    loading,
    columns,
    refMethods,
    settingsOptions,
    ...tableProps
  } = useNormalizedProps(props);

  const { showRefresh, showSizeChanger, showColumnFilter } = settingsOptions;

  // 暴露方法给父组件
  useImperativeHandle(ref, () => refMethods);

  // 渲染表格标题栏
  const renderTitle = (): TableProps<T>["title"] => {
    // 如果不需要显示任何按钮，直接返回原 title
    if (!showRefresh && !showSizeChanger && !showColumnFilter) {
      return tableProps.title;
    }

    // 如果需要显示按钮，包装 title
    return (data: readonly T[]) => {
      const titleContent =
        typeof tableProps.title === "function"
          ? tableProps.title(data)
          : tableProps.title;

      return (
        <div className="flex justify-between items-center">
          <span>{titleContent}</span>
          <Settings {...settingsOptions} />
        </div>
      );
    };
  };

  return (
    <div>
      <Table
        {...tableProps}
        columns={columns}
        title={renderTitle() ?? undefined}
        dataSource={dataSource}
        loading={loading}
      />
    </div>
  );
}

const ProTable = forwardRef(ProTableInner) as <T = unknown>(
  props: ProTableProps<T> & { ref?: React.ForwardedRef<ProTableRef> }
) => React.ReactElement;

(ProTable as typeof ProTable & { displayName: string }).displayName =
  "ProTable";

export default ProTable;
