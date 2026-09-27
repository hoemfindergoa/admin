export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog: {
        Row: {
          author: string | null
          coments_enabled: boolean | null
          content: string | null
          created_at: string
          id: string
          image: string 
          meta_description: string | null
          meta_tiltle: string | null
          published_at: string
          slug: string
          status: boolean | null
          title: string | null
        }
        Insert: {
          author?: string | null
          coments_enabled?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_tiltle?: string | null
          published_at?: string
          slug: string
          status?: boolean
          title?: string | null
        }
        Update: {
          author?: string | null
          coments_enabled?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_tiltle?: string | null
          published_at?: string
          slug?: string
          status?: boolean |null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_blog_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "instructor"
            referencedColumns: ["id"]
          }
        ]
      }
        franchise_bestpre: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          budget: string;
          property: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          budget: string;
          property: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          email?: string;
          phone?: string;
          city?: string;
          budget?: string;
          property?: string;
        };
        Relationships: [];
      };
      blog_coments: {
        Row: {
          blog_id: number | null
          coment_id: number
          conten: string
          created_at: string
          user_id: string | null
        }
        Insert: {
          blog_id?: number | null
          coment_id?: number
          conten: string
          created_at?: string
          user_id?: string | null
        }
        Update: {
          blog_id?: number | null
          coment_id?: number
          conten?: string
          created_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_blog_coments_coment_id_fkey"
            columns: ["coment_id"]
            isOneToOne: true
            referencedRelation: "blog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_blog_coments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
       admissionbestpre: {
        Row: {
	name: string,
    email: string,
    phone: string,
	state:string
	city:string
	admission_seeking:string
    message: string
	country:string
        }
        Insert: {
	name: string,
    email: string,
    phone: string,
	state:string
	city:string
	admission_seeking:string
    message: string
	country:string
        }
        Update: {
         id: string;
	name: string,
    email: string,
    phone: string,
	state:string
	city:string
	admission_seeking:string
    message: string
	country:string
        }
        Relationships: []
      }
      emaildata: {
        Row: {
         name: string;
          email: string;
          phone: string;
          service: string;
          date: string;
          time: string;
          message: string;
    
        }
        Insert: {
          name: string;
          email: string;
          phone: string;
          service: string;
          date: string;
          time: string;
          message: string;
        }
        Update: {
          name: string;
          email: string;
          phone: string;
          service: string;
          date: string;
          time: string;
          message: string;
        }
        Relationships: []
      }
      catagory: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          catagory_id: number
          chapter_name: string 
          content: string 
          course_id: string 
          created_at: string
          description: string 
          id: number
          instructor: string
          module_id: string
          chapterno:string 
          slug: string 
        }
        Insert: {
          catagory_id: number
          chapter_name?: string | null
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: number
          instructor: string
          module_id?: string | null
          chapterno:string | null
          slug: string 


        }
        Update: {
          catagory_id?: number
          chapter_name?: string | null
          content?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: number
          instructor?: string
          module_id?: string | null
          chapterno:string | null
          slug: string 

        }
        Relationships: [
          {
            foreignKeyName: "public_chapters_catagory_id_fkey"
            columns: ["catagory_id"]
            isOneToOne: false
            referencedRelation: "catagory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chapters_instructor_fkey"
            columns: ["instructor"]
            isOneToOne: false
            referencedRelation: "instructor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chapters_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          }
        ]
      }
      course: {
        Row: {
          banner_image: string
          Catogory_id: string
          created_at: string
          Description: string
          id: string
          instructor: string
          Name: string
          price: string
          slug: string
        }
        Insert: {
          banner_image: string
          Catogory_id: string
          created_at?: string
          Description: string
          id?: string
          instructor: string
          Name: string
          price: string
          slug: string
        }
        Update: {
         banner_image?: string
          Catogory_id?: number
          created_at?: string
          Description?: string
          id?: number
          instructor?: string
          Name?: string
          price?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_Course_Catogory_id_fkey"
            columns: ["Catogory_id"]
            isOneToOne: false
            referencedRelation: "catagory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Course_instructor_fkey"
            columns: ["instructor"]
            isOneToOne: false
            referencedRelation: "instructor"
            referencedColumns: ["id"]
          }
        ]
      }
      instructor: {
        Row: {
          author: string | null
          Bio: string | null
          created_at: string
          github: string | null
          id: string
          instagram: string | null
          linkdin: string | null
          Name: string | null
        }
        Insert: {
          author?: string | null
          Bio?: string | null
          created_at?: string
          github?: string | null
          id?: string
          instagram?: string | null
          linkdin?: string | null
          Name?: string | null
        }
        Update: {
          author?: string | null
          Bio?: string | null
          created_at?: string
          github?: string | null
          id?: string
          instagram?: string | null
          linkdin?: string | null
          Name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_instructor_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      modules: {
        Row: {
          course_id: string 
          created_at: string
          id: number
          module_description: string
          module_name: string
          module_number: number
          slug: string
        }
        Insert: {
          course_id?: string 
          created_at?: string
          id?: number
          module_description: string
          module_name: string
          module_number: number
          slug : string
        }
        Update: {
          course_id?: string 
          created_at?: string
          id?: number
          module_description?: string
          module_name?: string
          module_number?: number
          slug: string
        }
        Relationships: [
          {
            foreignKeyName: "public_Modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
