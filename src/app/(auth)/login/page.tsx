'use client'

import { useLogin } from '@/hooks/auth/useLogin'

import { Form, Input, Button, Card, message, Divider } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const loginMutation = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form] = Form.useForm<LoginFormValues>();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const handleGoogleLogin = () => {
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendBaseUrl) {
      const returnUrl = searchParams.get('returnUrl');
      const googleAuthUrl = `${backendBaseUrl}/auth/google`;
      if (returnUrl) {
        window.location.href = `${googleAuthUrl}?returnUrl=${encodeURIComponent(returnUrl)}`;
      } else {
        window.location.href = googleAuthUrl;
      }
    } else {
      message.error('Cấu hình URL backend không tìm thấy.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="shadow-xl border rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Đăng nhập</h1>
            <p className="text-muted-foreground text-base mt-2">
              Vui lòng nhập thông tin để tiếp tục
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Email không được để trống' }, { type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input
                type="email"
                placeholder="you@example.com"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Mật khẩu không được để trống' }, { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          {/* <Divider>HOẶC</Divider>
          <Button
            type="default"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            className="w-full border-2 border-gray-300 hover:border-blue-500 rounded-md py-2 h-auto text-lg flex items-center justify-center"
          >
            Đăng nhập với Google
          </Button> */}

          <div className="text-sm text-center text-muted-foreground mt-4">
            {/* <Link href="/forgot-password" className="underline hover:text-blue-600 text-blue-500 mr-2">
              Quên mật khẩu?
            </Link> */}
            <Link href="/register" className="underline hover:text-blue-600 text-blue-500 ml-2">
              Đăng ký
            </Link>
          </div>
        </Card>

        {/* <div className="text-center">
          <Link
            href="/"
            className="text-sm text-blue-500 underline hover:text-blue-600 transition-colors duration-150"
          >
            ← Quay về trang chủ
          </Link>
        </div> */}
      </motion.div>
    </div>
  );
}
