import { useImperativeHandle, forwardRef, useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Checkbox,
  Radio,
  Upload,
  Button,
  Space,
  Row,
  Col,
} from "antd";
import useNormalizedProps from "./_hooks/useNormalizedProps";
import type { ProFormProps, ProFormRef, ProFormItemConfig } from "./types";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function ProFormInner(
  props: ProFormProps,
  ref: React.ForwardedRef<ProFormRef>
) {
  const { items, layout, formOptions, ...formProps } =
    useNormalizedProps(props);

  const [form] = Form.useForm();

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (formOptions.onSubmit) {
        await formOptions.onSubmit(values);
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理表单重置
  const handleReset = () => {
    form.resetFields();
    if (formOptions.onReset) {
      formOptions.onReset();
    }
  };

  // 暴露给外部的方法
  useImperativeHandle(ref, () => ({
    form,
    submit: handleSubmit,
    reset: handleReset,
    getFieldsValue: () => form.getFieldsValue(),
    setFieldsValue: (values: Record<string, unknown>) =>
      form.setFieldsValue(values),
    validateFields: async () => {
      return await form.validateFields();
    },
  }));

  // 渲染表单项
  const renderFormItem = (item: ProFormItemConfig) => {
    const {
      name,
      label,
      type = "input",
      rules = [],
      placeholder,
      initialValue,
      required,
      hidden,
      disabled,
      itemProps = {},
      fieldProps = {},
      render,
      options = [],
      dependencies,
      shouldUpdate,
    } = item;

    // 如果设置了 required，自动添加必填规则
    const finalRules = (() => {
      if (
        required &&
        !rules.some((rule) => "required" in rule && rule.required)
      ) {
        return [
          {
            required: true,
            message: `请输入${
              label || (Array.isArray(name) ? name.join(".") : name)
            }`,
          },
          ...rules,
        ];
      }
      return rules;
    })();

    // 自定义渲染
    if (render) {
      return (
        <Form.Item
          key={Array.isArray(name) ? name.join(".") : name}
          name={name}
          label={label}
          rules={finalRules}
          initialValue={initialValue}
          hidden={hidden}
          dependencies={dependencies}
          shouldUpdate={shouldUpdate}
          {...itemProps}
        >
          {render(form)}
        </Form.Item>
      );
    }

    // 根据类型渲染不同的输入组件
    const renderInput = () => {
      switch (type) {
        case "input":
          return (
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...fieldProps}
            />
          );
        case "password":
          return (
            <Input.Password
              placeholder={placeholder}
              disabled={disabled}
              {...fieldProps}
            />
          );
        case "textarea":
          return (
            <TextArea
              placeholder={placeholder}
              disabled={disabled}
              {...fieldProps}
            />
          );
        case "number":
          return (
            <InputNumber
              placeholder={placeholder}
              disabled={disabled}
              style={{ width: "100%" }}
              {...fieldProps}
            />
          );
        case "select":
          return (
            <Select
              placeholder={placeholder}
              disabled={disabled}
              options={options}
              {...fieldProps}
            />
          );
        case "datePicker":
          return (
            <DatePicker
              placeholder={placeholder}
              disabled={disabled}
              style={{ width: "100%" }}
              {...fieldProps}
            />
          );
        case "dateRangePicker":
          return (
            <RangePicker
              placeholder={[
                placeholder || "开始日期",
                placeholder || "结束日期",
              ]}
              disabled={disabled}
              style={{ width: "100%" }}
              {...fieldProps}
            />
          );
        case "timePicker":
          return (
            <TimePicker
              placeholder={placeholder}
              disabled={disabled}
              style={{ width: "100%" }}
              {...fieldProps}
            />
          );
        case "switch":
          return <Switch disabled={disabled} {...fieldProps} />;
        case "checkbox":
          return (
            <Checkbox.Group
              disabled={disabled}
              options={options}
              {...fieldProps}
            />
          );
        case "radio":
          return (
            <Radio.Group
              disabled={disabled}
              options={options}
              {...fieldProps}
            />
          );
        case "upload":
          return <Upload disabled={disabled} {...fieldProps} />;
        case "custom":
          return null; // 自定义类型必须使用 render
        default:
          return (
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...fieldProps}
            />
          );
      }
    };

    return (
      <Form.Item
        key={Array.isArray(name) ? name.join(".") : name}
        name={name}
        label={label}
        rules={finalRules}
        initialValue={initialValue}
        hidden={hidden}
        dependencies={dependencies}
        shouldUpdate={shouldUpdate}
        {...itemProps}
      >
        {renderInput()}
      </Form.Item>
    );
  };

  // 处理表单完成事件
  const handleFinish = async (values: Record<string, unknown>) => {
    if (formOptions.onSubmit) {
      await formOptions.onSubmit(values);
    }
  };

  // 当 layout 为 inline 时，使用 Row 和 Col 栅格布局
  const useGridLayout = layout === "inline";

  // 计算默认的 span（当 layout 为 inline 且表单项未设置 span 时）
  const defaultSpan = useMemo(() => {
    if (!useGridLayout) return undefined;
    // 默认一行3个表单项（每个占8列）
    return 8;
  }, [useGridLayout]);

  return (
    <div>
      <Form form={form} layout={layout} onFinish={handleFinish} {...formProps}>
        {useGridLayout ? (
          <Row gutter={[16, 16]} style={{ width: "100%" }}>
            {items.map((item) => {
              // 否则使用默认响应式配置
              return (
                <Col
                  key={
                    Array.isArray(item.name) ? item.name.join(".") : item.name
                  }
                  span={defaultSpan}
                >
                  {renderFormItem(item)}
                </Col>
              );
            })}
          </Row>
        ) : (
          <>{items.map((item) => renderFormItem(item))}</>
        )}
        {(formOptions.showSubmitButton || formOptions.showResetButton) && (
          <Form.Item>
            <Space>
              {formOptions.showSubmitButton && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={formOptions.submitLoading}
                  onClick={handleSubmit}
                >
                  {formOptions.submitText}
                </Button>
              )}
              {formOptions.showResetButton && (
                <Button onClick={handleReset}>{formOptions.resetText}</Button>
              )}
            </Space>
          </Form.Item>
        )}
      </Form>
    </div>
  );
}

const ProForm = forwardRef(ProFormInner) as (
  props: ProFormProps & { ref?: React.ForwardedRef<ProFormRef> }
) => React.ReactElement;

(ProForm as typeof ProForm & { displayName: string }).displayName = "ProForm";

export default ProForm;
export type {
  ProFormProps,
  ProFormRef,
  ProFormItemConfig,
  ProFormOptions,
} from "./types";
