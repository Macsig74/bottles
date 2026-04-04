export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          instrument: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          instrument?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          instrument?: string | null
        }
      }
      rehearsal_sessions: {
        Row: {
          id: string
          proposed_by: string | null
          proposed_date: string
          location: string | null
          notes: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          proposed_by?: string | null
          proposed_date: string
          location?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          proposed_date?: string
          location?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
        }
      }
      session_votes: {
        Row: {
          id: string
          session_id: string
          user_id: string
          can_attend: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          can_attend: boolean
          created_at?: string
        }
        Update: {
          can_attend?: boolean
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          notes: string | null
          added_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          notes?: string | null
          added_by?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          artist?: string
          notes?: string | null
        }
      }
      sheet_music: {
        Row: {
          id: string
          song_id: string
          instrument: string
          file_url: string
          file_name: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          instrument: string
          file_url: string
          file_name: string
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          instrument?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type RehearsalSession = Database['public']['Tables']['rehearsal_sessions']['Row']
export type SessionVote = Database['public']['Tables']['session_votes']['Row']
export type Song = Database['public']['Tables']['songs']['Row']
export type SheetMusic = Database['public']['Tables']['sheet_music']['Row']
