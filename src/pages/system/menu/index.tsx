import { useRef, useCallback, useMemo } from "react";
import { Tag, Space, Button, Modal, message, Form, Input, Select, Switch, InputNumber, Row, Col, Tooltip } from "antd";
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
import DMForm from "@/components/DMForm";
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

const { TextArea } = Input;

const Menu = () => {
  const { t } = useTranslation();
  const tableRef = useRef<ProTableRef>(null);

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

  // 渲染表单内容
  const renderFormItems = useCallback(
    (isEdit = false) => (
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label={t("menu.name")}
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: t("menu.rules.nameRequired") }]}
          >
            <Input placeholder={t("menu.placeholder.name")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="path"
            label={t("menu.path")}
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: t("menu.rules.pathRequired") }]}
          >
            <Input placeholder={t("menu.placeholder.path")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="component"
            label={t("menu.componentPath")}
            labelCol={{ span: 6 }}
          >
            <Input placeholder={t("menu.placeholder.componentPath")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="icon"
            label={t("menu.icon")}
            labelCol={{ span: 6 }}
          >
            <Input placeholder={t("menu.placeholder.icon")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="keepAlive"
            label={t("menu.isKeepAlive")}
            labelCol={{ span: 6 }}
            valuePropName="checked"
            {...(!isEdit && { initialValue: false })}
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sort"
            label={t("menu.orderNo")}
            labelCol={{ span: 6 }}
            {...(!isEdit && { initialValue: 0 })}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
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
            <TextArea
              placeholder={t("remarkPlaceholder")}
              rows={3}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={t("menu.authList")}
            labelCol={{ span: 3 }}
          >
            <Form.List name={["authList"]}>
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
          </Form.Item>
        </Col>
      </Row>
    ),
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
        dataIndex: "icon",
        key: "icon",
        width: 100,
        render: (icon: string) => icon || "-",
      },
      {
        title: t("menu.keepAlive"),
        dataIndex: "keepAlive",
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
        dataIndex: "authList",
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
            {record.authList?.length && (
              <Access code="create">
                <DMForm<CreateMenuParams>
                  name={`menuForm_create_child_${record.id}`}
                  type="Modal"
                  title={t("menu.createChild")}
                  width={1060}
                  trigger={
                    <Button
                      type="link"
                      size="small"
                      icon={<PlusOutlined />}
                    >
                      {t("menu.createChild")}
                    </Button>
                  }
                  initialValues={{
                    parentId: record.id,
                  }}
                  onSubmit={async (values, { success }) => {
                    try {
                      const authList = values.authList;
                      const params: CreateMenuParams = {
                        path: values.path as string,
                        name: values.name as string,
                        component: values.component as string | undefined,
                        parentId: record.id,
                        icon: values.icon as string | undefined,
                        keepAlive: values.keepAlive as boolean | undefined,
                        orderNo: (values.orderNo as number) ?? 0,
                        status: (values.status as number) ?? 1,
                        remark: values.remark as string | undefined,
                        authList: authList
                      };
                      await createMenuApi(params);
                      success();
                      // 刷新表格
                      if (tableRef.current) {
                        await tableRef.current.refresh();
                      }
                    } catch (error) {
                      console.error(t("menu.message.createError"), error);
                      throw error;
                    }
                  }}
                >
                  {renderFormItems(false)}
                </DMForm>
              </Access>
            )}
            <Access code="update">
              <DMForm<UpdateMenuParams>
                name={`menuForm_edit_${record.id}`}
                type="Modal"
                title={t("menu.edit")}
                width={1060}
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
                  path: record.path,
                  component: record.component || "",
                  icon: record?.icon || "",
                  keepAlive: record.keepAlive || false,
                  sort: record.sort || 0,
                  status: record.status || 1,
                  remark: record.remark || "",
                  authList: record.authList || [],

                }}
                onSubmit={(values, { success, error }) => {
                  updateMenuApi(record.id, values).then(() => {
                    success();
                    // 刷新表格
                    if (tableRef.current) {
                      tableRef.current.refresh();
                    }
                  }).catch(() => {
                    error(t("menu.message.updateError"));
                  });
                }}
              >
                {renderFormItems(true)}
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
    ],
    [t, handleDelete, renderFormItems]
  );

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("menu.title")}</h2>
        <Access code="create">
          <DMForm<CreateMenuParams>
            name="menuForm_create"
            type="Modal"
            title={t("menu.create")}
            width={1060}
            trigger={
              <Button
                type="primary"
                icon={<PlusOutlined />}
              >
                {t("menu.create")}
              </Button>
            }
            onSubmit={async (values, { success }) => {
              try {
                await createMenuApi(values);
                success();
                // 刷新表格
                if (tableRef.current) {
                  await tableRef.current.refresh();
                }
              } catch (error) {
                console.error(t("menu.message.createError"), error);
                throw error;
              }
            }}
          >
            {renderFormItems(false)}
          </DMForm>
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

    </>
  );
};

export default Menu;
