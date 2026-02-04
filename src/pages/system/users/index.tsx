import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Tag, Space, Button, Modal, message, Avatar } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
        console.error("加载角色列表失败:", error);
      }
    };
    loadRoles();
  }, []);

  // 表格列定义
  const columns: ProColumnType<UserItem>[] = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 150,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入用户名",
        },
      },
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      width: 150,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入昵称",
        },
      },
    },
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar: string | null) => (
        <Avatar src={avatar} icon={<UserOutlined />} size="small" />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "default"}>
          {status === 1 ? "启用" : "禁用"}
        </Tag>
      ),
      formItem: {
        type: "select",
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 },
        ],
        fieldProps: {
          placeholder: "请选择状态",
          allowClear: true,
        },
      },
    },
    {
      title: "超级管理员",
      dataIndex: "isSuper",
      key: "isSuper",
      width: 120,
      render: (isSuper: boolean) => (
        <Tag color={isSuper ? "red" : "default"}>{isSuper ? "是" : "否"}</Tag>
      ),
    },
    {
      title: "角色",
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
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) return "-";
        return new Date(createdAt).toLocaleString("zh-CN");
      },
    },
    {
      title: "操作",
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
              编辑
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
              删除
            </Button>
          </Access>
        </Space>
      ),
    },
  ];

  // 表单配置
  const formItems: ProFormItemConfig[] = useMemo(
    () => [
      {
        name: "username",
        label: "用户名",
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingUser?.username,
        fieldProps: {
          placeholder: "请输入用户名（3-50个字符）",
        },
        rules: [{ min: 3, max: 50, message: "用户名长度必须在3-50个字符之间" }],
      },
      {
        name: "password",
        label: editingUser ? "新密码" : "密码",
        type: "password",
        required: !editingUser, // 编辑时密码可选
        span: 12,
        labelCol: { span: 6 },
        fieldProps: {
          placeholder: editingUser ? "留空则不修改密码" : "请输入密码",
        },
      },
      {
        name: "nickname",
        label: "昵称",
        type: "input",
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingUser?.nickname,
        fieldProps: {
          placeholder: "请输入昵称",
        },
      },
      {
        name: "avatar",
        label: "头像URL",
        type: "input",
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingUser?.avatar || "",
        fieldProps: {
          placeholder: "请输入头像URL",
        },
      },
      {
        name: "status",
        label: "状态",
        type: "select",
        initialValue: editingUser?.status ?? 1,
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
        name: "isSuper",
        label: "超级管理员",
        type: "switch",
        initialValue: editingUser?.isSuper ?? false,
        span: 12,
        labelCol: { span: 6 },
      },
      {
        name: "roleIds",
        label: "角色",
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
          placeholder: "请选择角色",
          allowClear: true,
        },
      },
    ],
    [editingUser, roles]
  );

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
      message.success("创建成功");
      setModalOpen(false);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error("创建用户失败:", error);
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
      message.success("更新成功");
      setModalOpen(false);
      setEditingUser(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error("更新用户失败:", error);
    }
  };

  // 打开新增弹窗
  const handleOpenModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: UserItem) => {
    setEditingUser(record);
    setModalOpen(true);
  };

  // 处理删除用户
  const handleDelete = (record: UserItem) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除用户"${record.username}"吗？`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteUserApi(record.id);
          message.success("删除成功");
          // 刷新表格
          if (tableRef.current) {
            await tableRef.current.refresh();
          }
        } catch (error) {
          console.error("删除用户失败:", error);
        }
      },
    });
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
        <h2 className="text-xl font-bold">用户管理</h2>
        <Access code="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            新增用户
          </Button>
        </Access>
      </div>
      <ProTable<UserItem>
        ref={tableRef}
        columns={columns}
        request={handleRequest}
        size="middle"
        title="用户列表"
        options={{
          showRefresh: true,
          showSizeChanger: true,
        }}
      />

      {/* 新增/编辑用户弹窗 */}
      <Modal
        title={editingUser ? "编辑用户" : "新增用户"}
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
        width={700}
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
