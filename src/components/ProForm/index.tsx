import { useImperativeHandle, forwardRef, useState } from "react";
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
  const { items, formOptions, layout, onSubmit, onReset, ...formProps } =
    useNormalizedProps(props);

  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // 处理表单重置
  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    }
  };

  // 暴露给外部的方法
  useImperativeHandle(ref, () => ({
    ...form,
    onReset: handleReset,
  }));

  // 渲染表单项
  const renderFormItem = (item: ProFormItemConfig) => {
    const {
      type = "input",
      fieldProps = {},
      render,
      options = [],
      ...formItemProps
    } = item;

    // 自定义渲染
    if (render) {
      return <Form.Item {...formItemProps}>{render(form)}</Form.Item>;
    }

    // 根据类型渲染不同的输入组件
    const renderInput = () => {
      switch (type) {
        case "input":
          return <Input {...fieldProps} />;
        case "password":
          return <Input.Password {...fieldProps} />;
        case "textarea":
          return <TextArea {...fieldProps} />;
        case "number":
          return <InputNumber style={{ width: "100%" }} {...fieldProps} />;
        case "select":
          return <Select options={options} {...fieldProps} />;
        case "datePicker":
          return <DatePicker style={{ width: "100%" }} {...fieldProps} />;
        case "dateRangePicker":
          return <RangePicker style={{ width: "100%" }} {...fieldProps} />;
        case "timePicker":
          return <TimePicker style={{ width: "100%" }} {...fieldProps} />;
        case "switch":
          return <Switch {...fieldProps} />;
        case "checkbox":
          return <Checkbox.Group options={options} {...fieldProps} />;
        case "radio":
          return <Radio.Group options={options} {...fieldProps} />;
        case "upload":
          return <Upload {...fieldProps} />;
        case "custom":
          return null; // 自定义类型必须使用 render
        default:
          return <Input {...fieldProps} />;
      }
    };

    return <Form.Item {...formItemProps}>{renderInput()}</Form.Item>;
  };

  return (
    <div>
      <Form form={form} layout={layout} {...formProps}>
        <Row
          gutter={layout === "inline" ? [16, 16] : 16}
          style={{ width: "100%" }}
        >
          {items.map((item) => {
            return (
              <Col
                key={Array.isArray(item.name) ? item.name.join(".") : item.name}
                span={item.span ?? 8}
              >
                {renderFormItem(item)}
              </Col>
            );
          })}
        </Row>
        {(formOptions.showSubmitButton || formOptions.showResetButton) && (
          <Form.Item className="flex justify-end">
            <Space>
              {formOptions.showResetButton && (
                <Button onClick={handleReset}>{formOptions.resetText}</Button>
              )}
              {formOptions.showSubmitButton && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading}
                  onClick={handleSubmit}
                >
                  {formOptions.submitText}
                </Button>
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
