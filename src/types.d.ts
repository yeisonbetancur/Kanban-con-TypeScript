// interfas para las tarjetas
export interface Card {
    id: number;
    column_id: number;
    user_id: number;
    title: string;
    description: string;
  };
  
  // interfaz para las columnas
  export interface Column {
    id: number;
    title: string;
    user_id: number;
  }

  // interfaz para los usuarios
  export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
  }