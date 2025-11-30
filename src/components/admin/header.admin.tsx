'use client';

import { Layout, Avatar, Dropdown, Menu, Spin } from 'antd';
import {
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import type { MenuProps } from 'antd';
import { useLogout } from '@/hooks/auth/useLogout';
import { useCurrent } from '@/hooks/auth/useCurrent';

interface HeaderAdminProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

export default function HeaderAdmin({ collapsed, onCollapse }: HeaderAdminProps) {
  const { data: user, isLoading } = useCurrent();
  const { logoutUser } = useLogout();

  const items: MenuProps['items'] = [
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => {
        console.log('Go to settings');
      },
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logoutUser(),
    },
  ];

  return (
    <Layout.Header style={{ background: '#fff', padding: '0 16px' }}>
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center">
          <div
            className="cursor-pointer mr-4"
            onClick={() => onCollapse(!collapsed)}
            style={{ fontSize: '20px' }} 
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
    
        </div>

        {isLoading ? (
          <Spin size="small" />
        ) : (
          user && (
            <Dropdown overlay={<Menu items={items} />} trigger={['click']}>
              <div className="flex items-center space-x-2 cursor-pointer select-none">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}
                <span className="font-medium">{user.name}</span>
                <DownOutlined />
              </div>
            </Dropdown>
          )
        )}
      </div>
    </Layout.Header>
  );
}