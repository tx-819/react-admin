import { useState, useRef, useCallback, useMemo } from "react";
import { Tag, Space, Button, Modal, message, Form, Input, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import ProTable from "@/components/ProTable";
import type { ProTableRef } from "@/components/ProTable/types";
import ProForm from "@/components/ProForm";
import type { ProFormRef, ProFormItemConfig } from "@/components/ProForm/types";
import {
  getMenuListApi,
  createMenuApi,
  updateMenuApi,
  deleteMenuApi,
  type MenuItem,
  type CreateMenuParams,
  type UpdateMenuParams,
} from "@/api/menu";
import Access from "@/components/Access";

const Menu = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const tableRef = useRef<ProTableRef>(null);
  const formRef = useRef<ProFormRef>(null);

  // 打开新增弹窗
  const handleOpenModal = useCallback((parentId?: string | null) => {
    // 如果传入了 parentId，设置为默认父菜单
    setDefaultParentId(parentId ?? null);
    setEditingMenu(null);
    setModalOpen(true);
  }, []);

  // 打开编辑弹窗
  const handleEdit = useCallback((record: MenuItem) => {
    setEditingMenu(record);
    setDefaultParentId(null);
    setModalOpen(true);
  }, []);

  // 处理删除菜单
  const handleDelete = useCallback(
    (record: MenuItem) => {
      Modal.confirm({
        title: t("confirmDelete"),
        okText: t("okText"),
        cancelText: t("cancelText"),
        okType: "danger",
        onOk: async () => {
          try {
            await deleteMenuApi(record.id);
            message.success(t("deleteSuccess"));
            // 刷新表格
            if (tableRef.current) {
              await tableRef.current.refresh();
            }
          } catch (error) {
            console.error(t("menu.message.deleteError"), error);
          }
        },
      });
    },
    [t]
  );

  // 表格列定义
  const columns: ColumnsType<MenuItem> = useMemo(
    () => [
      {
        title: t("menu.name"),
        dataIndex: "name",
        key: "name",
        width: 200,
      },
      {
        title: t("menu.path"),
        dataIndex: "path",
        key: "path",
        width: 250,
      },
      {
        title: t("menu.component"),
        dataIndex: "component",
        key: "component",
        width: 200,
        render: (component: string) => component || "-",
      },
      {
        title: t("menu.icon"),
        dataIndex: ["meta", "icon"],
        key: "icon",
        width: 100,
        render: (icon: string) => icon || "-",
      },
      {
        title: t("menu.keepAlive"),
        dataIndex: ["meta", "keepAlive"],
        key: "keepAlive",
        width: 80,
        render: (keepAlive: boolean) => (
          <Tag color={keepAlive ? "success" : "default"}>
            {keepAlive ? t("yes") : t("no")}
          </Tag>
        ),
      },
      {
        title: t("permissions"),
        dataIndex: ["meta", "authList"],
        key: "authList",
        width: 200,
        render: (authList: Array<{ title: string; authMark: string }>) => {
          if (!authList || authList.length === 0) return "-";
          const authCount = authList.length;
          const authTitles = authList.map((auth) => auth.title).join("、");
          return (
            <Tooltip title={authTitles}>
              <Tag color="blue" style={{ cursor: "pointer" }}>
                {authCount}
                {t("menu.permissionsCount")}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: t("action"),
        key: "action",
        width: 150,
        fixed: "right",
        render: (_: unknown, record: MenuItem) => (
          <Space>
            {!record.component && (
              <Access code="create">
                <Button
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    handleOpenModal(record.id);
                  }}
                >
                  {t("menu.createChild")}
                </Button>
              </Access>
            )}
            <Access code="update">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  handleEdit(record);
                }}
              >
                {t("edit")}
              </Button>
            </Access>
            <Access code="delete">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  handleDelete(record);
                }}
              >
                {t("delete")}
              </Button>
            </Access>
          </Space>
        ),
      },
    ],
    [t, handleOpenModal, handleEdit, handleDelete]
  );

  const formItems: ProFormItemConfig[] = useMemo(
    () => [
      {
        name: "name",
        label: t("menu.name"),
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingMenu?.name,
        fieldProps: {
          placeholder: t("menu.placeholder.name"),
        },
      },
      {
        name: "path",
        label: t("menu.path"),
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingMenu?.path,
        fieldProps: {
          placeholder: t("menu.placeholder.path"),
        },
      },
      {
        name: "component",
        label: t("menu.componentPath"),
        type: "input",
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingMenu?.component,
        fieldProps: {
          placeholder: t("menu.placeholder.componentPath"),
        },
      },
      {
        name: "icon",
        label: t("menu.icon"),
        type: "input",
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingMenu?.meta?.icon,
        fieldProps: {
          placeholder: t("menu.placeholder.icon"),
        },
      },
      {
        name: "keepAlive",
        label: t("menu.isKeepAlive"),
        type: "switch",
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingMenu?.keepAlive,
        fieldProps: {
          min: 0,
        },
      },
      {
        name: "sort",
        label: t("menu.sort"),
        type: "number",
        labelCol: { span: 6 },
        initialValue: editingMenu?.sort || 0,
        fieldProps: {
          min: 0,
        },
        span: 12,
      },
      {
        name: "status",
        label: t("status"),
        type: "select",
        initialValue: editingMenu?.status || 1,
        options: [
          { label: t("enabled"), value: 1 },
          { label: t("disabled"), value: 0 },
        ],
        span: 12,
        labelCol: { span: 6 },
        fieldProps: {
          placeholder: t("statusPlaceholder"),
        },
      },
      {
        name: "remark",
        label: t("remark"),
        type: "textarea",
        initialValue: editingMenu?.remark || "",
        fieldProps: {
          placeholder: t("remarkPlaceholder"),
        },
        span: 24,
        labelCol: { span: 3 },
      },
      {
        name: ["meta", "authList"],
        label: t("menu.authList"),
        type: "custom",
        span: 24,
        labelCol: { span: 3 },
        render: () => (
          <Form.List
            name={["meta", "authList"]}
            initialValue={editingMenu?.meta?.authList || []}
          >
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
                      rules={[
                        {
                          required: true,
                          message: t("menu.rules.authTitleRequired"),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t("menu.placeholder.authTitle")}
                        style={{ width: 150 }}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "authMark"]}
                      rules={[
                        {
                          required: true,
                          message: t("menu.rules.authMarkRequired"),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t("menu.placeholder.authMark")}
                        style={{ width: 200 }}
                      />
                    </Form.Item>
                    <Button
                      type="link"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    >
                      {t("delete")}
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
                    {t("menu.addAuth")}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        ),
      },
    ],
    [editingMenu, t]
  );

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
      message.success(t("createSuccess"));
      setModalOpen(false);
      setDefaultParentId(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error(t("menu.message.createError"), error);
    }
  };

  // 处理更新菜单
  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editingMenu) return;
    try {
      const meta = values.meta as Record<string, unknown> | undefined;
      const params: UpdateMenuParams = {
        path: values.path as string,
        name: values.name as string,
        component: values.component as string | undefined,
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
      await updateMenuApi(editingMenu.id, params);
      message.success(t("updateSuccess"));
      setModalOpen(false);
      setEditingMenu(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error(t("menu.message.updateError"), error);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("menu.title")}</h2>
        <Access code="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            {t("menu.create")}
          </Button>
        </Access>
      </div>
      <ProTable<MenuItem>
        ref={tableRef}
        columns={columns}
        request={async () => {
          const data = await getMenuListApi();
          // 处理树形数据，添加 key 和完整路径
          return {
            data,
            total: data.length,
          };
        }}
        pagination={false}
        size="middle"
        title={t("menu.list")}
        options={{
          showRefresh: true,
          showSizeChanger: false,
        }}
      />

      {/* 新增/编辑菜单弹窗 */}
      <Modal
        title={
          editingMenu
            ? t("menu.edit")
            : defaultParentId
            ? t("menu.createChild")
            : t("menu.create")
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setDefaultParentId(null);
          setEditingMenu(null);
          formRef.current?.onReset();
        }}
        footer={null}
        width={1060}
        destroyOnHidden
      >
        <ProForm
          ref={formRef}
          items={formItems}
          onSubmit={editingMenu ? handleUpdate : handleCreate}
        />
      </Modal>
    </>
  );
};

export default Menu;
