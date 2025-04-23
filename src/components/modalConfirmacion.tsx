import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


export default function ModalConfirmacion({open,setOpen,texto,titulo,funcionAceptar}:{open: boolean,setOpen: React.Dispatch<React.SetStateAction<boolean>>,texto?:string,titulo:string,funcionAceptar:Function}) {
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAceptar =()=>{
    funcionAceptar()
    setOpen(false);
  }

  return (
    <div>
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
                {titulo}
            </Typography>
            {texto && <Typography sx={{ mt: 2 }}>
                {texto}
            </Typography>}
            <div>
                <Button color="primary" variant={"contained"} onClick={handleAceptar}>Aceptar</Button>
                <Button color="primary" variant={"outlined"} onClick={handleClose}>Cancelar</Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
