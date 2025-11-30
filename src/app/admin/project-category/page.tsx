'use client';

import ProjectCategoryTable from '@/components/admin/project-category/ProjectCategoryTable';
import { Typography } from 'antd';

const { Title } = Typography;

export default function AdminProjectCategoryPage() {
  return (
    <div className="p-4">
      <Title level={5} className="!mb-4">
        Danh sách hạng mục dự án
      </Title>
      <ProjectCategoryTable />
    </div>
  );
}