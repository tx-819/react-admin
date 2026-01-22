import { Card, List, Checkbox, Button, Popconfirm } from "antd";
import type { ToDoItem } from "../types";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { useEffect, useState } from "react";
import SaveToDoItem from "./SaveToDoItem";
import "./index.css";
interface ToDoListProps {
  data: ToDoItem[];
  setData: (data: ToDoItem[]) => void;
  loading?: boolean;
}

const ToDoList = ({ data, setData, loading }: ToDoListProps) => {
  const [todoCount, setTodoCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [itemData, setItemData] = useState<ToDoItem>({
    task: "",
    completed: false,
  } as ToDoItem);

  // 当待办事项数据变化,更新data集合
  useEffect(() => {
    if (itemData) {
      const newData = [itemData, ...data];
      setData(newData);
    }
  }, [itemData]);
  // 计算待办事件数量
  useEffect(() => {
    const count = data.filter((item) => !item.completed).length;
    setTodoCount(count);
  }, [data]);
  // 处理勾选事件
  const handleCheck = (itemId: string) => (e: CheckboxChangeEvent) => {
    const newData = data.map((item) =>
      item.id === itemId ? { ...item, completed: e.target.checked } : item,
    );
    setData(newData);
  };

  const remove = (itemId: string) => {
    const newData = data.filter((item) => item.id !== itemId);
    setData(newData);
  };

  return (
    <>
      <Card
        title="待办事项"
        size="small"
        extra={
          <Button type="link" onClick={() => setOpen(true)}>
            新增
          </Button>
        }
      >
        <List
          header={
            <div>
              待处理&nbsp;
              <span style={{ color: "#ff1824", fontWeight: "bold" }}>
                {todoCount}
              </span>
            </div>
          }
          loading={loading}
          dataSource={data}
          renderItem={(item) => (
            <List.Item className="todoItem">
              <List.Item.Meta
                title={item.task}
                description={
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {item.time}
                  </div>
                }
              />

              <Popconfirm
                title="删除待办"
                description="确认删除待办事项?"
                onConfirm={() => remove(item.id as string)}
                okText="删除"
                cancelText="取消"
              >
                <Button type="link" className="delItem">
                  删除
                </Button>
              </Popconfirm>
              <Checkbox
                style={{ margin: "0 10px" }}
                checked={item.completed}
                onChange={handleCheck(item.id as string)}
              />
            </List.Item>
          )}
        />
      </Card>
      <SaveToDoItem
        open={open}
        setOpen={setOpen}
        setItemData={setItemData}
        itemData={itemData}
      />
    </>
  );
};

export default ToDoList;
