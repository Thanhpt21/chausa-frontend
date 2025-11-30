'use client';

import {
    Modal,
    Form,
    Input,
    Upload,
    message,
    Button,
    Select,
    InputNumber,
    Row,
    Col,
    Checkbox,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState, useMemo } from 'react';
import { useCreateProduct } from '@/hooks/product/useCreateProduct';
import { Category } from '@/types/category.type';
import DynamicRichTextEditor from '@/components/common/RichTextEditor';
import { WeightUnit } from '@/enums/product.enums';
import { useAllColors } from '@/hooks/color/useAllColors';

export interface ProductCreateModalProps {
    open: boolean;
    onClose: () => void;
    refetch?: () => void;
    categories: Category[];
}

export const ProductCreateModal = ({
    open,
    onClose,
    refetch,
    categories
}: ProductCreateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [description, setDescription] = useState('');
    const { mutateAsync, isPending } = useCreateProduct();

    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);
    const { data: colors, isLoading } = useAllColors({});
   const [selectedColors, setSelectedColors] = useState<{ id: number; title: string; quantity: number }[]>([]);



    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null);
            setSelectedColors([]);
        }
    }, [open, form]);

    const parentCategories = useMemo(() => categories.filter(c => c.parentId === null), [categories]);
    const subCategories = useMemo(() => {
        if (selectedParentCategoryId === null) return [];
        return categories.filter(c => c.parentId === selectedParentCategoryId);
    }, [categories, selectedParentCategoryId]);

    const onFinish = async (values: any) => {
        try {
            const thumbFile = thumbFileList[0]?.originFileObj;

            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('sku', values.sku);
            formData.append('price', values.price.toString());
            formData.append('discount', (values.discount ?? 0).toString());
            formData.append('discountSingle', (values.discountSingle ?? 0).toString());
            formData.append('discountMultiple', (values.discountMultiple ?? 0).toString());
            formData.append('description', description);

            const finalCategoryId = values.subCategoryId ?? values.parentCategoryId;
            if (!finalCategoryId) {
                message.error('Vui lòng chọn danh mục (cha hoặc con)');
                return;
            }
            formData.append('categoryId', finalCategoryId.toString());

            formData.append('thumb', thumbFile);

            if (values.weight !== undefined && values.weight !== null && values.weight !== '') {
                formData.append('weight', values.weight.toString());
            }
            if (values.weightUnit) {
                formData.append('weightUnit', values.weightUnit);
            }
            if (values.unit) {
                formData.append('unit', values.unit);
            }

            if (selectedColors.length > 0) {
                // Chỉnh sửa phần này để thêm title của màu vào trong ProductColor
                const colorsData = selectedColors.map(({ id, title, quantity }) => ({
                    colorId: id,
                    title: title,  // Lấy title từ selectedColors
                    quantity: quantity ?? 0,  // Số lượng mặc định là 0 nếu chưa có
                }));
                formData.append('colors', JSON.stringify(colorsData));
            }

           
            await mutateAsync(formData);
            message.success('Tạo sản phẩm thành công');
            onClose();
            form.resetFields();
            setThumbFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null);
            refetch?.();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi tạo sản phẩm');
        }
    };

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal
            title="Tạo sản phẩm"
            visible={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Ảnh đại diện">
                    <Upload
                        listType="picture-card"
                        fileList={thumbFileList}
                        onChange={({ fileList }) => setThumbFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                    >
                        {thumbFileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên sản phẩm"
                            name="title"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Mã sản phẩm"
                            name="sku"
                            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                        >
                            <InputNumber
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giảm giá (đ)" name="discount">
                            <InputNumber
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                style={{ width: '100%' }}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Danh mục cha"
                            name="parentCategoryId"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục cha' }]}
                        >
                            <Select
                                placeholder="Chọn danh mục cha"
                                allowClear
                                onChange={(value: number | null) => {
                                    setSelectedParentCategoryId(value);
                                    form.setFieldsValue({ subCategoryId: undefined });
                                }}
                            >
                                {parentCategories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Danh mục con (tùy chọn)" name="subCategoryId">
                            <Select
                                placeholder="Chọn danh mục con"
                                allowClear
                                disabled={selectedParentCategoryId === null || subCategories.length === 0}
                            >
                                {subCategories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item label="Chọn màu" name="colors"  rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}>
                    <Checkbox.Group
                        value={selectedColors.map(color => color.id)}  // Lấy chỉ id từ selectedColors để hiển thị trạng thái checkbox
                        onChange={(checkedValues) => {
                            // Cập nhật selectedColors dựa trên những màu đã được chọn
                            const updatedSelectedColors = colors?.filter(color =>
                                checkedValues.includes(color.id)
                            ).map(color => ({
                                id: color.id,
                                title: color.title,
                                quantity: 0,  // Số lượng mặc định là 0
                            })) || [];

                            setSelectedColors(updatedSelectedColors);
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            {isLoading ? (
                                <Col span={24}>Đang tải màu sắc...</Col>
                            ) : (
                                colors?.map((color) => (
                                    <Col span={8} key={color.id}>
                                        <Checkbox value={color.id}>{color.title}</Checkbox>
                                    </Col>
                                ))
                            )}
                        </Row>
                    </Checkbox.Group>
                </Form.Item>    
                  <Form.Item 
                        label="Đơn vị tính" 
                        name="unit" 
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
                        >
                        <Input 
                            placeholder="Nhập đơn vị tính" 
                            defaultValue="cái" // 👈 Tự động điền mặc định
                        />
                        </Form.Item>          
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Khối lượng" name="weight">
                            <InputNumber
                                min={0}
                                step={0.01}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                style={{ width: '100%' }}
                                placeholder="Nhập khối lượng"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Đơn vị khối lượng" name="weightUnit">
                            <Select placeholder="Chọn đơn vị khối lượng">
                                {Object.values(WeightUnit).map(unit => (
                                    <Select.Option key={unit} value={unit}>
                                        {unit}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

              
                 <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                        label="Giảm giá mua 1"
                        name="discountSingle"
                        rules={[{ required: false }]}
                        >
                        <InputNumber
                            min={0}
                            max={100}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace('%', '') as any}
                            style={{ width: '100%' }}
                        />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                        label="Giảm giá mua >= 2"
                        name="discountMultiple"
                        rules={[{ required: false }]}
                        >
                        <InputNumber
                            min={0}
                            max={100}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value!.replace('%', '') as any}
                            style={{ width: '100%' }}
                        />
                        </Form.Item>
                    </Col>
                    </Row>                   


                <Form.Item
                    label="Mô tả"
                    name="description"
            
                    
                >
                    <DynamicRichTextEditor value={description} onChange={setDescription} />
                </Form.Item>





                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isPending} block>
                        Tạo mới
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};
