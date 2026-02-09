import { useImperativeHandle, forwardRef } from "react";
import { Form, Row, Col, theme } from "antd";
import type { SearchFormProps, SearchFormRef } from "./types";
import FormItemRenderer from "./_components/FormItemRenderer";
import ActionButtons from "./_components/ActionButtons";
import useSearchFormOptions from "./_hooks/useSearchFormOptions";
import useSearchFormItems from "./_hooks/useSearchFormItems";
import useSearchFormActions from "./_hooks/useSearchFormActions";

function SearchFormInner(
  props: SearchFormProps,
  ref: React.ForwardedRef<SearchFormRef>
) {
  const { items, options, onSearch, onReset, ...formProps } = props;

  const [form] = Form.useForm();
  const { token: { colorBgContainer } } = theme.useToken();

  const searchOptions = useSearchFormOptions(options);
  const {
    displayItems,
    showCollapseButton,
    collapsed,
    toggleCollapse,
  } = useSearchFormItems(items, searchOptions);
  const { searchLoading, handleSearch, handleReset } = useSearchFormActions({
    form,
    onSearch,
    onReset,
  });

  // 暴露给外部的方法
  useImperativeHandle(ref, () => {
    return {
      ...form,
      onSearch: handleSearch,
      onReset: handleReset,
    };
  });

  return (
    <div className="rounded-lg shadow-md p-4 mb-4" style={{ background: colorBgContainer }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "inline-block" }}>
          <Form form={form} layout="inline" {...formProps}>
            <Row gutter={[16, 16]} style={{ width: "100%" }}>
              {displayItems.map((item) => {
                return (
                  <Col
                    key={Array.isArray(item.name) ? item.name.join(".") : item.name}
                    span={item.span ?? 8}
                  >
                    <FormItemRenderer item={item} form={form} />
                  </Col>
                );
              })}
            </Row>
          </Form>
        </div>
        {/* 自定义按钮区域 */}
        <ActionButtons
          showSearchButton={searchOptions.showSearchButton}
          searchText={searchOptions.searchText}
          showResetButton={searchOptions.showResetButton}
          resetText={searchOptions.resetText}
          showCollapseButton={showCollapseButton}
          collapsed={collapsed}
          searchLoading={searchLoading}
          onSearch={handleSearch}
          onReset={handleReset}
          onToggleCollapse={toggleCollapse}
        />
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
  SearchFormItemConfig,
} from "./types";
