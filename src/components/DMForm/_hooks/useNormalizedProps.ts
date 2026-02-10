import { Form, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';
import type { DMFormProps } from '../types';

interface ValidateErrorEntity {
  errorFields?: Array<{ name: string[] }>;
  outOfDate?: boolean;
  values?: Record<string, unknown>;
}

interface ExtendedFormInstance extends FormInstance {
  currentInitialValues?: Record<string, unknown>;
  setInitialValues?: (newInitialValues: Record<string, unknown>) => void;
  resetInitialValues?: () => void;
}

interface UseNormalizedPropsInput extends Omit<DMFormProps, 'submitAsync' | 'reset' | 'onReset'> {
  onSubmit?: (
    values: Record<string, unknown>,
    helpers: {
      success: (content?: string | null, options?: { initialValues?: Record<string, unknown> }) => void;
      error: (content?: string | null) => void;
      form: FormInstance;
    },
    submitParams?: Record<string, unknown>
  ) => void;
  onOk?: (
    values: Record<string, unknown>,
    helpers: {
      success: (content?: string | null, options?: { initialValues?: Record<string, unknown> }) => void;
      error: (content?: string | null) => void;
      form: FormInstance;
    },
    submitParams?: Record<string, unknown>
  ) => void;
  onFailed?: (errorInfo: ValidateErrorEntity) => void;
  onReset?: () => void;
  scrollToFieldOptions?: {
    block?: 'start' | 'center' | 'end';
    behavior?: 'auto' | 'smooth';
  };
}

export default (props: UseNormalizedPropsInput) => {
  const { t } = useTranslation();
  const {
    form: outerForm,
    onSubmit,
    onOk,
    onFailed,
    onReset,
    scrollToFieldOptions,
    ...rest
  } = props;

  const [innerForm] = Form.useForm();
  const form = (outerForm || innerForm) as ExtendedFormInstance;

  const setInitialValues = (newInitialValues: Record<string, unknown>) => {
    if (newInitialValues) {
      const fields = Object.entries(newInitialValues).map(([k, v]) => ({
        name: k,
        value: v,
        touched: false,
      }));

      form.setFields(fields);

      form.currentInitialValues = newInitialValues;
    }
  };

  const resetInitialValues = () => {
    const currentInitialValues = form.currentInitialValues || {};

    const keys = Object.keys(form.getFieldsValue(true) || {});
    if (keys.length) {
      const fields = keys.map((item) => ({
        name: item,
        value: currentInitialValues[item] != null ? currentInitialValues[item] : undefined,
        touched: false,
      }));

      form.setFields(fields);
    }
  };

  form.setInitialValues = setInitialValues;
  form.resetInitialValues = resetInitialValues;

  return {
    labelWrap: true,
    form,
    submitAsync: (submitParams = {}) => {
      return new Promise((resolve, reject) => {
        form
          .validateFields()
          .then((newRecord: Record<string, unknown>) => {
            form.submit(); // 兼容 onFinish

            const push =
              onSubmit ||
              onOk ||
              ((newValue: Record<string, unknown>, { success }: { success: (content?: string | null, options?: { initialValues?: Record<string, unknown> }) => void }) => {
                console.log('Submit:', newValue);
                success();
              });

            push(
              newRecord,
              {
                success: (content?: string | null, options?: { initialValues?: Record<string, unknown> }) => {
                  if (content !== null) {
                    message.success({
                      key: 'KEY_FORM',
                      content: content || t('operationSuccess'),
                      duration: 3,
                    });
                  }

                  setInitialValues(options?.initialValues || newRecord); // 复位 form.isFieldsTouched()

                  resolve(undefined);
                },
                error: (content?: string | null) => {
                  if (content !== null) {
                    message.error({
                      key: 'KEY_FORM',
                      content: content || t('error.operationFailed'),
                      duration: 5,
                    });
                  }

                  reject();
                },
                form,
              },
              submitParams,
            );
          })
          .catch((rejectedReason: ValidateErrorEntity) => {
            if (onFailed) {
              onFailed(rejectedReason);
            }
            if (rejectedReason.errorFields) {
              form.scrollToField(rejectedReason.errorFields[0]?.name, {
                block: 'center',
                ...scrollToFieldOptions,
              });
            } else {
              console.log(rejectedReason);
            }
          });
      });
    },

    reset: (newInitialValues?: Record<string, unknown>) => {
      if (newInitialValues) {
        setInitialValues(newInitialValues);
      } else {
        resetInitialValues();
      }

      if (onReset) {
        onReset();
      }
    },
    ...rest,
  };
};
