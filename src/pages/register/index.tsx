import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api/auth";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
    nickname?: string;
    avatar?: string;
  }) => {
    setLoading(true);
    try {
      // 调用注册API
      await register({
        username: values.username,
        password: values.password,
        nickname: values.nickname,
        avatar: values.avatar,
      });

      message.success("注册成功，请登录");
      // 注册成功后跳转到登录页
      navigate("/login");
    } catch (error) {
      // 错误信息已经在request工具中统一处理并显示
      // 这里只记录日志，不重复显示错误提示
      console.error("注册错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f0f4ff] dark:bg-gray-900">
      {/* 背景几何图形装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-blue-300/20 dark:bg-blue-400/15 rounded-lg blur-xl"></div>
        <div className="absolute bottom-20 left-40 w-40 h-40 bg-blue-200/20 dark:bg-blue-500/15 rounded-lg blur-2xl"></div>
        <div className="absolute bottom-40 right-20 w-28 h-28 bg-blue-300/30 dark:bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-200/25 dark:bg-blue-500/15 rounded-lg blur-lg"></div>
      </div>
      <div className="flex items-center justify-between p-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Admin</span>
        </div>
        <ThemeSwitcher />
      </div>

      {/* 注册表单区域 */}
      <div className="w-full p-8 mt-8 relative z-10 mx-auto flex flex-col items-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">创建账号</h1>
            <p className="text-gray-500 dark:text-gray-400">填写以下信息完成注册</p>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "请输入用户名" },
                { min: 3, message: "用户名长度必须在 3-50 个字符之间" },
                { max: 50, message: "用户名长度必须在 3-50 个字符之间" },
              ]}
              className="mb-4"
            >
              <Input size="large" placeholder="用户名" className="h-12" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码长度至少为 6 位" },
              ]}
              className="mb-4"
            >
              <Input.Password
                size="large"
                placeholder="密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "请确认密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致"));
                  },
                }),
              ]}
              className="mb-4"
            >
              <Input.Password
                size="large"
                placeholder="确认密码"
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="nickname"
              rules={[{ max: 50, message: "昵称长度不能超过 50 个字符" }]}
              className="mb-4"
            >
              <Input size="large" placeholder="昵称（可选）" className="h-12" />
            </Form.Item>

            <Form.Item
              name="avatar"
              rules={[
                { type: "url", message: "请输入有效的头像 URL" },
                { max: 500, message: "头像 URL 长度不能超过 500 个字符" },
              ]}
              className="mb-4"
            >
              <Input
                size="large"
                placeholder="头像 URL（可选）"
                className="h-12"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                className="h-12 rounded-lg text-base font-medium"
              >
                注册
              </Button>
            </Form.Item>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              已有账号?{" "}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                立即登录
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;

