import { ReactNode } from 'react'
import { Breakpoint, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from '@mui/material'
interface InteractionModalProps {
    title: string
    children: ReactNode
    close: () => void
    size?: Breakpoint
}

export const InteractionModal = ({ children, close, title, size }: InteractionModalProps) => {
    const fullScreen = useMediaQuery('(min-width:1024px)')

    return (
        <div>
            <Dialog
                fullScreen={!fullScreen}
                open={true}
                onClose={close}
                maxWidth={size ?? 'lg'}
                fullWidth={true}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
                <DialogContent>{children}</DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={close}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
