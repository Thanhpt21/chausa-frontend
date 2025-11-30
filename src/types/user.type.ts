export interface User {
  id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'customer' | 'staff' // có thể mở rộng nếu có thêm quyền
  phoneNumber: string | null
  gender: 'male' | 'female' | 'other' | null // nếu dùng enum, hoặc để `string | null`
  profilePicture: string | null
  profilePicturePublicId: string | null
  isActive: boolean
  type_account: 'normal' | 'google' | 'facebook' | string // tùy theo hệ thống hỗ trợ
  createdAt: string
  updatedAt: string
}
