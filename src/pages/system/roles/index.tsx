import { useRef, useCallback, useMemo } from "react";
import { Tag, Space, Button, Modal, message, Form, Input, Select, Row, Col } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ProTable from "@/components/ProTable";
import type { ProTableRef, ProColumnType } from "@/components/ProTable/types";
import DMForm from "@/components/DMForm";
import {
  getRoleListApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  type RoleItem,
  type CreateRoleParams,
  type UpdateRoleParams,
} from "@/api/role";
import Access from "@/components/Access";
import PermissionConfig from "./_components/PermissionConfig";

const Roles = () => {
  const { t } = useTranslation();
  const tableRef = useRef<ProTableRef>(null);

  // 处理删除角色
  const handleDelete = useCallback(
    (record: RoleItem) => {
      Modal.confirm({
        title: t("confirmDelete"),
        okText: t("okText"),
        cancelText: t("cancelText"),
        okType: "danger",
        onOk: async () => {
          try {
            await deleteRoleApi(record.id);
            message.success(t("deleteSuccess"));
            // 刷新表格
            if (tableRef.current) {
              await tableRef.current.refresh();
            }
          } catch (error) {
            console.error(t("roles.message.deleteError"), error);
          }
        },
      });
    },
    [t]
  );

  // 渲染表单内容
  const renderFormItems = useCallback(
    (isEdit = false) => (
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={t("roles.name")}
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: t("roles.rules.nameRequired") }]}
          >
            <Input placeholder={t("roles.placeholder.name")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="code"
            label={t("roles.code")}
            labelCol={{ span: 6 }}
            rules={[
              { required: true, message: t("roles.rules.codeRequired") },
              {
                pattern: /^[a-z0-9_]+$/,
                message: t("roles.rules.codePattern"),
              },
            ]}
          >
            <Input placeholder={t("roles.placeholder.code")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label={t("status")}
            labelCol={{ span: 6 }}
            {...(!isEdit && { initialValue: 1 })}
          >
            <Select
              placeholder={t("statusPlaceholder")}
              options={[
                { label: t("enabled"), value: 1 },
                { label: t("disabled"), value: 0 },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="remark"
            label={t("remark")}
            labelCol={{ span: 3 }}
          >
            <Input.TextArea
              placeholder={t("remarkPlaceholder")}
              rows={4}
            />
          </Form.Item>
        </Col>
      </Row>
    ),
    [t]
  );

  // 表格列定义
  const columns: ProColumnType<RoleItem>[] = useMemo(
    () => [
      {
        title: t("roles.name"),
        dataIndex: "name",
        key: "name",
        width: 200,
        formItem: {
          type: "input",
          fieldProps: {
            placeholder: t("roles.placeholder.name"),
          },
        },
      },
      {
        title: t("roles.code"),
        dataIndex: "code",
        key: "code",
        width: 200,
        formItem: {
          type: "input",
          fieldProps: {
            placeholder: t("roles.placeholder.code"),
          },
        },
      },
      {
        title: t("status"),
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: boolean) => (
          <Tag color={status ? "success" : "default"}>
            {status ? t("enabled") : t("disabled")}
          </Tag>
        ),
        formItem: {
          type: "select",
          options: [
            { label: t("enabled"), value: 1 },
            { label: t("disabled"), value: 0 },
          ],
          fieldProps: {
            placeholder: t("statusPlaceholder"),
            allowClear: true,
          },
        },
      },
      {
        title: t("remark"),
        dataIndex: "remark",
        key: "remark",
        width: 300,
        render: (remark: string) => remark || "-",
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
        render: (_: unknown, record: RoleItem) => (
          <Space>
            <Access code="update">
              <DMForm<UpdateRoleParams>
                name={`roleForm_edit_${record.id}`}
                type="Modal"
                title={t("roles.edit")}
                width={860}
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
                  name: record.name,
                  code: record.code,
                  status: record.status || 1,
                  remark: record.remark || "",
                }}
                onSubmit={(values, { success, error }) => {
                  updateRoleApi(record.id, values).then(() => {
                    success();
                    // 刷新表格
                    if (tableRef.current) {
                      tableRef.current.refresh();
                    }
                  }).catch(() => {
                    error(t("roles.message.updateError"));
                  });
                }}
              >
                {renderFormItems(true)}
              </DMForm>
            </Access>
            <PermissionConfig
              role={record}
              trigger={
                <Button
                  type="link"
                  size="small"
                  icon={<SafetyOutlined />}
                >
                  {t("permissions")}
                </Button>
              }
            />
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
    [t, handleDelete, renderFormItems]
  );


  // 使用 useCallback 包装 request 函数，避免每次渲染都重新创建
  const handleRequest = useCallback(
    async (params?: Record<string, unknown>) => {
      const requestParams: {
        page: number;
        pageSize: number;
        name?: string;
        code?: string;
        status?: number;
      } = {
        page: (params?.current as number) || 1,
        pageSize: (params?.pageSize as number) || 10,
      };

      if (params?.name) {
        requestParams.name = String(params?.name);
      }
      if (params?.code) {
        requestParams.code = String(params?.code);
      }
      if (params?.status !== undefined && params?.status !== null) {
        requestParams.status = Number(params.status);
      }

      const result = await getRoleListApi(requestParams);

      // 返回 ProTable 期望的格式
      return {
        data: result.data,
        total: result.total,
      };
    },
    []
  );

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("roles.title")}</h2>
        <Access code="create">
          <DMForm<CreateRoleParams>
            name="roleForm_create"
            type="Modal"
            title={t("roles.create")}
            width={860}
            trigger={
              <Button
                type="primary"
                icon={<PlusOutlined />}
              >
                {t("roles.create")}
              </Button>
            }
            onSubmit={(values, { success, error }) => {
              createRoleApi(values).then(() => {
                success();
                // 刷新表格
                if (tableRef.current) {
                  tableRef.current.refresh();
                }
              }).catch(() => {
                error(t("roles.message.createError"));
              });
            }}
          >
            {renderFormItems(false)}
          </DMForm>
        </Access>
      </div>
      <ProTable<RoleItem>
        ref={tableRef}
        columns={columns}
        request={handleRequest}
        size="middle"
        title={t("roles.list")}
        options={{
          showRefresh: true,
          showSizeChanger: true,
        }}
      />

    </>
  );
};

export default Roles;
