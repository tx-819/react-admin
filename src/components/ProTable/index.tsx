import { useImperativeHandle, forwardRef } from "react";
import { Table } from "antd";
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

  useImperativeHandle(ref, () => refMethods);

  const renderTitle = () => {
    const titleContent =
      typeof tableProps.title === "function" ? (
        tableProps.title(dataSource)
      ) : (
        <span className="text-lg font-bold">{tableProps.title}</span>
      );
    // 如果不需要显示任何按钮，直接返回原 title
    if (!showRefresh && !showSizeChanger && !showColumnFilter) {
      return () => titleContent;
    }

    return () => (
      <div className="flex justify-between items-center">
        <span>{titleContent}</span>
        <Settings {...settingsOptions} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <Table
        {...tableProps}
        columns={columns}
        title={renderTitle()}
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
