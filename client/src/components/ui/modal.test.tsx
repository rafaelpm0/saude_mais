import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Modal } from "./modal";

describe('Modal Component', () => {
  it('deve renderizar o botão com label correto', () => {
    render(
      <Modal id="test-modal" buttonLabel="Abrir Modal">
        <div>Conteúdo do Modal</div>
      </Modal>
    );

    const button = screen.getByRole('button', { name: 'Abrir Modal' });
    expect(button).toBeDefined();
  });

  it('deve renderizar o conteúdo do modal', () => {
    render(
      <Modal id="test-modal" buttonLabel="Abrir">
        <div>Conteúdo Teste</div>
      </Modal>
    );

    const content = screen.getByText('Conteúdo Teste');
    expect(content).toBeDefined();
  });

  it('deve ter o ID correto no dialog', () => {
    const { container } = render(
      <Modal id="my-modal" buttonLabel="Abrir">
        <div>Teste</div>
      </Modal>
    );

    const dialog = container.querySelector('#my-modal');
    expect(dialog).toBeDefined();
    expect(dialog?.tagName).toBe('DIALOG');
  });
});
