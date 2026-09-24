// Chave do limite de tentativas de login a partir do x-forwarded-for. Na Vercel o
// primeiro IP da lista é o do cliente (ela sobrescreve o que vier dele, então não dá
// pra forjar). Um IPv6 vale pela rede /64: é o bloco que um provedor entrega a uma
// casa só, e quem tem um /64 troca de endereço dentro dele à vontade.
export function chaveDoIp(xForwardedFor: string | null) {
  const ip = xForwardedFor?.split(",")[0].trim().toLowerCase();
  if (!ip) return "sem-ip";

  const semZona = ip.split("%")[0];
  const ipv4Mapeado = semZona.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (ipv4Mapeado) return ipv4Mapeado[1];
  if (!semZona.includes(":")) return semZona;

  const [inicio, fim] = semZona.split("::");
  const grupos = (parte: string | undefined) => (parte ? parte.split(":") : []);
  const antes = grupos(inicio);
  const depois = grupos(fim);
  const zeros = fim === undefined ? 0 : 8 - antes.length - depois.length;
  const completo = [...antes, ...Array<string>(Math.max(zeros, 0)).fill("0"), ...depois];
  if (completo.length !== 8 || !completo.every((g) => /^[0-9a-f]{1,4}$/.test(g))) {
    return semZona;
  }

  const rede = completo.slice(0, 4).map((g) => parseInt(g, 16).toString(16));
  return `${rede.join(":")}::/64`;
}
