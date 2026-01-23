import { useMemo } from "react";
import type { ProFormProps, ProFormOptions } from "../types";

const useNormalizedProps = (props: ProFormProps) => {
  const {
    items,
    options,
    layout = "vertical",
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
        showSubmitButton !== undefined
          ? showSubmitButton
          : options?.showSubmitButton ?? defaultOptions.showSubmitButton,
      showResetButton:
        showResetButton !== undefined
          ? showResetButton
          : options?.showResetButton ?? defaultOptions.showResetButton,
    };
  }, [options, showSubmitButton, showResetButton]);

  return {
    ...rest,
    items,
    layout,
    formOptions,
  };
};

export default useNormalizedProps;
