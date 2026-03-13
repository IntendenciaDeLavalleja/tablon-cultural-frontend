import { z } from 'zod';

export const LOCALITY_CHOICES = [
  "Minas",
  "José Pedro Varela",
  "Solís de Mataojo",
  "José Batlle y Ordóñez",
  "Mariscala",
  "Pirarajá",
  "Zapicán",
  "Villa del Rosario"
] as const;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const eventSubmissionSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
  email: z.string().email("Correo electrónico inválido"),
  confirmEmail: z.string().email("Debe confirmar su correo electrónico"),
  phone: z.string().max(50).optional().or(z.literal('')),
  eventName: z.string().min(3, "El nombre del evento es obligatorio").max(200),
  locality: z.enum(LOCALITY_CHOICES, {
    errorMap: () => ({ message: "Localidad inválida" }),
  }),
  address: z.string().max(255).optional().or(z.literal('')),
  datetime: z.string().min(1, "La fecha es obligatoria"),
  description: z.string().min(10, "La descripción es obligatoria").max(5000),
  links: z.string().max(1000).optional().or(z.literal('')),
  image: z.any()
    .refine((files) => {
      if (!files || files.length === 0) return true; // Opcional
      return files[0]?.size <= MAX_FILE_SIZE;
    }, `El tamaño máximo de la imagen es 2MB.`)
    .refine((files) => {
      if (!files || files.length === 0) return true; // Opcional
      return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
    }, "Solo se permiten formatos .jpg, .jpeg, .png y .webp.")
    .optional(),
  captcha: z.string().min(1, "El captcha es obligatorio"),
  captcha_question: z.string().optional(),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Los correos electrónicos no coinciden",
  path: ["confirmEmail"],
});

export type EventFormData = z.infer<typeof eventSubmissionSchema>;
