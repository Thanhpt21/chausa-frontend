'use client';

import { Image, Layout, Menu } from 'antd';
import { AppleOutlined, AppstoreOutlined, AuditOutlined, BgColorsOutlined, BranchesOutlined, DashboardOutlined, DropboxOutlined, FileProtectOutlined, FormatPainterOutlined, GiftOutlined, GoldOutlined, HomeOutlined, MessageOutlined, PicLeftOutlined, PicRightOutlined, ProductOutlined, ProjectOutlined, ScissorOutlined, SelectOutlined, SettingOutlined, ShopOutlined, ShoppingCartOutlined, SkinOutlined, SolutionOutlined, TruckOutlined, UnorderedListOutlined, UsergroupAddOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import logocs from '../../assets/images/cslogo.jpg';

interface SidebarAdminProps {
  collapsed: boolean;
}

export default function SidebarAdmin({ collapsed }: SidebarAdminProps) {

  const { currentUser, isLoading: authLoading } = useAuth();

  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="!bg-white shadow"
      style={{ backgroundColor: '#fff' }}
    >
      <div className=" text-center py-4">
        <Image
          src={logocs?.src}
          alt="Admin Logo"
          width={collapsed ? 40 : 120}
          preview={false}
        />
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: <Link href="/admin">Thống kê</Link>,
          },
          // {
          //   key: '2',
          //   icon: <AuditOutlined />,
          //   label: <Link href="/admin/exportReceipt">Đơn báo giá</Link>,
          // },
          {
            key: 'transfer',
            icon: <DropboxOutlined />,
            label: <Link href="/admin/transfer">Phiếu xuất kho</Link>,
          },
         
          {
            key: 'product',
            icon: <ProductOutlined />,
            label: <Link href="/admin/product">Sản phẩm</Link>,
          },
          //  {
          //   key: 'purchaseRequest',
          //   icon: <ShoppingCartOutlined />,
          //   label: <Link href="/admin/purchaseRequest">Phiếu mua hàng</Link>,
          // },
          {
            key: 'importReceipt',
            icon: <AuditOutlined />,
            label: <Link href="/admin/importReceipt">Phiếu nhập kho</Link>,
          },
          {
            key: 'customer',
            icon: <UsergroupAddOutlined />,
            label: <Link href="/admin/customer">Khách hàng</Link>,
          },
           {
            key: 'supplier',
            icon: <ShopOutlined />,
            label: <Link href="/admin/supplier">Nhà cung cấp</Link>,
          },
           {
            key: 'warehouse',
            icon: <GoldOutlined />,
            label: <Link href="/admin/warehouse">Kho hàng</Link>,
          },
         ...(currentUser?.role === 'superadmin' ? [{
            key: 'users',
            icon: <UserOutlined />,
            label: <Link href="/admin/users">Tài khoản</Link>,
          }] : []),
          {
            key: 'warranty',
            icon: <SelectOutlined />,
            label: <Link href="/admin/warranty">Bảo hành</Link>,
          },

          {
            key: 'sub1',
            icon: <UnorderedListOutlined />,
            label: 'Danh mục',
            children: [
              { key: 'category', icon: <PicLeftOutlined />, label: <Link href="/admin/category">Sản phẩm</Link> },
              { key: 'color', icon: <FormatPainterOutlined />, label: <Link href="/admin/color">Màu sắc</Link> },
              // { key: '13', icon: <ProjectOutlined />, label: <Link href="/admin/project-category">Hạng mục dự án</Link> },
              // { key: '14', icon: <WalletOutlined />, label: <Link href="/admin/prepayment">Lịch sử tạm ứng</Link> },
              // { key: '15', icon: <WalletOutlined />, label: <Link href="/admin/combo">Combo sản phẩm</Link> },
            ],
          },
        ]}
      />
    </Layout.Sider>
  );
}