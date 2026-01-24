import { useMemo } from "react";
import type { ProFormProps, ProFormOptions } from "../types";

const useNormalizedProps = (props: ProFormProps) => {
  const { items, options, ...rest } = props;

  // 合并选项配置
  const formOptions: Required<ProFormOptions> = useMemo(() => {
    const defaultOptions: Required<ProFormOptions> = {
      showSubmitButton: true,
      submitText: "提交",
      showResetButton: true,
      resetText: "重置",
    };

    return {
      ...defaultOptions,
      ...options,
    };
  }, [options]);

  return {
    ...rest,
    items,
    formOptions,
  };
};

export default useNormalizedProps;
