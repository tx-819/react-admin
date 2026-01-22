import { Form, Modal, Button, Input, TimePicker } from "antd";
import type { ToDoItem } from "../types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

interface SaveToDoItemProps {
  currentItem?: ToDoItem;
  onSave: (data: ToDoItem) => void;
  loading?: boolean;
  trigger?: () => React.ReactNode;
}

const SaveToDoItem = ({
  currentItem,
  onSave,
  loading,
  trigger,
}: SaveToDoItemProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const saveData = async () => {
    try {
      const values = await form.validateFields(); // 手动触发表单校验
      if (values.time) {
        const hour = parseInt(values.time.format("HH"));
        if (hour > 12) {
          values.time = `下午 ${hour}:00`;
        } else {
          values.time = `上午 ${hour}:00`;
        }
      }
      onSave(values);
      closeModal();
    } catch (error) {
      console.log("校验失败:", error);
    }
  };
  const closeModal = () => {
    setOpen(false);
    form.resetFields();
  };
  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger?.()}</div>
      <Modal
        title={currentItem?.id ? "编辑待办事项" : "新增待办事项"}
        footer={
          <Button type="primary" onClick={saveData}>
            保存
          </Button>
        }
        loading={loading}
        open={open}
        destroyOnHidden
        onCancel={closeModal}
      >
        <Form
          form={form}
          name="todoForm"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
        >
          <Form.Item<ToDoItem>
            label="待办id"
            hidden
            name="id"
            initialValue={currentItem?.id ?? uuidv4()}
          >
            <Input />
          </Form.Item>
          <Form.Item<ToDoItem>
            label="待办时间"
            name="time"
            initialValue={dayjs(currentItem?.time ?? "00:00", "HH")}
          >
            <TimePicker
              format={"HH"}
              placeholder="请选择时间"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item<ToDoItem>
            label="待办内容"
            name="task"
            rules={[{ required: true, message: "请输入待办内容" }]}
            initialValue={currentItem?.task ?? undefined}
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SaveToDoItem;
