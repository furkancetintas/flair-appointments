import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'E-posta adresi gereklidir' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .max(255, { message: 'E-posta adresi 255 karakterden az olmalıdır' }),
  password: z
    .string()
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    .max(100, { message: 'Şifre 100 karakterden az olmalıdır' }),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Ad Soyad en az 2 karakter olmalıdır' })
    .max(100, { message: 'Ad Soyad 100 karakterden az olmalıdır' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'E-posta adresi gereklidir' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' })
    .max(255, { message: 'E-posta adresi 255 karakterden az olmalıdır' }),
  phone: z
    .string()
    .trim()
    .min(10, { message: 'Telefon numarası en az 10 karakter olmalıdır' })
    .max(20, { message: 'Telefon numarası 20 karakterden az olmalıdır' })
    .regex(/^[0-9+\-\s()]+$/, { message: 'Geçerli bir telefon numarası giriniz' }),
  password: z
    .string()
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    .max(100, { message: 'Şifre 100 karakterden az olmalıdır' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
