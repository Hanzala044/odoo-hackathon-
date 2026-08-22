import { z } from "zod";

export const registerSchema = z.object({
  companyName: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(6).max(20).optional().or(z.literal("")),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  userId: z.string().optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
});

export const leaveApplySchema = z
  .object({
    type: z.enum(["PAID", "SICK", "UNPAID"]),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    remarks: z.string().max(500).optional().nullable(),
  })
  .refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const leaveReviewSchema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminComment: z.string().max(500).optional().nullable(),
});

export const payrollSchema = z.object({
  userId: z.string(),
  salaryBase: z.coerce.number().min(0),
  salaryBonus: z.coerce.number().min(0),
});
