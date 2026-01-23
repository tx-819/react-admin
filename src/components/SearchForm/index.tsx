import {
  useImperativeHandle,
  forwardRef,
  useState,
  useMemo,
  useRef,
} from "react";
import { Button, Space } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import ProForm, { type ProFormRef } from "../ProForm";
import type {
  SearchFormProps,
  SearchFormRef,
  SearchFormOptions,
} from "./types";
import type { ProFormItemConfig, ProFormOptions } from "../ProForm/types";

function SearchFormInner(
  props: SearchFormProps,
  ref: React.ForwardedRef<SearchFormRef>
) {
  const {
    items,
    options,
    showSearchButton,
    showResetButton,
    collapsible,
    ...formProps
  } = props;

  const proFormRef = useRef<ProFormRef>(null);
  const [collapsed, setCollapsed] = useState(options?.defaultCollapsed ?? true);

  // 合并搜索表单选项
  const searchOptions: SearchFormOptions = useMemo(() => {
    const defaultOptions = {
      showSearchButton: true,
      searchText: "搜索",
      showResetButton: true,
      resetText: "重置",
      searchLoading: false,
      onSearch: async () => {},
      onReset: () => {},
      collapsible: false,
      defaultCollapsed: true,
      defaultShowItems: 3,
    };

    return {
      ...defaultOptions,
      ...options,
      showSearchButton:
        showSearchButton !== undefined
          ? showSearchButton
          : options?.showSearchButton ?? defaultOptions.showSearchButton,
      showResetButton:
        showResetButton !== undefined
          ? showResetButton
          : options?.showResetButton ?? defaultOptions.showResetButton,
      collapsible:
        collapsible !== undefined
          ? collapsible
          : options?.collapsible ?? defaultOptions.collapsible,
    };
  }, [options, showSearchButton, showResetButton, collapsible]);

  // 过滤掉隐藏的表单项
  const visibleItems = useMemo(
    () => items.filter((item) => !item.hidden),
    [items]
  );

  // 处理表单项，为搜索场景添加默认配置
  const processedItems = useMemo(() => {
    return items.map((item) => {
      const processedItem: ProFormItemConfig = { ...item };

      // 为搜索场景的组件添加 allowClear 默认配置
      if (
        (item.type === "select" ||
          item.type === "datePicker" ||
          item.type === "dateRangePicker" ||
          item.type === "timePicker") &&
        !item.fieldProps?.allowClear &&
        item.fieldProps?.allowClear !== false
      ) {
        processedItem.fieldProps = {
          ...item.fieldProps,
          allowClear: true,
        };
      }

      return processedItem;
    });
  }, [items]);

  // 计算需要显示的表单项
  const displayItems = useMemo(() => {
    const defaultShowItems = searchOptions.defaultShowItems ?? 3;
    if (!searchOptions.collapsible || visibleItems.length <= defaultShowItems) {
      return processedItems;
    }
    const visibleProcessedItems = processedItems.filter((item) => !item.hidden);
    return collapsed
      ? visibleProcessedItems.slice(0, defaultShowItems)
      : visibleProcessedItems;
  }, [
    searchOptions.collapsible,
    searchOptions.defaultShowItems,
    visibleItems.length,
    processedItems,
    collapsed,
  ]);

  // 是否需要显示展开/收起按钮
  const showCollapseButton =
    searchOptions.collapsible &&
    visibleItems.length > (searchOptions.defaultShowItems ?? 3);

  // 处理搜索
  const handleSearch = async () => {
    if (proFormRef.current) {
      await proFormRef.current.submit();
    }
  };

  // 处理重置
  const handleReset = () => {
    if (proFormRef.current) {
      proFormRef.current.reset();
    }
    if (searchOptions.onReset) {
      searchOptions.onReset();
    }
  };

  // 暴露给外部的方法
  useImperativeHandle(ref, () => {
    const form = proFormRef.current?.form;
    return {
      form: form!,
      search: handleSearch,
      reset: handleReset,
      getFieldsValue: () => proFormRef.current?.getFieldsValue() ?? {},
      setFieldsValue: (values: Record<string, unknown>) => {
        if (proFormRef.current) {
          proFormRef.current.setFieldsValue(values);
        }
      },
      validateFields: async () => {
        if (proFormRef.current) {
          return await proFormRef.current.validateFields();
        }
        return {};
      },
    };
  });

  // 转换为 ProForm 的 options
  const proFormOptions: ProFormOptions = useMemo(() => {
    return {
      showSubmitButton: false, // SearchForm 自己处理所有按钮
      submitText: searchOptions.searchText,
      showResetButton: false,
      resetText: searchOptions.resetText,
      submitLoading: searchOptions.searchLoading,
      onSubmit: searchOptions.onSearch,
      onReset: searchOptions.onReset,
    };
  }, [searchOptions]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "inline-block" }}>
          <ProForm
            ref={proFormRef}
            items={displayItems}
            layout="inline"
            {...formProps}
            options={proFormOptions}
          />
        </div>
        {/* 自定义按钮区域 */}
        {(searchOptions.showSearchButton ||
          searchOptions.showResetButton ||
          showCollapseButton) && (
          <div style={{ flexShrink: 0 }}>
            <Space>
              {searchOptions.showSearchButton && (
                <Button
                  type="primary"
                  loading={searchOptions.searchLoading}
                  onClick={handleSearch}
                >
                  {searchOptions.searchText}
                </Button>
              )}
              {searchOptions.showResetButton && (
                <Button onClick={handleReset}>{searchOptions.resetText}</Button>
              )}
              {showCollapseButton && (
                <Button
                  type="link"
                  onClick={() => setCollapsed(!collapsed)}
                  icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                >
                  {collapsed ? "展开" : "收起"}
                </Button>
              )}
            </Space>
          </div>
        )}
      </div>
    </div>
  );
}

const SearchForm = forwardRef(SearchFormInner) as (
  props: SearchFormProps & { ref?: React.ForwardedRef<SearchFormRef> }
) => React.ReactElement;

(SearchForm as typeof SearchForm & { displayName: string }).displayName =
  "SearchForm";

export default SearchForm;
export type {
  SearchFormProps,
  SearchFormRef,
  SearchFormOptions,
} from "./types";
