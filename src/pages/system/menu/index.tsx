import { useState, useRef, useEffect } from "react";
import { Tag, Space, Button, Modal, message, Form, Input } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import ProTable from "@/components/ProTable";
import type { ProTableRef } from "@/components/ProTable/types";
import ProForm from "@/components/ProForm";
import type { ProFormRef, ProFormItemConfig } from "@/components/ProForm/types";
import {
  getMenuListApi,
  createMenuApi,
  type MenuItem,
  type CreateMenuParams,
} from "@/api/menu";

const Menu = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const tableRef = useRef<ProTableRef>(null);
  const formRef = useRef<ProFormRef>(null);

  // 处理树形数据，添加 key 和完整路径
  const processMenuData = (data: MenuItem[], parentPath = ""): MenuItem[] => {
    return data.map((item) => {
      const currentPath = parentPath ? `${parentPath}/${item.path}` : item.path;
      const processedItem: MenuItem = {
        ...item,
        key: item.id,
        path: currentPath,
      };
      if (item.children && item.children.length > 0) {
        processedItem.children = processMenuData(item.children, currentPath);
      }
      return processedItem;
    });
  };

  // 表格列定义
  const columns: ColumnsType<MenuItem> = [
    {
      title: "菜单名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "路径",
      dataIndex: "path",
      key: "path",
      width: 250,
    },
    {
      title: "组件",
      dataIndex: "component",
      key: "component",
      width: 200,
      render: (component: string) => component || "-",
    },
    {
      title: "图标",
      dataIndex: ["meta", "icon"],
      key: "icon",
      width: 100,
      render: (icon: string) => icon || "-",
    },
    {
      title: "缓存",
      dataIndex: ["meta", "keepAlive"],
      key: "keepAlive",
      width: 80,
      render: (keepAlive: boolean) => (
        <Tag color={keepAlive ? "success" : "default"}>
          {keepAlive ? "是" : "否"}
        </Tag>
      ),
    },
    {
      title: "权限",
      dataIndex: ["meta", "authList"],
      key: "authList",
      width: 200,
      render: (authList: Array<{ title: string; authMark: string }>) => {
        if (!authList || authList.length === 0) return "-";
        return (
          <Space wrap>
            {authList.map((auth, index) => (
              <Tag key={index} color="blue">
                {auth.title}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_: unknown, record: MenuItem) => (
        <Space>
          {!record.component && (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                handleOpenModal(record.id);
              }}
            >
              新增子菜单
            </Button>
          )}

          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              console.log("编辑", record);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              console.log("删除", record);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const formItems = [
    {
      name: "name",
      label: "菜单名称",
      type: "input",
      required: true,
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: "请输入菜单名称",
      },
    },
    {
      name: "path",
      label: "菜单路径",
      type: "input",
      required: true,
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: "请输入菜单路径，如：dashboard",
      },
    },
    {
      name: "component",
      label: "组件路径",
      type: "input",
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: "请输入组件路径，如：views/Dashboard.vue",
      },
    },
    {
      name: "icon",
      label: "图标",
      type: "input",
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: "请输入图标名称",
      },
    },
    {
      name: "keepAlive",
      label: "是否缓存",
      type: "switch",
      initialValue: false,
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        min: 0,
      },
    },
    {
      name: "sort",
      label: "排序",
      type: "number",
      initialValue: 0,
      labelCol: { span: 6 },
      fieldProps: {
        min: 0,
      },
      span: 12,
    },
    {
      name: "status",
      label: "状态",
      type: "select",
      initialValue: 1,
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: "请选择状态",
      },
    },
    {
      name: "remark",
      label: "备注",
      type: "textarea",
      fieldProps: {
        placeholder: "请输入备注信息",
      },
      span: 24,
      labelCol: { span: 3 },
    },
    {
      name: ["meta", "authList"],
      label: "操作权限",
      type: "custom",
      span: 24,
      labelCol: { span: 3 },
      render: () => (
        <Form.List name={["meta", "authList"]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    rules={[{ required: true, message: "请输入权限标题" }]}
                  >
                    <Input placeholder="权限标题" style={{ width: 150 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "authMark"]}
                    rules={[{ required: true, message: "请输入权限标识" }]}
                  >
                    <Input placeholder="权限标识" style={{ width: 200 }} />
                  </Form.Item>
                  <Button
                    type="link"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  >
                    删除
                  </Button>
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加权限
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      ),
    },
  ];

  // 处理新增菜单
  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      const meta = values.meta as Record<string, unknown> | undefined;
      const params: CreateMenuParams = {
        path: values.path as string,
        name: values.name as string,
        component: values.component as string | undefined,
        // 如果有 defaultParentId，使用它；否则为 null（顶级菜单）
        parentId: defaultParentId ?? null,
        icon: values.icon as string | undefined,
        keepAlive: values.keepAlive as boolean | undefined,
        sort: (values.sort as number) ?? 0,
        status: (values.status as number) ?? 1,
        remark: values.remark as string | undefined,
        meta: meta?.authList
          ? {
              authList: meta.authList as Array<{
                title: string;
                authMark: string;
              }>,
            }
          : undefined,
      };
      await createMenuApi(params);
      message.success("创建成功");
      setModalOpen(false);
      setDefaultParentId(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error("创建菜单失败:", error);
    }
  };

  // 打开新增弹窗
  const handleOpenModal = async (parentId?: string | null) => {
    // 如果传入了 parentId，设置为默认父菜单
    setDefaultParentId(parentId ?? null);
    setModalOpen(true);
  };

  // 当弹窗打开且 defaultParentId 变化时，设置表单初始值
  useEffect(() => {
    if (modalOpen && formRef.current) {
      formRef.current.setFieldsValue({
        parentId: defaultParentId,
      });
    }
  }, [modalOpen, defaultParentId]);

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">菜单管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          新增菜单
        </Button>
      </div>
      <ProTable<MenuItem>
        ref={tableRef}
        columns={columns}
        request={async () => {
          const data = await getMenuListApi();
          // 处理树形数据，添加 key 和完整路径
          const processedData = processMenuData(data);
          return {
            data: processedData,
            total: processedData.length,
          };
        }}
        pagination={false}
        size="middle"
        title="菜单列表"
        options={{
          showRefresh: true,
          showSizeChanger: false,
        }}
      />

      {/* 新增菜单弹窗 */}
      <Modal
        title={defaultParentId ? "新增子菜单" : "新增菜单"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setDefaultParentId(null);
          formRef.current?.onReset();
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <ProForm
          ref={formRef}
          items={formItems as ProFormItemConfig[]}
          onSubmit={handleCreate}
        />
      </Modal>
    </>
  );
};

export default Menu;
