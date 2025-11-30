export enum ContactStatus {
  PENDING = "PENDING",   // Đang chờ xử lý
  RESOLVED = "RESOLVED",  // Đã giải quyết   
  SPAM = "SPAM",     // Thư rác
  ARCHIVED = "ARCHIVED" // Đã lưu trữ
}

export enum ContactType {
  CONTACT = "CONTACT",    // Liên hệ chung (hỏi đáp, hỗ trợ)
  PROMOTION = "PROMOTION", // Đăng ký nhận khuyến mãi/bản tin
  OTHER = "OTHER"      // Các loại khác (tùy chọn)
}