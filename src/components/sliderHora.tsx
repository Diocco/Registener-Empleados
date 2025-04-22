import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const minDistance = 5; // por ejemplo, 30 minutos mínimo entre los thumbs

// convierte un valor (0–1439) a "HH:mm"
function formatTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

export default function SliderHora({minutosSeleccionados,setMinutosSeleccionados}:{minutosSeleccionados:number[],setMinutosSeleccionados: React.Dispatch<React.SetStateAction<number[]>>}) {
  // Estado inicial: de 08:00 (480) a 18:00 (1080)

  const handleChange = (
    _: Event,
    newValue: number[],
    activeThumb: number
  ) => {
    if (activeThumb === 0) {
      setMinutosSeleccionados([Math.min(newValue[0], minutosSeleccionados[1] - minDistance), minutosSeleccionados[1]]);
    } else {
      setMinutosSeleccionados([minutosSeleccionados[0], Math.max(newValue[1], minutosSeleccionados[0] + minDistance)]);
    }
  };

  return (
    <Box sx={{ width: 300, mx: 'auto' }}>
      <Slider
        // rango de 0 (00:00) a 1439 (23:59)
        min={0}
        max={1439}
        step={5}
        value={minutosSeleccionados}
        onChange={handleChange}
        // muestra el label con nuestra función
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => formatTime(v)}
        getAriaLabel={() => 'Rango de horas'}
        getAriaValueText={(v) => formatTime(v)}
        disableSwap
      />
    </Box>
  );
}
