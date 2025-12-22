/**
 * Validation utilities for form inputs
 */

// Validate email format
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email không được để trống' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Email không hợp lệ (ví dụ: example@email.com)' };
  }
  
  return { valid: true };
};

// Validate password: 6-8 ký tự, có chữ hoa, chữ thường
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Mật khẩu không được để trống' };
  
  if (password.length < 6 || password.length > 8) {
    return { valid: false, message: 'Mật khẩu phải từ 6-8 ký tự' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase) {
    return { valid: false, message: 'Mật khẩu phải có cả chữ hoa và chữ thường' };
  }
  
  return { valid: true };
};

// Validate phone number (10 số)
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Số điện thoại không được để trống' };
  
  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's 10 digits
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, message: 'Số điện thoại phải có đúng 10 chữ số' };
  }
  
  return { valid: true, cleaned: cleanPhone };
};

// Validate age (10-120)
export const validateAge = (age) => {
  if (!age && age !== 0) return { valid: false, message: 'Tuổi không được để trống' };
  
  const ageNum = parseInt(age);
  if (isNaN(ageNum)) {
    return { valid: false, message: 'Tuổi phải là số' };
  }
  
  if (ageNum < 10 || ageNum > 120) {
    return { valid: false, message: 'Tuổi phải từ 10 đến 120' };
  }
  
  return { valid: true };
};

// Validate height in cm (50-250)
export const validateHeight = (height) => {
  if (!height && height !== 0) return { valid: false, message: 'Chiều cao không được để trống' };
  
  const heightNum = parseInt(height);
  if (isNaN(heightNum)) {
    return { valid: false, message: 'Chiều cao phải là số' };
  }
  
  if (heightNum < 50 || heightNum > 250) {
    return { valid: false, message: 'Chiều cao phải từ 50 đến 250 cm' };
  }
  
  return { valid: true };
};

// Validate weight in kg (20-300)
export const validateWeight = (weight) => {
  if (!weight && weight !== 0) return { valid: false, message: 'Cân nặng không được để trống' };
  
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum)) {
    return { valid: false, message: 'Cân nặng phải là số' };
  }
  
  if (weightNum < 20 || weightNum > 300) {
    return { valid: false, message: 'Cân nặng phải từ 20 đến 300 kg' };
  }
  
  return { valid: true };
};

// Validate name (not empty, max 100 chars)
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Tên không được để trống' };
  }
  
  if (name.length > 100) {
    return { valid: false, message: 'Tên không được quá 100 ký tự' };
  }
  
  return { valid: true };
};

// Validate OTP (6 digits)
export const validateOTP = (otp) => {
  if (!otp) return { valid: false, message: 'Mã OTP không được để trống' };
  
  const otpRegex = /^[0-9]{6}$/;
  if (!otpRegex.test(otp)) {
    return { valid: false, message: 'Mã OTP phải có đúng 6 chữ số' };
  }
  
  return { valid: true };
};

// Validate title (not empty, max 200 chars)
export const validateTitle = (title) => {
  if (!title || title.trim() === '') {
    return { valid: false, message: 'Tiêu đề không được để trống' };
  }
  
  if (title.length > 200) {
    return { valid: false, message: 'Tiêu đề không được quá 200 ký tự' };
  }
  
  return { valid: true };
};

// Validate message/content (not empty, max 2000 chars)
export const validateMessage = (message) => {
  if (!message || message.trim() === '') {
    return { valid: false, message: 'Nội dung không được để trống' };
  }
  
  if (message.length > 2000) {
    return { valid: false, message: 'Nội dung không được quá 2000 ký tự' };
  }
  
  return { valid: true };
};

// Validate post content (max 5000 chars)
export const validatePostContent = (content) => {
  if (!content || content.trim() === '') {
    return { valid: false, message: 'Nội dung bài viết không được để trống' };
  }
  
  if (content.length > 5000) {
    return { valid: false, message: 'Nội dung bài viết không được quá 5000 ký tự' };
  }
  
  return { valid: true };
};

// Bad words list (Tiếng Việt và Tiếng Anh)
const BAD_WORDS = [
  // Tiếng Việt
  'địt', 'đụ', 'đéo', 'đm', 'dm', 'đmm', 'clmm', 'clgt', 'vl', 'vcl', 'vkl',
  'lồn', 'buồi', 'dái', 'cặc', 'cặt', 'dick', 'pussy', 'asshole', 'bitch',
  'đồ ngu', 'đồ chó', 'đồ súc vật', 'đồ khùng', 'đồ điên',
  'fuck', 'shit', 'damn', 'hell', 'crap', 'bastard', 'idiot', 'stupid',
  'ngu si', 'ngu xuẩn', 'đần độn', 'thiểu năng',
  'đồ con hoang', 'đồ khốn', 'đồ súc vật', 'đồ khốn nạn',
  'cút', 'biến đi', 'đi chết đi',
  'đồ chết tiệt', 'đồ mất dạy', 'đồ vô văn hóa'
];

// Helper function to check for bad words
const containsBadWords = (text) => {
  if (!text) return { found: false, word: null };
  
  const textLower = text.toLowerCase().trim();
  const words = textLower.split(/\s+/);
  
  for (const badWord of BAD_WORDS) {
    // Check exact word match
    if (words.includes(badWord)) {
      return { found: true, word: badWord };
    }
    // Check if bad word is contained in text (to catch variations)
    if (textLower.includes(badWord)) {
      return { found: true, word: badWord };
    }
  }
  
  return { found: false, word: null };
};

// Validate comment (not empty, max 1000 chars, no bad words)
export const validateComment = (comment) => {
  if (!comment || comment.trim() === '') {
    return { valid: false, message: 'Nội dung bình luận không được để trống' };
  }
  
  if (comment.length > 1000) {
    return { valid: false, message: 'Nội dung bình luận không được quá 1000 ký tự' };
  }
  
  // Kiểm tra từ ngữ khiếm nhã
  const badWordCheck = containsBadWords(comment);
  if (badWordCheck.found) {
    return { valid: false, message: 'Bình luận chứa từ ngữ không phù hợp. Vui lòng sử dụng ngôn ngữ lịch sự.' };
  }
  
  return { valid: true };
};

// Validate log content (max 1000 chars)
export const validateLogContent = (content) => {
  if (!content || content.trim() === '') {
    return { valid: false, message: 'Ghi chú không được để trống' };
  }
  
  if (content.length > 1000) {
    return { valid: false, message: 'Ghi chú không được quá 1000 ký tự' };
  }
  
  return { valid: true };
};

