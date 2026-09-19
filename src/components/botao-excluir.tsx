"use client";

import { useFormStatus } from "react-dom";

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
      className="px-2 text-sm font-semibold text-perigo underline-offset-4 hover:underline disabled:opacity-60"
    >
      Excluir
    </button>
  );
}
