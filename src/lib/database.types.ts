export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          created_at: string
          name: string
          gender: string
          birthdate: string
          age: number
          address: string
          phone: string | null
          emergency_contact: string | null
          medical_history: string | null
          primary_doctor: string | null
          insurance_type: string
          care_level: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          gender: string
          birthdate: string
          age: number
          address: string
          phone?: string | null
          emergency_contact?: string | null
          medical_history?: string | null
          primary_doctor?: string | null
          insurance_type: string
          care_level: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          gender?: string
          birthdate?: string
          age?: number
          address?: string
          phone?: string | null
          emergency_contact?: string | null
          medical_history?: string | null
          primary_doctor?: string | null
          insurance_type?: string
          care_level?: string
          user_id?: string
        }
      }
      care_plans: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          patient_id: string
          user_id: string
          visit_type: string
          health_status: string | null
          adl_mobility: string | null
          adl_eating: string | null
          adl_toilet: string | null
          adl_bathing: string | null
          patient_family_request: string | null
          doctor_instructions: string | null
          staff_notes: string | null
          goals: Json[]
          issues: Json[]
          supports: Json[]
          status: string
          month: number
          year: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id: string
          user_id: string
          visit_type: string
          health_status?: string | null
          adl_mobility?: string | null
          adl_eating?: string | null
          adl_toilet?: string | null
          adl_bathing?: string | null
          patient_family_request?: string | null
          doctor_instructions?: string | null
          staff_notes?: string | null
          goals?: Json[]
          issues?: Json[]
          supports?: Json[]
          status?: string
          month: number
          year: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          patient_id?: string
          user_id?: string
          visit_type?: string
          health_status?: string | null
          adl_mobility?: string | null
          adl_eating?: string | null
          adl_toilet?: string | null
          adl_bathing?: string | null
          patient_family_request?: string | null
          doctor_instructions?: string | null
          staff_notes?: string | null
          goals?: Json[]
          issues?: Json[]
          supports?: Json[]
          status?: string
          month?: number
          year?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          role: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          role: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          role?: string
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}