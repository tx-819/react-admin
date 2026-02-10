import { useState, useRef, useCallback, useEffect } from "react";
import { Tag, Space, Button, Modal, message, Avatar, Form, Input, Select, Switch, Row, Col } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ProTable from "@/components/ProTable";
import type { ProTableRef, ProColumnType } from "@/components/ProTable/types";
import DMForm from "@/components/DMForm";
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
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const tableRef = useRef<ProTableRef>(null);

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
            <DMForm<UpdateUserParams>
              name="userForm_edit"
              type="Modal"
              title={t("users.edit")}
              width={960}
              trigger={
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                >
                  {t("edit")}
                </Button>
              }
              initialValues={{
                username: record.username,
                nickname: record.nickname || "",
                avatar: record.avatar || "",
                status: record.status,
                isSuper: record.isSuper,
                roleIds: record.roles?.map((r) => r.id) || [],
              }}
              onSubmit={async (values, { success }) => {
                try {
                  await updateUserApi(record.id, values);
                  success();
                  // 刷新表格
                  if (tableRef.current) {
                    await tableRef.current.refresh();
                  }
                } catch (error) {
                  console.error(t("users.message.updateError"), error);
                  throw error;
                }
              }}
            >
              {renderForm(true)}
            </DMForm>
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

  // 渲染表单内容
  const renderForm = useCallback(
    (isEdit = false) => (
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="username"
            label={t("users.username")}
            labelCol={{ span: 6 }}
            rules={[
              { required: true, message: t("users.rules.usernameRequired") },
              {
                min: 3,
                max: 50,
                message: t("users.rules.usernameLength"),
              },
            ]}
          >
            <Input placeholder={t("users.placeholder.usernameWithRule")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="password"
            label={isEdit ? t("newPassword") : t("password")}
            labelCol={{ span: 6 }}
            rules={isEdit ? undefined : [{ required: true, message: t("users.rules.passwordRequired") }]}
          >
            <Input.Password placeholder={isEdit ? t("users.placeholder.passwordEdit") : t("users.placeholder.password")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="nickname"
            label={t("users.nickname")}
            labelCol={{ span: 6 }}
          >
            <Input placeholder={t("users.placeholder.nickname")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="avatar"
            label={t("users.avatarUrl")}
            labelCol={{ span: 6 }}
          >
            <Input placeholder={t("users.placeholder.avatarUrl")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label={t("users.status")}
            labelCol={{ span: 6 }}
            {...(!isEdit && { initialValue: 1 })}
          >
            <Select
              placeholder={t("users.placeholder.status")}
              options={[
                { label: t("enabled"), value: 1 },
                { label: t("disabled"), value: 0 },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="isSuper"
            label={t("users.isSuper")}
            labelCol={{ span: 6 }}
            valuePropName="checked"
            {...(!isEdit && { initialValue: false })}
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="roleIds"
            label={t("users.roles")}
            labelCol={{ span: 3 }}
          >
            <Select
              mode="multiple"
              placeholder={t("users.placeholder.roles")}
              allowClear
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
    ),
    [t, roles]
  );

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
          <DMForm<CreateUserParams>
            name="userForm_create"
            type="Modal"
            title={t("users.create")}
            width={960}
            trigger={
              <Button
                type="primary"
                icon={<PlusOutlined />}
              >
                {t("users.create")}
              </Button>
            }
            onSubmit={async (values, { success }) => {
              try {
                await createUserApi(values);
                success();
                // 刷新表格
                if (tableRef.current) {
                  await tableRef.current.refresh();
                }

              } catch (error) {
                console.error(t("users.message.createError"), error);
                throw error;
              }
            }}
          >
            {renderForm(false)}
          </DMForm>
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

    </>
  );
};

export default Users;
