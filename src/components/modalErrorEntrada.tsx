import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { TurnosI } from '../interfaces/turnos';
import { SliderElegirHora } from './sliderHora';
import { RegistrosI } from '../interfaces/registros';
import { obtenerFechaActual } from '../helpers/formatearFecha';


export default function ModalErrorEntrada({open,setOpen,registroEntrada,funcionAceptar,usuarioId}:{open: boolean,setOpen: React.Dispatch<React.SetStateAction<boolean>>,registroEntrada:RegistrosI|undefined,funcionAceptar:Function,usuarioId:string}) {
  if(!registroEntrada||registroEntrada.tipo!=="entrada") return // El modal no deberia estar activo si el ultimo registro no existe o si es un registro de salida

  const [minutosSeleccionados, setMinutosSeleccionados] = React.useState(480)
  const handleClose = () => setOpen(false);
  const dateRegistro = new Date(registroEntrada.hora)

  const handleAceptar =()=>{

    const horas = Math.floor(minutosSeleccionados / 60);
    const minutos = minutosSeleccionados % 60;

    funcionAceptar(usuarioId,new Date(dateRegistro.setHours(horas,minutos,0,0))) // Marca una nueva salida para el mismo dia que la ultima entrada, pero con la hora seleccionada por el usuario
    setOpen(false);
  }

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box className="modalConfirmacion">
            <Typography  variant="h6" component="h2">
                Ultima salida no marcada
            </Typography>
            <Typography sx={{ mt: 2 }}>
                {`Se detectó una entrada el ${obtenerFechaActual({fecha:dateRegistro})} sin una salida correspondiente.
                  Por favor, indique la hora de salida para completar el registro.`}
            </Typography>
            <SliderElegirHora minutosMinimos={dateRegistro.getMinutes()+dateRegistro.getHours()*60} minutosSeleccionados={minutosSeleccionados} setMinutosSeleccionados={setMinutosSeleccionados} disabled={false}/>
            <div>
                <Button color="primary" variant={"contained"} onClick={handleAceptar}>Aceptar</Button>
                <Button color="primary" variant={"outlined"} onClick={handleClose}>Cancelar</Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
