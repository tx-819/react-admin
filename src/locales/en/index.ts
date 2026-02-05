import users from "./users";
import roles from "./roles";
import menu from "./menu";
import login from "./login";

const modules = {
  users,
  roles,
  menu,
  login,
};

export default {
  ...modules,
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  confirm: "Confirm",
  action: "Action",
  enabled: "Enabled",
  disabled: "Disabled",
  yes: "Yes",
  no: "No",
  createdAt: "Created At",
  password: "Password",
  newPassword: "New Password",
  user: "User",
  logout: "Logout",
  logoutSuccess: "Logged out successfully",
  createSuccess: "Created successfully",
  updateSuccess: "Updated successfully",
  deleteSuccess: "Deleted successfully",
  confirmDelete: "Confirm Delete",
  okText: "Confirm",
  cancelText: "Cancel",
  status: "Status",
  remark: "Remark",
  statusPlaceholder: "Please select status",
  remarkPlaceholder: "Please enter remark",
  permissions: "Permissions",
  loading: "Loading...",
  noPermissions: "No permission data",
  // Search form
  search: "Search",
  reset: "Reset",
  expand: "Expand",
  collapse: "Collapse",
  // Pagination
  pagination: {
    total: "Total {{total}} items",
  },
  // Table settings
  tableSettings: {
    columnSettings: "Column Settings",
    selectAll: "Select All",
    noColumns: "No column configuration",
    noFilterableColumns: "No filterable columns",
    size: {
      small: "Compact",
      middle: "Medium",
      large: "Relaxed",
    },
  },
  // Error messages
  error: {
    loginExpired: "Login expired, please login again",
    unauthorized: "Unauthorized or invalid token",
    forbidden: "Insufficient permissions or user disabled",
    forbiddenShort: "Insufficient permissions",
    requestFailed: "Request failed",
    operationFailed: "Operation failed",
    networkError: "Network error, please check your connection",
    networkErrorShort: "Network error",
  },
};
