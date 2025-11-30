'use client';

import {
    Modal,
    Form,
    Input,
    Upload,
    message,
    Button,
    Select,
    Checkbox,
    Row,
    Col,
    InputNumber,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState, useMemo } from 'react';
import { useUpdateProduct } from '@/hooks/product/useUpdateProduct';
import { ProductUpdateModalProps } from '@/types/product.type';
import DynamicRichTextEditor from '@/components/common/RichTextEditor';
import { Category } from '@/types/category.type';
import { WeightUnit } from '@/enums/product.enums';
import { useQueryClient } from '@tanstack/react-query';
import { useAllColors } from '@/hooks/color/useAllColors';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

function convertNewlinesToHtml(text: string) {
  return text
    .split('\n')
    .map(line => line.trim() === '' ? '<p><br/></p>' : `<p>${line}</p>`)
    .join('');
}

export const ProductUpdateModal = ({
    open,
    onClose,
    product,
    refetch,
    categories,
}: ProductUpdateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [description, setDescription] = useState('');
    const { mutateAsync, isPending } = useUpdateProduct();
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const [selectedColors, setSelectedColors] = useState<number[]>([]);
    const { data: colors, isLoading } = useAllColors({});

    // Initialize selectedColors and form field when product changes
    useEffect(() => {
        if (product && product.colors && open) {
            const selectedColorIds = product.colors.map((color) => color.colorId);
            setSelectedColors(selectedColorIds);
            form.setFieldsValue({ colors: selectedColorIds }); // Sync form with selectedColors
        }
    }, [product, open, form]);

    // Reset form and states when modal is closed or product changes
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null);
            setSelectedColors([]);
        } else if (product && open) {
            const currentCategory = categories.find((cat) => cat.id === product.categoryId);
            let initialParentCategoryId: number | null = null;
            let initialSubCategoryId: number | null = null;

            if (currentCategory) {
                if (currentCategory.parentId === null) {
                    initialParentCategoryId = currentCategory.id;
                    initialSubCategoryId = null;
                } else {
                    initialSubCategoryId = currentCategory.id;
                    initialParentCategoryId = currentCategory.parentId ?? null;
                }
            }

            form.setFieldsValue({
                title: product.title,
                sku: product.sku,
                price: product.price,
                discount: product.discount,
                slug: product.slug,
                parentCategoryId: initialParentCategoryId,
                subCategoryId: initialSubCategoryId,
                description: product.description,
                // weight: product.weight,
                // weightUnit: product.weightUnit,
                discountSingle: product.discountSingle,
                discountMultiple: product.discountMultiple,
                unit: product.unit,
                colors: product.colors ? product.colors.map((color) => color.colorId) : [], // Initialize form colors field
            });
            setDescription(product.description || '');
            setSelectedParentCategoryId(initialParentCategoryId);
            setThumbFileList(
                product.thumb ? [{ uid: '-1-thumb', name: 'thumb', status: 'done', url: product.thumb }] : []
            );
        }
    }, [product, open, form, categories]);

    const parentCategories = useMemo(() => {
        return categories.filter((cat) => cat.parentId === null);
    }, [categories]);

    const subCategories = useMemo(() => {
        if (selectedParentCategoryId === null) {
            return [];
        }
        return categories.filter((cat) => cat.parentId === selectedParentCategoryId);
    }, [categories, selectedParentCategoryId]);

    const handleColorChange = (checkedValues: CheckboxValueType[]) => {
        const newSelectedColors = checkedValues.map((value) => Number(value));
        setSelectedColors(newSelectedColors);
        form.setFieldsValue({ colors: newSelectedColors }); // Sync form with selectedColors
    };

    const onFinish = async (values: any) => {
        try {
            const thumbFile = thumbFileList?.[0]?.originFileObj;
            const formData = new FormData();

            formData.append('title', values.title);
            formData.append('slug', values.slug);
            formData.append('sku', values.sku);
            formData.append('price', values.price);
            if (description) {
                formData.append('description', description);
            }


            if (values.discount !== undefined && values.discount !== null && values.discount !== '') {
                formData.append('discount', values.discount.toString());
            } else {
                formData.append('discount', '0');
            }
            
            if (values.discountSingle !== undefined && values.discountSingle !== null && values.discountSingle !== '') {
                formData.append('discountSingle', values.discountSingle.toString());
            } else {
                formData.append('discountSingle', '0');
            }

            if (values.discountMultiple !== undefined && values.discountMultiple !== null && values.discountMultiple !== '') {
                formData.append('discountMultiple', values.discountMultiple.toString());
            } else {
                formData.append('discountMultiple', '0');
            }

            let finalCategoryId: number | null = null;
            if (values.subCategoryId !== undefined && values.subCategoryId !== null) {
                finalCategoryId = values.subCategoryId;
            } else if (values.parentCategoryId !== undefined && values.parentCategoryId !== null) {
                finalCategoryId = values.parentCategoryId;
            }

            if (finalCategoryId !== null) {
                formData.append('categoryId', finalCategoryId.toString());
            } else {
                message.error('Vui lòng chọn một danh mục (cha hoặc con).');
                return;
            }

            if (thumbFile) {
                formData.append('thumb', thumbFile);
            }

            if (values.weight !== undefined && values.weight !== null) {
                formData.append('weight', values.weight.toString());
            }
            if (values.weightUnit) {
                formData.append('weightUnit', values.weightUnit);
            }
            if (values.unit) {
                formData.append('unit', values.unit);
            }

            if (selectedColors.length > 0) {
                const colorsData = selectedColors.map((colorId: number) => {
                    // Tìm title của mỗi màu trong danh sách colors
                    const color = colors?.find((color) => color.id === colorId);
                    return {
                        colorId,
                        title: color?.title || '',  // Thêm title của màu
                        quantity: 0,  // Số lượng mặc định là 0 nếu chưa có
                    };
                });
                formData.append('colors', JSON.stringify(colorsData));
            }
            if (!product) {
                message.error('Không tìm thấy sản phẩm để cập nhật');
                return;
            }

            await mutateAsync({ id: product.id, data: formData });
            message.success('Cập nhật sản phẩm thành công');
            onClose();
            refetch?.();
            queryClient.invalidateQueries({ queryKey: ['productSizes', product.id] });
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi cập nhật sản phẩm');
        }
    };

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal
            title="Cập nhật sản phẩm"
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
                        maxCount={1}
                        onChange={({ fileList }) => setThumbFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
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
                            <InputNumber  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any} min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giảm giá (đ)" name="discount">
                            <InputNumber min={0} style={{ width: '100%' }} />
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
                                placeholder="Chọn Danh mục cha"
                                onChange={(value: number | null) => {
                                    setSelectedParentCategoryId(value);
                                    form.setFieldsValue({ subCategoryId: undefined });
                                }}
                            >
                                {parentCategories.map((category: Category) => (
                                    <Select.Option key={category.id} value={category.id}>
                                        {category.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Danh mục con (tùy chọn)" name="subCategoryId">
                            <Select
                                placeholder="Chọn Danh mục con"
                                disabled={selectedParentCategoryId === null || subCategories.length === 0}
                            >
                                {subCategories.map((subCat: Category) => (
                                    <Select.Option key={subCat.id} value={subCat.id}>
                                        {subCat.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                                {/* Chọn màu sắc */}
                <Form.Item label="Chọn màu" name="colors" rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}>
                    <Checkbox.Group
                        value={selectedColors} // Controlled by selectedColors state
                        onChange={handleColorChange}
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

                  <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Đơn vị tính" name="unit" rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}>
                            <Input placeholder="Ví dụ: cái, hộp, bộ" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Khối lượng" name="weight">
                            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Nhập khối lượng" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Đơn vị khối lượng" name="weightUnit">
                            <Select placeholder="Chọn đơn vị">
                                {Object.values(WeightUnit).map((unit) => (
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
                        <Form.Item label="Giảm giá mua 1" name="discountSingle">
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
                        <Form.Item label="Giảm giá mua >= 2" name="discountMultiple">
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
                    <DynamicRichTextEditor 
                        value={convertNewlinesToHtml(description)} 
                        onChange={(html) => {
                            setDescription(html);
                        }} 
                        />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isPending} block>
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};