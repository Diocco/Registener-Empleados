import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UsuariosI } from "../interfaces/empleados";
import { SalidasI } from "../interfaces/salidas";
import { RegistrosI } from "../interfaces/registros";
import { obtenerRegistros } from "../services/registros";
import { AppDispatch, RootState } from "./store";
import { obtenerEmpleados, solicitarActualizarUsuario, solicitarAgregarUsuario, solicitarEliminarUsuario } from "../services/usuarios";
import { TurnosI } from "../interfaces/turnos";
import { eliminarTurno, modificarTurno, solicitarAgregarTurno, obtenerTurnos } from '../services/turnos';

interface VariablesState {
  // Crea la interface de lo que contiene la variable global
  usuarios:UsuariosI[],
  salidas:SalidasI[],
  turnos:TurnosI[],
  registros: RegistrosI[]
}

const initialState: VariablesState = {
  // Crea las condiciones iniciales
  usuarios: [],
  salidas: [],
  turnos: [],
  registros: [],
};

export const actualizarRegistros=(usuarioId:string) => async (dispatch: AppDispatch, getState: () => RootState)=> {
    obtenerRegistros() // Actualiza los registros
      .then((respuesta) => {
        dispatch(definirRegistros(respuesta))
      })
}

export const actualizarTurnos=(turnos:TurnosI[]) => async (dispatch: AppDispatch)=> {

    
    Promise.all(turnos.map((turno)=>{
      if(turno.id.startsWith("00000")){ // Si el turno es nuevo entonces lo agrega a la base de datos
        solicitarAgregarTurno({turno})
      }else if(turno.id.startsWith("-1")){ // Si el turno fue eliminado entonces lo elimina de la bade de datos
        eliminarTurno({turnoId:turno.id.substring(2)}) // Envia el id sin el "-1"
      }else{
        modificarTurno({turno}) // Si el turno ya existia entonces lo actualiza
      }
    }))
    .then(async ()=>{
      const turnosDb = await obtenerTurnos()
      dispatch(definirTurnos(turnosDb))
    })
    
}

export const actualizarUsuario=({usuario}:{usuario:UsuariosI})=> async (dispatch: AppDispatch) => {
  solicitarActualizarUsuario({usuario})
  .then(()=>{
    actualizarRegistros(usuario.usuarioId) // Actualiza los registros
    obtenerEmpleados() // Actualiza los usuarios
    .then((usuarios)=>{
      dispatch(definirUsuarios(usuarios))
    })
  })
}

export const agregarUsuario=({usuario}:{usuario:UsuariosI})=> async (dispatch: AppDispatch) => {
  solicitarAgregarUsuario({usuarioNombre:usuario.nombre})
  .then(()=>{
    actualizarRegistros(usuario.usuarioId) // Actualiza los registros
    obtenerEmpleados() // Actualiza los usuarios
    .then((usuarios)=>{
      dispatch(definirUsuarios(usuarios))
    })
  })
}

export const eliminarUsuario=({usuarioId}:{usuarioId:string})=> async (dispatch: AppDispatch) => {
  solicitarEliminarUsuario({usuarioId:usuarioId})
  .then(()=>{
    obtenerEmpleados() // Actualiza los usuarios
    .then((usuarios)=>{
      dispatch(definirUsuarios(usuarios))
    })
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
    definirRegistros(state, action: PayloadAction<RegistrosI[]>){
      state.registros = action.payload
    },
    definirTurnos(state, action: PayloadAction<TurnosI[]>){
      state.turnos = action.payload
    },
    reiniciarVariables: () => initialState,
  },
});

export const {
  definirUsuarios,
  definirSalidas,
  reiniciarVariables,
  definirRegistros,
  definirTurnos
} = variablesSlice.actions; // Se exporta las funciones
export default variablesSlice.reducer; // Se exporta la configuracion



