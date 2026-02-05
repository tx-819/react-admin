import { useState, useRef, useCallback, useMemo } from "react";
import { Tag, Space, Button, Modal, message, Tree, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
import { useTranslation } from "react-i18next";
import ProTable from "@/components/ProTable";
import type { ProTableRef, ProColumnType } from "@/components/ProTable/types";
import ProForm from "@/components/ProForm";
import type { ProFormRef, ProFormItemConfig } from "@/components/ProForm/types";
import {
  getRoleListApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  getPermissionsApi,
  getRolePermissionsApi,
  updateRolePermissionsApi,
  type RoleItem,
  type CreateRoleParams,
  type UpdateRoleParams,
  type PermissionItem,
} from "@/api/role";
import Access from "@/components/Access";

const Roles = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [permissionRole, setPermissionRole] = useState<RoleItem | null>(null);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    []
  );
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const tableRef = useRef<ProTableRef>(null);
  const formRef = useRef<ProFormRef>(null);

  // 打开编辑弹窗
  const handleEdit = useCallback((record: RoleItem) => {
    setEditingRole(record);
    setModalOpen(true);
  }, []);

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

  // 打开权限配置弹窗
  const handleOpenPermissionModal = useCallback(
    async (record: RoleItem) => {
      setPermissionRole(record);
      setPermissionModalOpen(true);
      setLoadingPermissions(true);
      setSelectedPermissionIds([]);

      try {
        // 并行加载所有权限和角色已有权限
        const [allPermissions, rolePermissions] = await Promise.all([
          getPermissionsApi(),
          getRolePermissionsApi(record.id),
        ]);

        setPermissions(allPermissions);
        // 提取角色已有权限的 ID
        const rolePermissionIds = rolePermissions.permissions.map((p) => p.id);
        setSelectedPermissionIds(rolePermissionIds);
      } catch (error) {
        console.error(t("roles.message.loadPermissionsError"), error);
        message.error(t("roles.message.loadPermissionsError"));
      } finally {
        setLoadingPermissions(false);
      }
    },
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
            <Button
              type="link"
              size="small"
              icon={<SafetyOutlined />}
              onClick={() => {
                handleOpenPermissionModal(record);
              }}
            >
              {t("permissions")}
            </Button>
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
    [t, handleEdit, handleDelete, handleOpenPermissionModal]
  );

  // 表单配置
  const formItems: ProFormItemConfig[] = useMemo(
    () => [
      {
        name: "name",
        label: t("roles.name"),
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingRole?.name,
        fieldProps: {
          placeholder: t("roles.placeholder.name"),
        },
      },
      {
        name: "code",
        label: t("roles.code"),
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingRole?.code,
        fieldProps: {
          placeholder: t("roles.placeholder.code"),
        },
        rules: [
          {
            pattern: /^[a-z0-9_]+$/,
            message: t("roles.rules.codePattern"),
          },
        ],
      },
      {
        name: "status",
        label: t("status"),
        type: "select",
        initialValue: editingRole?.status ?? 1,
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
        initialValue: editingRole?.remark || "",
        fieldProps: {
          placeholder: t("remarkPlaceholder"),
          rows: 4,
        },
        span: 24,
        labelCol: { span: 3 },
      },
    ],
    [editingRole, t]
  );

  // 处理新增角色
  const handleCreate = async (values: Record<string, unknown>) => {
    try {
      const params: CreateRoleParams = {
        name: values.name as string,
        code: values.code as string,
        remark: values.remark as string | undefined,
        status: (values.status as number) ?? 1,
      };
      await createRoleApi(params);
      message.success(t("createSuccess"));
      setModalOpen(false);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error(t("roles.message.createError"), error);
    }
  };

  // 处理更新角色
  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editingRole) return;
    try {
      const params: UpdateRoleParams = {
        name: values.name as string,
        code: values.code as string,
        remark: values.remark as string | undefined,
        status: values.status as number | undefined,
      };
      await updateRoleApi(editingRole.id, params);
      message.success(t("updateSuccess"));
      setModalOpen(false);
      setEditingRole(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error(t("roles.message.updateError"), error);
    }
  };

  // 打开新增弹窗
  const handleOpenModal = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  // 构建权限ID到父权限ID的映射关系
  const buildParentMap = (
    permissions: PermissionItem[],
    parentId?: number
  ): Map<number, number | undefined> => {
    const map = new Map<number, number | undefined>();
    permissions.forEach((permission) => {
      map.set(permission.id, parentId);
      if (permission.children) {
        const childMap = buildParentMap(permission.children, permission.id);
        childMap.forEach((value, key) => map.set(key, value));
      }
    });
    return map;
  };

  // 获取所有父权限ID（递归向上查找）
  const getAllParentIds = (
    permissionId: number,
    parentMap: Map<number, number | undefined>
  ): number[] => {
    const parentIds: number[] = [];
    let currentParentId = parentMap.get(permissionId);
    while (currentParentId !== undefined) {
      parentIds.push(currentParentId);
      currentParentId = parentMap.get(currentParentId);
    }
    return parentIds;
  };

  // 获取所有子权限ID（递归向下查找）
  const getAllChildIds = (
    permissionId: number,
    permissions: PermissionItem[]
  ): number[] => {
    const childIds: number[] = [];

    const findPermission = (
      items: PermissionItem[],
      targetId: number
    ): PermissionItem | null => {
      for (const item of items) {
        if (item.id === targetId) {
          return item;
        }
        if (item.children) {
          const found = findPermission(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const permission = findPermission(permissions, permissionId);
    if (permission && permission.children) {
      const traverse = (items: PermissionItem[]) => {
        items.forEach((item) => {
          childIds.push(item.id);
          if (item.children) {
            traverse(item.children);
          }
        });
      };
      traverse(permission.children);
    }

    return childIds;
  };

  // 将权限树转换为 Tree 组件需要的格式
  const convertPermissionsToTreeData = (
    permissions: PermissionItem[]
  ): DataNode[] => {
    return permissions.map((permission) => ({
      title: permission.name,
      key: permission.id,
      value: permission.id,
      children: permission.children
        ? convertPermissionsToTreeData(permission.children)
        : undefined,
    }));
  };

  // 处理权限树选择变化
  const handlePermissionTreeChange = (
    checkedKeys:
      | React.Key[]
      | { checked: React.Key[]; halfChecked: React.Key[] }
  ) => {
    // Tree 组件的 onCheck 回调可能返回数组或对象（checkStrictly 模式下返回数组）
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    const newSelectedIds = keys as number[];

    // 构建父权限映射
    const parentMap = buildParentMap(permissions);

    // 找出新增和移除的权限ID
    const currentSelectedSet = new Set(selectedPermissionIds);
    const newSelectedSet = new Set(newSelectedIds);
    const addedIds: number[] = [];
    const removedIds: number[] = [];

    newSelectedSet.forEach((id) => {
      if (!currentSelectedSet.has(id)) {
        addedIds.push(id);
      }
    });

    currentSelectedSet.forEach((id) => {
      if (!newSelectedSet.has(id)) {
        removedIds.push(id);
      }
    });

    // 开始处理：先应用新的选择状态
    const finalSelectedIds = new Set(newSelectedIds);

    // 处理新增权限
    addedIds.forEach((id) => {
      // 1. 如果是父权限，自动选中所有子权限（向下级联）
      const childIds = getAllChildIds(id, permissions);
      childIds.forEach((childId) => {
        finalSelectedIds.add(childId);
      });

      // 2. 自动选中所有父权限（向上级联）
      const parentIds = getAllParentIds(id, parentMap);
      parentIds.forEach((parentId) => {
        finalSelectedIds.add(parentId);
      });
    });

    // 处理移除权限
    removedIds.forEach((id) => {
      // 1. 如果移除的是父权限，需要同时移除所有子权限（向下级联）
      const childIds = getAllChildIds(id, permissions);
      childIds.forEach((childId) => {
        finalSelectedIds.delete(childId);
      });

      // 2. 如果移除的是子权限，不移除父权限（保持父权限选中）
      // 注意：这里不执行向上清理逻辑
    });

    setSelectedPermissionIds(Array.from(finalSelectedIds));
  };

  // 保存角色权限
  const handleSavePermissions = async () => {
    if (!permissionRole) return;

    try {
      await updateRolePermissionsApi(permissionRole.id, {
        permissionIds: selectedPermissionIds,
      });
      message.success(t("roles.message.updatePermissionsSuccess"));
      setPermissionModalOpen(false);
      setPermissionRole(null);
      setSelectedPermissionIds([]);
    } catch (error) {
      console.error(t("roles.message.updatePermissionsError"), error);
    }
  };

  // 使用 useCallback 包装 request 函数，避免每次渲染都重新创建
  const handleRequest = useCallback(
    async (params?: Record<string, unknown>) => {
      // ProTable 传递的是 current，接口需要的是 page
      // 搜索参数：name 和 code 都映射到 keyword
      const keyword = params?.name || params?.code || params?.keyword;

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

      const result = await getRoleListApi(requestParams);

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
        <h2 className="text-xl font-bold">{t("roles.title")}</h2>
        <Access code="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            {t("roles.create")}
          </Button>
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

      {/* 新增/编辑角色弹窗 */}
      <Modal
        title={editingRole ? t("roles.edit") : t("roles.create")}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingRole(null);
          formRef.current?.onReset();
        }}
        footer={null}
        width={860}
        destroyOnHidden
      >
        <ProForm
          ref={formRef}
          items={formItems}
          onSubmit={editingRole ? handleUpdate : handleCreate}
        />
      </Modal>

      {/* 权限配置弹窗 */}
      <Modal
        title={`${t("roles.configurePermissions")} - ${permissionRole?.name}`}
        open={permissionModalOpen}
        onCancel={() => {
          setPermissionModalOpen(false);
          setPermissionRole(null);
          setSelectedPermissionIds([]);
        }}
        onOk={handleSavePermissions}
        width={600}
        destroyOnHidden
      >
        <Spin spinning={loadingPermissions}>
          {permissions.length > 0 ? (
            <Tree
              checkable
              checkStrictly
              checkedKeys={selectedPermissionIds}
              onCheck={handlePermissionTreeChange}
              treeData={convertPermissionsToTreeData(permissions)}
              defaultExpandAll
              style={{ maxHeight: "500px", overflowY: "auto" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px" }}>
              {loadingPermissions ? t("loading") : t("noPermissions")}
            </div>
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default Roles;
