import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UsuariosI } from "../interfaces/empleados";
import { SalidasI } from "../interfaces/salidas";
import { RegistrosI } from "../interfaces/registros";
import { obtenerRegistros } from "../services/registros";
import { AppDispatch, RootState } from "./store";

interface VariablesState {
  // Crea la interface de lo que contiene la variable global
  usuarios:UsuariosI[],
  salidas:SalidasI[],
  registrosUsuario:{
    usuarioId:string,
    registros: RegistrosI[]
  },
}

const initialState: VariablesState = {
  // Crea las condiciones iniciales
  usuarios: [],
  salidas: [],
  registrosUsuario: {
    usuarioId: "",
    registros: []
  }
};

export const actualizarRegistros=(usuarioId:string) => async (dispatch: AppDispatch, getState: () => RootState)=> {
  const usuarioRegistro = getState().variablesReducer.registrosUsuario.usuarioId
  if(usuarioRegistro===usuarioId){ // Si el usuario pasado como parametro es el mismo que el seleccionado para ver los registros entonces actualiza los mismos
    obtenerRegistros(usuarioId) // Actualiza los registros
      .then((respuesta) => {
        dispatch(definirRegistros(respuesta))
      })
    }
}

export const actualizarRegistrosUsuario=(usuarioId:string) => async (dispatch: AppDispatch) => {
  dispatch(definirRegistrosUsuario({usuarioId})) // Actualiza el usuarioId de los registros
  obtenerRegistros(usuarioId) // Solicita y actualiza los registros
    .then((respuesta) => {
      dispatch(definirRegistros(respuesta))
    })
}

const variablesSlice = createSlice({
  // Crea el slice, donde se coloca lo anterior y ademas se le define funciones para modificar la variable en "reducers"
  name: "productos",
  initialState,
  reducers: {
    definirUsuarios: (state, action: PayloadAction<UsuariosI[]>) => {
      state.usuarios = action.payload;
    },
    definirSalidas: (state, action: PayloadAction<SalidasI[]>) => {
      state.salidas = action.payload;
    },
    definirRegistrosUsuario: (state, action: PayloadAction<{usuarioId:string}>) => {
      state.registrosUsuario.usuarioId = action.payload.usuarioId; // Obtiene el nuevo usuarioId para buscar los nuevos registros
    },
    definirRegistros(state, action: PayloadAction<RegistrosI[]>){
      state.registrosUsuario.registros = action.payload
    },
    reiniciarVariables: () => initialState,
  },
});

export const {
  definirUsuarios,
  definirSalidas,
  definirRegistrosUsuario,
  reiniciarVariables,
  definirRegistros
} = variablesSlice.actions; // Se exporta las funciones
export default variablesSlice.reducer; // Se exporta la configuracion



