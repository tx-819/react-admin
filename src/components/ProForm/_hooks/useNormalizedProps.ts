import { useMemo } from "react";
import type { ProFormProps, ProFormOptions } from "../types";

const useNormalizedProps = (props: ProFormProps) => {
  const {
    items,
    options,
    layout = "vertical",
    labelCol,
    wrapperCol,
    showSubmitButton,
    showResetButton,
    ...rest
  } = props;

  // 合并选项配置
  const formOptions: Required<ProFormOptions> = useMemo(() => {
    const defaultOptions: Required<ProFormOptions> = {
      showSubmitButton: true,
      submitText: "提交",
      showResetButton: false,
      resetText: "重置",
      submitLoading: false,
      onSubmit: async () => {},
      onReset: () => {},
    };

    return {
      ...defaultOptions,
      ...options,
      // 如果 props 中直接传入了 showSubmitButton 或 showResetButton，优先使用
      showSubmitButton:
        showSubmitButton !== undefined ? showSubmitButton : options?.showSubmitButton ?? defaultOptions.showSubmitButton,
      showResetButton:
        showResetButton !== undefined ? showResetButton : options?.showResetButton ?? defaultOptions.showResetButton,
    };
  }, [options, showSubmitButton, showResetButton]);

  // 默认布局配置
  const defaultLabelCol = useMemo(() => {
    if (labelCol) return labelCol;
    if (layout === "horizontal") {
      return { span: 6 };
    }
    return undefined;
  }, [layout, labelCol]);

  const defaultWrapperCol = useMemo(() => {
    if (wrapperCol) return wrapperCol;
    if (layout === "horizontal") {
      return { span: 18 };
    }
    return undefined;
  }, [layout, wrapperCol]);

  return {
    ...rest,
    items,
    layout,
    labelCol: defaultLabelCol,
    wrapperCol: defaultWrapperCol,
    formOptions,
  };
};

export default useNormalizedProps;

