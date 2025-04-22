import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect({titulo,opciones,valorSelect,setValorSelect}:{titulo:string,opciones:{nombre: string,valor: number}[],valorSelect:number,setValorSelect: React.Dispatch<React.SetStateAction<number>>}) {

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel>{titulo}</InputLabel>
        <Select
          value={valorSelect}
          onChange={(e)=>setValorSelect(Number(e.target.value))}
          label={titulo}
        >
          {opciones.map(opcion=><MenuItem key={opcion.valor+opcion.nombre+Math.random()} value={opcion.valor}>{opcion.nombre}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );
}
