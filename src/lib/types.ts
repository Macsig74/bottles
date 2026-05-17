export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          instrument: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          instrument?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          instrument?: string | null
          is_admin?: boolean
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
          position: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          notes?: string | null
          added_by?: string | null
          position?: number | null
          created_at?: string
        }
        Update: {
          title?: string
          artist?: string
          notes?: string | null
          position?: number | null
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
      music_proposals: {
        Row: {
          id: string
          title: string
          artist: string
          youtube_url: string | null
          notes: string | null
          proposed_by: string
          status: 'open' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          youtube_url?: string | null
          notes?: string | null
          proposed_by: string
          status?: 'open' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          title?: string
          artist?: string
          youtube_url?: string | null
          notes?: string | null
          status?: 'open' | 'accepted' | 'rejected'
        }
      }
      proposal_votes: {
        Row: {
          id: string
          proposal_id: string
          user_id: string
          vote: 'yes' | 'no'
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          user_id: string
          vote: 'yes' | 'no'
          reason?: string | null
          created_at?: string
        }
        Update: {
          vote?: 'yes' | 'no'
          reason?: string | null
        }
      }
      proposal_comments: {
        Row: {
          id: string
          proposal_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      library_folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          name?: string
        }
      }
      treasury_transactions: {
        Row: {
          id: string
          amount: number
          description: string
          type: 'income' | 'expense' | 'adjustment'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description: string
          type: 'income' | 'expense' | 'adjustment'
          created_by: string
          created_at?: string
        }
        Update: {
          amount?: number
          description?: string
          type?: 'income' | 'expense' | 'adjustment'
        }
      }
      concerts: {
        Row: {
          id: string
          title: string | null
          date: string
          location: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          date: string
          location?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          title?: string | null
          date?: string
          location?: string | null
          notes?: string | null
        }
      }
      concert_setlist: {
        Row: {
          id: string
          concert_id: string
          song_id: string
          position: number
          added_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          concert_id: string
          song_id: string
          position?: number
          added_by?: string | null
          created_at?: string
        }
        Update: {
          position?: number
        }
      }
      library_files: {
        Row: {
          id: string
          name: string
          folder_id: string | null
          file_url: string
          file_type: string
          file_size: number
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          folder_id?: string | null
          file_url: string
          file_type: string
          file_size: number
          uploaded_by: string
          created_at?: string
        }
        Update: {
          name?: string
          folder_id?: string | null
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
export type MusicProposal = Database['public']['Tables']['music_proposals']['Row']
export type ProposalVote = Database['public']['Tables']['proposal_votes']['Row']
export type ProposalComment = Database['public']['Tables']['proposal_comments']['Row']
export type LibraryFolder = Database['public']['Tables']['library_folders']['Row']
export type LibraryFile = Database['public']['Tables']['library_files']['Row']
export type TreasuryTransaction = Database['public']['Tables']['treasury_transactions']['Row']
export type Concert = Database['public']['Tables']['concerts']['Row']
export type ConcertSetlistEntry = Database['public']['Tables']['concert_setlist']['Row']
