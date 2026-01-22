import type { ProTableProps } from "../types";
import { useCallback, useEffect, useState } from "react";
import useTableSettings from "./useTableSettings";

const useNormalizedProps = <T = unknown>(props: ProTableProps<T>) => {
  const {
    request,
    params,
    dataSource: externalDataSource,
    options,
    loading: externalLoading,
    columns,
    size,
    ...rest
  } = props;

  const [dataSource, setDataSource] = useState<T[]>(props.dataSource || []);
  const [loading, setLoading] = useState(false);

  const {
    filteredColumns,
    settingsOptions: tableSettingsOptions,
    tableSize,
  } = useTableSettings({
    columns,
    initialSize: size,
    options,
  });

  const finalLoading =
    externalLoading !== undefined ? externalLoading : loading;

  // 加载数据
  const loadData = useCallback(async () => {
    if (!request) {
      // 如果没有 request 函数，使用外部传入的 dataSource
      if (externalDataSource) {
        setDataSource(externalDataSource);
      }
      return;
    }
    try {
      setLoading(true);
      const result = await request(params);
      setDataSource(result.data || []);
    } catch (error) {
      console.error("ProTable loadData error:", error);
    } finally {
      setLoading(false);
    }
  }, [request, params, externalDataSource]);

  const handleRefresh = async () => {
    if (options?.onRefresh) {
      await options.onRefresh();
    }
    await loadData();
  };

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...rest,
    settingsOptions: {
      ...tableSettingsOptions,
      onRefresh: handleRefresh,
      loading: finalLoading,
    },
    dataSource,
    loading: finalLoading,
    size: tableSize,
    columns: filteredColumns,
    refMethods: {
      refresh: handleRefresh,
    },
  };
};

export default useNormalizedProps;
