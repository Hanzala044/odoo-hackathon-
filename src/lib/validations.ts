import { z } from "zod";

export const registerSchema = z.object({
  employeeId: z.string().min(2).max(20),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
