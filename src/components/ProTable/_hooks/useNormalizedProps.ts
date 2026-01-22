import type { ProTableProps } from "../types";
import type { TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import useTableSettings from "./useTableSettings";

const useNormalizedProps = <T = unknown>(props: ProTableProps<T>) => {
  const {
    request,
    params,
    options,
    columns,
    size,
    dataSource: externalDataSource,
    loading: externalLoading,
    pagination: externalPagination,
    ...rest
  } = props;

  const [dataSource, setDataSource] = useState<T[]>(props.dataSource || []);
  const [loading, setLoading] = useState(false);

  // 分页状态管理
  const [paginationState, setPaginationState] = useState(() => {
    if (externalPagination === false) {
      return { current: 1, pageSize: 10, total: 0 };
    }
    return {
      current:
        externalPagination?.current || externalPagination?.defaultCurrent || 1,
      pageSize:
        externalPagination?.pageSize ||
        externalPagination?.defaultPageSize ||
        10,
      total: externalPagination?.total || 0,
    };
  });

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

  // 使用 ref 存储最新的分页状态，避免依赖问题
  const paginationStateRef = useRef(paginationState);
  useEffect(() => {
    paginationStateRef.current = paginationState;
  }, [paginationState]);

  // 加载数据，自动支持分页
  const loadData = useCallback(
    async (page?: number, pageSize?: number) => {
      if (!request) {
        // 如果没有 request 函数，使用外部传入的 dataSource
        if (externalDataSource) {
          setDataSource(externalDataSource);
        }
        return;
      }

      // 使用传入的分页参数或从 ref 中获取最新状态
      const currentPage = page ?? paginationStateRef.current.current;
      const currentPageSize = pageSize ?? paginationStateRef.current.pageSize;

      try {
        setLoading(true);
        // 合并请求参数，自动添加分页参数
        const requestParams = {
          ...params,
          current: currentPage,
          pageSize: currentPageSize,
        };

        const result = await request(requestParams);

        setDataSource(result.data || []);

        // 更新分页状态，使用计算好的值而不是再次使用 ?? 操作符
        setPaginationState((prev) => ({
          current: currentPage,
          pageSize: currentPageSize,
          total: result.total !== undefined ? result.total : prev.total,
        }));
      } catch (error) {
        console.error("ProTable loadData error:", error);
      } finally {
        setLoading(false);
      }
    },
    [request, params, externalDataSource]
  );

  const handleRefresh = async () => {
    if (options?.onRefresh) {
      await options.onRefresh();
    }
    await loadData();
  };

  // 处理分页变化
  const handleTableChange = useCallback(
    (newPagination: TablePaginationConfig) => {
      const { current, pageSize } = newPagination;
      const prevState = paginationStateRef.current;
      const targetPage = current ?? prevState.current;
      const targetPageSize = pageSize ?? prevState.pageSize;
      loadData(targetPage, targetPageSize);
    },
    [loadData]
  );

  // 合并分页配置
  const pagination: false | TablePaginationConfig = useMemo(() => {
    if (externalPagination === false) {
      return false;
    }

    // 使用外部传入的分页配置或空对象
    const basePagination = externalPagination || {};

    return {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number) => `共 ${total} 条`,
      ...basePagination,
      current: paginationState.current,
      pageSize: paginationState.pageSize,
      total: paginationState.total,
      onChange: (page: number, size: number) => {
        if (basePagination.onChange) {
          basePagination.onChange(page, size);
        }
        handleTableChange({ current: page, pageSize: size });
      },
      onShowSizeChange: (current: number, size: number) => {
        if (basePagination.onShowSizeChange) {
          basePagination.onShowSizeChange(current, size);
        }
        handleTableChange({ current, pageSize: size });
      },
    };
  }, [externalPagination, paginationState, handleTableChange]);

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
    pagination,
    onChange: handleTableChange,
    refMethods: {
      refresh: handleRefresh,
    },
  };
};

export default useNormalizedProps;
