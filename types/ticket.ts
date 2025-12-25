export type TicketStatus = 'DIAJUKAN' | 'DISETUJUI' | 'DIPROSES' | 'SELESAI';

export type TicketCategory = 'Wifi' | 'Account' | 'Hardware' | 'Software';

export interface Ticket {
  id: string;
  nama: string;
  email: string;
  hp: string;
  subject: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

export interface CreateTicketInput {
  nama: string;
  email: string;
  hp: string;
  subject: string;
  category: TicketCategory;
  description: string;
}
