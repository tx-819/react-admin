import { useState, useRef, useCallback, useMemo } from "react";
import { Tag, Space, Button, Modal, message, Tree, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";
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

  // 表格列定义
  const columns: ProColumnType<RoleItem>[] = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
      width: 200,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入角色名称",
        },
      },
    },
    {
      title: "角色代码",
      dataIndex: "code",
      key: "code",
      width: 200,
      formItem: {
        type: "input",
        fieldProps: {
          placeholder: "请输入角色代码",
        },
      },
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
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 300,
      render: (remark: string) => remark || "-",
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
              编辑
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
            权限
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
        name: "name",
        label: "角色名称",
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingRole?.name,
        fieldProps: {
          placeholder: "请输入角色名称",
        },
      },
      {
        name: "code",
        label: "角色代码",
        type: "input",
        required: true,
        span: 12,
        labelCol: { span: 6 },
        initialValue: editingRole?.code,
        fieldProps: {
          placeholder: "请输入角色代码（小写字母、数字、下划线）",
        },
        rules: [
          {
            pattern: /^[a-z0-9_]+$/,
            message: "角色代码只能包含小写字母、数字和下划线",
          },
        ],
      },
      {
        name: "status",
        label: "状态",
        type: "select",
        initialValue: editingRole?.status ?? 1,
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
        initialValue: editingRole?.remark || "",
        fieldProps: {
          placeholder: "请输入备注信息",
          rows: 4,
        },
        span: 24,
        labelCol: { span: 3 },
      },
    ],
    [editingRole]
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
      message.success("创建成功");
      setModalOpen(false);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error("创建角色失败:", error);
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
      message.success("更新成功");
      setModalOpen(false);
      setEditingRole(null);
      formRef.current?.onReset();
      // 刷新表格
      if (tableRef.current) {
        await tableRef.current.refresh();
      }
    } catch (error) {
      console.error("更新角色失败:", error);
    }
  };

  // 打开新增弹窗
  const handleOpenModal = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: RoleItem) => {
    setEditingRole(record);
    setModalOpen(true);
  };

  // 处理删除角色
  const handleDelete = (record: RoleItem) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除角色"${record.name}"吗？`,
      okText: "确定",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteRoleApi(record.id);
          message.success("删除成功");
          // 刷新表格
          if (tableRef.current) {
            await tableRef.current.refresh();
          }
        } catch (error) {
          console.error("删除角色失败:", error);
        }
      },
    });
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

  // 打开权限配置弹窗
  const handleOpenPermissionModal = async (record: RoleItem) => {
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
      console.error("加载权限数据失败:", error);
      message.error("加载权限数据失败");
    } finally {
      setLoadingPermissions(false);
    }
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
      message.success("权限更新成功");
      setPermissionModalOpen(false);
      setPermissionRole(null);
      setSelectedPermissionIds([]);
    } catch (error) {
      console.error("更新角色权限失败:", error);
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
        <h2 className="text-xl font-bold">角色管理</h2>
        <Access code="create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
          >
            新增角色
          </Button>
        </Access>
      </div>
      <ProTable<RoleItem>
        ref={tableRef}
        columns={columns}
        request={handleRequest}
        size="middle"
        title="角色列表"
        options={{
          showRefresh: true,
          showSizeChanger: true,
        }}
      />

      {/* 新增/编辑角色弹窗 */}
      <Modal
        title={editingRole ? "编辑角色" : "新增角色"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingRole(null);
          formRef.current?.onReset();
        }}
        footer={null}
        width={700}
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
        title={`配置权限 - ${permissionRole?.name}`}
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
              {loadingPermissions ? "加载中..." : "暂无权限数据"}
            </div>
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default Roles;
