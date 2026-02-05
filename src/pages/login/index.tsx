import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../../api/auth";
import { setAccessToken, setUserInfo } from "../../utils/storage";

const Login = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // 调用登录API
      const response = await login({
        username: values.username,
        password: values.password,
      });

      // 保存token和用户信息
      setAccessToken(response.accessToken);
      setUserInfo(response.user);

      message.success(t("login.loginSuccess"));
      // 登录成功后跳转到首页
      location.href = "/";
    } catch (error) {
      // 错误信息已经在request工具中统一处理并显示
      // 这里只记录日志，不重复显示错误提示
      console.error("登录错误:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f0f4ff]">
      {/* 背景几何图形装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-40 w-24 h-24 bg-blue-300/20 rounded-lg blur-xl"></div>
        <div className="absolute bottom-20 left-40 w-40 h-40 bg-blue-200/20 rounded-lg blur-2xl"></div>
        <div className="absolute bottom-40 right-20 w-28 h-28 bg-blue-300/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-200/25 rounded-lg blur-lg"></div>
      </div>
      <div className="flex items-center gap-2 p-8 ">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
        </div>
        <span className="text-xl font-semibold text-gray-800">Admin</span>
      </div>

      {/* 登录表单区域 */}
      <div className="w-full p-8 mt-8 relative z-10 mx-auto flex flex-col items-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t("login.title")}
            </h1>
            <p className="text-gray-500">{t("login.subtitle")}</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: t("login.rules.usernameRequired") },
                { min: 3, message: t("login.rules.usernameMinLength") },
              ]}
              className="mb-4"
            >
              <Input
                size="large"
                placeholder={t("login.placeholder.username")}
                className="h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t("login.rules.passwordRequired") },
              ]}
              className="mb-4"
            >
              <Input.Password
                size="large"
                placeholder={t("login.placeholder.password")}
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
                {t("login.login")}
              </Button>
            </Form.Item>

            <div className="text-center text-sm text-gray-500">
              {t("login.noAccount")}{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("login.registerNow")}
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
