"use client";

import { useFormStatus } from "react-dom";
import { botaoPerigo } from "@/lib/estilo";

// Fica dentro do formulário de edição (reaproveita o campo id), mas envia pra outra action
export function BotaoExcluir({
  acao,
  confirmacao,
}: {
  acao: (formData: FormData) => Promise<void>;
  confirmacao: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={acao}
      formNoValidate
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmacao)) e.preventDefault();
      }}
      className={botaoPerigo}
    >
      Excluir
    </button>
  );
}
