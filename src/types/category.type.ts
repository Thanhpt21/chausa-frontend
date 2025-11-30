export interface Category {
  id: number
  title: string
  slug: string
  image: string | null
  createdAt: string
  updatedAt: string
  parentId?: number | null // Thêm parentId
  children?: Category[];
}
