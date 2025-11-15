import type{ ReactNode } from "react";

interface ModalProps {
  id: string;
  children: ReactNode;
  buttonLabel: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const closeModal = (id: string) => {
 (document?.getElementById(id) as HTMLDialogElement)?.close();
};


export function Modal({ id, children, buttonLabel }: ModalProps) {
  return (
    <>
<button className="btn" onClick={()=>(document?.getElementById(id) as HTMLDialogElement)?.showModal()}>{buttonLabel}</button>
<dialog id={id} className="modal">
  <div className="modal-box">
    {children}
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
    </>
  );
}

export default Modal;