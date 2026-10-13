import { z } from 'zod';
import { isISODate, todayInUruguay } from '../../utils/dates';

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
  name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
  email: z.string().trim().toLowerCase().email("Correo electrónico inválido").max(255),
  confirmEmail: z.string().trim().toLowerCase().email("Debe confirmar su correo electrónico").max(255),
  phone: z.string().max(50).optional().or(z.literal('')),
  eventName: z.string().trim().min(3, "El nombre del evento es obligatorio").max(200),
  locality: z.enum(LOCALITY_CHOICES, {
    errorMap: () => ({ message: "Localidad inválida" }),
  }),
  address: z.string().max(255).optional().or(z.literal('')),
  datetime: z.string().refine(isISODate, 'La fecha no es válida').refine(v => v >= todayInUruguay(), 'La fecha no puede ser anterior a hoy'),
  description: z.string().trim().min(10, "La descripción es obligatoria").max(5000),
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
  captcha: z.string().regex(/^\d{1,5}$/, "Ingresá un resultado válido"),
  captcha_question: z.string().optional(),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Los correos electrónicos no coinciden",
  path: ["confirmEmail"],
});

export type EventFormData = z.infer<typeof eventSubmissionSchema>;
