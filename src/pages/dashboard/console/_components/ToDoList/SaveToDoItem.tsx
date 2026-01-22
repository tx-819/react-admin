import { Form, Modal, Button, Input, TimePicker } from "antd";
import type { ToDoItem } from "../types";
import { useEffect, useState } from "react";

interface SaveToDoItemProps {
  itemData: ToDoItem;
  setOpen: (data: boolean) => void;
  setItemData: (data: ToDoItem) => void;
  loading?: boolean;
  open: boolean;
}

const SaveToDoItem = ({
  itemData,
  setItemData,
  loading,
  open,
  setOpen,
}: SaveToDoItemProps) => {
  const [form] = Form.useForm();
  const [randomNum, setRandomNum] = useState<number>(0);

  useEffect(() => {
    setRandomNum(Math.floor(Math.random() * 1000) + 1); //制造虚拟id
  }, []);

  const saveData = async () => {
    try {
      const values = await form.validateFields(); // 手动触发表单校验
      values.id = randomNum.toString;
      if (values.time) {
        const hour = parseInt(values.time.format("HH"));
        if (hour > 12) {
          values.time = `下午 ${hour}:00`;
        } else {
          values.time = `上午 ${hour}:00`;
        }
      }
      setItemData(values);
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
      <Modal
        title={itemData.id ? "编辑待办事项" : "新增待办事项"}
        footer={
          <Button type="primary" onClick={saveData}>
            保存
          </Button>
        }
        loading={loading}
        open={open}
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
          <Form.Item<ToDoItem> label="待办时间" name="time">
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
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SaveToDoItem;
