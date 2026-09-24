"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Turnstile = {
  render: (
    elemento: HTMLElement,
    opcoes: {
      sitekey: string;
      size: "flexible";
      language: string;
      callback: () => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widget: string) => void;
  remove: (widget: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

/**
 * Widget do Cloudflare Turnstile. Ele mesmo põe o token num input escondido
 * `cf-turnstile-response` dentro do form. `tentativa` muda a cada resposta do
 * servidor: aí o widget gera outro token, porque cada um só vale uma vez.
 */
export function Captcha({
  siteKey,
  tentativa,
  onPronto,
}: {
  siteKey: string;
  tentativa: unknown;
  onPronto: (pronto: boolean) => void;
}) {
  const [semScript, setSemScript] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const widget = useRef<string>(undefined);
  const aoMudar = useRef(onPronto);
  useEffect(() => {
    aoMudar.current = onPronto;
  });

  // Chamado quando o script carrega e quando o componente monta (o script pode já
  // estar carregado de uma visita anterior à página)
  function renderizar() {
    if (!window.turnstile || !caixa.current || widget.current) return;
    widget.current = window.turnstile.render(caixa.current, {
      sitekey: siteKey,
      size: "flexible",
      language: "pt-br",
      callback: () => aoMudar.current(true),
      "expired-callback": () => aoMudar.current(false),
      "error-callback": () => aoMudar.current(false),
    });
  }

  useEffect(() => {
    renderizar();
    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = undefined;
    };
    // renderizar só lê refs e a siteKey, que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primeira = useRef(tentativa);
  useEffect(() => {
    if (tentativa !== primeira.current && widget.current) {
      window.turnstile?.reset(widget.current);
    }
  }, [tentativa]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={renderizar}
        onError={() => setSemScript(true)}
      />
      <div ref={caixa} className="min-h-[65px]" />
      {semScript && (
        <p role="alert" className="text-sm text-perigo">
          Não deu pra carregar a verificação anti-robô. Se tiver bloqueador de anúncios,
          libere este site e recarregue a página.
        </p>
      )}
    </>
  );
}
