// Shared types for frontend and backend

export interface Source {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
}

export interface Layout {
  id: string;
  title: string;
  bg_color: string;
  data: Source[];
  created_at: string;
  updated_at: string;
}
