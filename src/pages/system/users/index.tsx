import { useState, useRef, useCallback, useEffect } from "react";
import { Tag, Space, Button, Modal, message, Avatar } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ProTable from "@/components/ProTable";
import type { ProTableRef, ProColumnType } from "@/components/ProTable/types";
import ProForm from "@/components/ProForm";
import type { ProFormRef, ProFormItemConfig } from "@/components/ProForm/types";
import {
  getUserListApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  getAllRolesApi,
  type UserItem,
  type CreateUserParams,
  type UpdateUserParams,
  type RoleOption,
} from "@/api/user";
import Access from "@/components/Access";

const Users = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const tableRef = useRef<ProTableRef>(null);
  const formRef = useRef<ProFormRef>(null);

  // 加载角色列表
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roleList = await getAllRolesApi();
        setRoles(roleList);
      } catch (error) {
        console.error(t("users.message.loadRolesError"), error);
      }
    };
    loadRoles();
  }, [t]);

  // 打开编辑弹窗
  const handleEdit = useCallback((record: UserItem) => {
    setEditingUser(record);
    setModalOpen(true);
  }, []);

  // 处理删除用户
  const handleDelete = useCallback(
    (record: UserItem) => {
      Modal.confirm({
        title: t("confirmDelete"),
        okText: t("okText"),
        cancelText: t("cancelText"),
        okType: "danger",
        onOk: async () => {
          try {
            await deleteUserApi(record.id);
            message.success(t("deleteSuccess"));
            // 刷新表格
            if (tableRef.current) {
              await tableRef.current.refresh();
            }
          } catch (error) {
            console.error(t("users.message.deleteError"), error);
          }
        },
      });
    },
    [t]
  );

  // 表格列定义
  const columns: ProColumnType<UserItem>[] = [
    {
      title: t("users.username"),
      dataIndex: "username",
      key: "username",
      width: 150,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: t("users.placeholder.username"),
        },
      },
    },
    {
      title: t("users.nickname"),
      dataIndex: "nickname",
      key: "nickname",
      width: 150,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: t("users.placeholder.nickname"),
        },
      },
    },
    {
      title: t("users.avatar"),
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar: string | null) => (
        <Avatar src={avatar} icon={<UserOutlined />} size="small" />
      ),
    },
    {
      title: t("users.status"),
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "default"}>
          {status === 1 ? t("enabled") : t("disabled")}
        </Tag>
      ),
      formItem: {
        type: "select",
        options: [
          { label: t("enabled"), value: 1 },
          { label: t("disabled"), value: 0 },
        ],
        fieldProps: {
          placeholder: t("users.placeholder.status"),
          allowClear: true,
        },
      },
    },
    {
      title: t("users.isSuper"),
      dataIndex: "isSuper",
      key: "isSuper",
      width: 120,
      render: (isSuper: boolean) => (
        <Tag color={isSuper ? "red" : "default"}>
          {isSuper ? t("yes") : t("no")}
        </Tag>
      ),
    },
    {
      title: t("users.roles"),
      dataIndex: "roles",
      key: "roles",
      width: 200,
      render: (roles: Array<{ name: string }>) => {
        if (!roles || roles.length === 0) return "-";
        return (
          <Space wrap>
            {roles.map((role, index) => (
              <Tag key={index} color="blue">
                {role.name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t("createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) return "-";
        return new Date(createdAt).toLocaleString();
      },
    },
    {
      title: t("action"),
      key: "action",
      width: 150,
      fixed: "right",
      render: (_: unknown, record: UserItem) => (
        <Space>
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
  ];

  // 表单配置
  const formItems: ProFormItemConfig[] = [
    {
      name: "username",
      label: t("users.username"),
      type: "input",
      required: true,
      span: 12,
      labelCol: { span: 6 },
      initialValue: editingUser?.username,
      fieldProps: {
        placeholder: t("users.placeholder.usernameWithRule"),
      },
      rules: [
        {
          min: 3,
          max: 50,
          message: t("users.rules.usernameLength"),
        },
      ],
    },
    {
      name: "password",
      label: editingUser ? t("newPassword") : t("password"),
      type: "password",
      required: !editingUser, // 编辑时密码可选
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: editingUser
          ? t("users.placeholder.passwordEdit")
          : t("users.placeholder.password"),
      },
    },
    {
      name: "nickname",
      label: t("users.nickname"),
      type: "input",
      span: 12,
      labelCol: { span: 6 },
      initialValue: editingUser?.nickname,
      fieldProps: {
        placeholder: t("users.placeholder.nickname"),
      },
    },
    {
      name: "avatar",
      label: t("users.avatarUrl"),
      type: "input",
      span: 12,
      labelCol: { span: 6 },
      initialValue: editingUser?.avatar || "",
      fieldProps: {
        placeholder: t("users.placeholder.avatarUrl"),
      },
    },
    {
      name: "status",
      label: t("users.status"),
      type: "select",
      initialValue: editingUser?.status ?? 1,
      options: [
        { label: t("enabled"), value: 1 },
        { label: t("disabled"), value: 0 },
      ],
      span: 12,
      labelCol: { span: 6 },
      fieldProps: {
        placeholder: t("users.placeholder.status"),
      },
    },
    {
      name: "isSuper",
      label: t("users.isSuper"),
      type: "switch",
      initialValue: editingUser?.isSuper ?? false,
      span: 12,
      labelCol: { span: 6 },
    },
    {
      name: "roleIds",
      label: t("users.roles"),
      type: "select",
      initialValue: editingUser?.roles?.map((r) => r.id) || [],
      options: roles.map((role) => ({
        label: role.name,
        value: role.id,
      })),
      span: 24,
      labelCol: { span: 3 },
      fieldProps: {
        mode: "multiple",
        placeholder: t("users.placeholder.roles"),
        allowClear: true,
      },
    },
  ];

  // 处理新增用户
  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      const params: CreateUserParams = {
        username: values.username as string,
        password: values.password as string,
        nickname: values.nickname as string | undefined,
        avatar: values.avatar as string | undefined,
        status: (values.status as number) ?? 1,
        isSuper: (values.isSuper as boolean) ?? false,
        roleIds: values.roleIds as string[] | undefined,
      };
      await createUserApi(params);
      message.success(t("createSuccess"));
      setModalOpen(false);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error(t("users.message.createError"), error);
    }
  };

  // 处理更新用户
  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editingUser) return;
    try {
      const params: UpdateUserParams = {
        username: values.username as string,
        nickname: values.nickname as string | undefined,
        avatar: values.avatar as string | undefined,
        status: values.status as number | undefined,
        isSuper: values.isSuper as boolean | undefined,
        roleIds: values.roleIds as string[] | undefined,
      };
      // 如果提供了新密码，才添加到参数中
      if (values.password) {
        params.password = values.password as string;
      }
      await updateUserApi(editingUser.id, params);
      message.success(t("updateSuccess"));
      setModalOpen(false);
      setEditingUser(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error(t("users.message.updateError"), error);
    }
  };

  // 打开新增弹窗
  const handleOpenModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  // 使用 useCallback 包装 request 函数，避免每次渲染都重新创建
  const handleRequest = useCallback(
    async (params?: Record<string, unknown>) => {
      // ProTable 传递的是 current，接口需要的是 page
      // 搜索参数：username 和 nickname 都映射到 keyword
      const keyword = params?.username || params?.nickname || params?.keyword;

      const requestParams: {
        page: number;
        pageSize: number;
        keyword?: string;
        status?: number;
      } = {
        page: (params?.current as number) || 1,
        pageSize: (params?.pageSize as number) || 10,
      };

      if (keyword) {
        requestParams.keyword = String(keyword);
      }
      if (params?.status !== undefined && params?.status !== null) {
        requestParams.status = Number(params.status);
      }

      const result = await getUserListApi(requestParams);

      // 返回 ProTable 期望的格式
      return {
        data: result.list,
        total: result.pagination.total,
      };
    },
    []
  );

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("users.title")}</h2>
        <Access code="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            {t("users.create")}
          </Button>
        </Access>
      </div>
      <ProTable<UserItem>
        ref={tableRef}
        columns={columns}
        request={handleRequest}
        size="middle"
        title={t("users.list")}
        options={{
          showRefresh: true,
          showSizeChanger: true,
        }}
      />

      {/* 新增/编辑用户弹窗 */}
      <Modal
        title={editingUser ? t("users.edit") : t("users.create")}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingUser(null);
          formRef.current?.onReset();
        }}
        afterOpenChange={(open) => {
          if (open && formRef.current) {
            if (editingUser) {
              // 编辑模式：填充当前用户数据
              formRef.current.setFieldsValue({
                username: editingUser.username,
                nickname: editingUser.nickname || "",
                avatar: editingUser.avatar || "",
                status: editingUser.status,
                isSuper: editingUser.isSuper,
                roleIds: editingUser.roles?.map((r) => r.id) || [],
              });
            } else {
              // 新增模式：重置表单
              formRef.current.resetFields();
            }
          }
        }}
        footer={null}
        width={960}
        destroyOnHidden
      >
        <ProForm
          ref={formRef}
          items={formItems}
          onSubmit={editingUser ? handleUpdate : handleCreate}
        />
      </Modal>
    </>
  );
};

export default Users;
