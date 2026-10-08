"use strict";

(() => {
  const CHAVE_SALVA = "frangao-carrinho-v1";
  const $ = (id) => document.getElementById(id);

  // Valores internos em centavos (inteiros) para evitar erros de arredondamento.
  const emCentavos = (reais) => Math.round(reais * 100);
  const brl = (centavos) =>
    (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const criar = (tag, classe, texto) => {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto != null) el.textContent = texto;
    return el;
  };

  if (!/^55\d{10,11}$/.test(WHATSAPP)) {
    console.warn("WHATSAPP em menu.js deve ter 55 + DDD + número, só dígitos.");
  }
  const linkWhats = (mensagem) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

  // Nome do item (com tamanho, se houver) -> preço em centavos.
  const catalogo = new Map();
  CARDAPIO.forEach((cat) =>
    cat.itens.forEach((item) => {
      if (item.opcoes) {
        item.opcoes.forEach((o) => catalogo.set(`${item.nome} (${o.rotulo})`, emCentavos(o.preco)));
      } else if (item.preco != null) {
        catalogo.set(item.nome, emCentavos(item.preco));
      }
    })
  );

  // Carrinho: nome -> quantidade. O preço vem sempre do catálogo.
  const carrinho = new Map();

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_SALVA) || "[]");
      salvo.forEach(([nome, qtd]) => {
        if (catalogo.has(nome) && Number.isInteger(qtd) && qtd > 0) carrinho.set(nome, qtd);
      });
    } catch (e) { /* sem armazenamento: segue com o carrinho vazio */ }
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE_SALVA, JSON.stringify([...carrinho]));
    } catch (e) { /* ignora */ }
  }

  function botaoAdicionar(nomeCompleto, rotulo, rotuloAria) {
    const b = criar("button", "add", rotulo);
    b.type = "button";
    b.dataset.nome = nomeCompleto;
    b.setAttribute("aria-label", `Adicionar ${rotuloAria}`);
    return b;
  }

  function renderCardapio() {
    const atalhos = $("atalhos");
    const lista = $("categorias");

    CARDAPIO.forEach((cat) => {
      const a = criar("a", null, cat.nome);
      a.href = "#" + cat.id;
      atalhos.appendChild(a);

      const sec = criar("section", "categoria");
      sec.id = cat.id;
      sec.appendChild(criar("h3", null, cat.nome));

      cat.itens.forEach((item) => {
        const el = criar("div", "item");

        if (item.img) {
          const foto = criar("img", "item-foto");
          foto.src = `assets/produtos/${item.img}.jpg`;
          foto.alt = "";
          foto.width = 64;
          foto.height = 64;
          foto.loading = "lazy";
          el.appendChild(foto);
        }

        const info = criar("div", "item-info");
        info.appendChild(criar("div", "item-nome", item.nome));
        if (item.desc) info.appendChild(criar("div", "item-desc", item.desc));

        const preco = criar("div", "item-preco");
        if (item.opcoes) {
          el.classList.add("com-opcoes");
          item.opcoes.forEach((o) =>
            preco.appendChild(criar("span", "opcao-preco", `${o.rotulo} ${brl(emCentavos(o.preco))}`))
          );
        } else if (item.preco != null) {
          preco.textContent = brl(emCentavos(item.preco));
        }
        if (preco.textContent) info.appendChild(preco);
        el.appendChild(info);

        const acoes = criar("div", "item-acoes");
        if (item.opcoes) {
          item.opcoes.forEach((o) =>
            acoes.appendChild(botaoAdicionar(`${item.nome} (${o.rotulo})`, `+ ${o.rotulo}`, `${item.nome} ${o.rotulo}`))
          );
        } else if (item.preco != null) {
          acoes.appendChild(botaoAdicionar(item.nome, "+", item.nome));
        } else {
          const l = criar("a", "add add-whats", "Solicitar");
          l.target = "_blank";
          l.rel = "noopener";
          l.href = linkWhats(`Olá! Gostaria de ver o ${item.nome.toLowerCase()} (${cat.nome.toLowerCase()}).`);
          acoes.appendChild(l);
        }
        el.appendChild(acoes);
        sec.appendChild(el);
      });

      lista.appendChild(sec);
    });
  }

  function totais() {
    let qtd = 0, valor = 0;
    carrinho.forEach((q, nome) => { qtd += q; valor += q * catalogo.get(nome); });
    return { qtd, valor };
  }

  function alterar(nome, delta) {
    const qtd = (carrinho.get(nome) || 0) + delta;
    if (qtd > 0) carrinho.set(nome, qtd);
    else carrinho.delete(nome);
    salvar();
    atualizar();
  }

  function atualizar() {
    const { qtd, valor } = totais();
    const vazio = qtd === 0;

    $("abrirCarrinho").hidden = vazio;
    $("qtdTotal").textContent = qtd + (qtd === 1 ? " item" : " itens");
    $("valorTotal").textContent = brl(valor);
    $("totalPainel").textContent = brl(valor);
    $("rodapeCarrinho").hidden = vazio;
    $("form").hidden = vazio;

    const ul = $("itensCarrinho");
    ul.replaceChildren();
    if (vazio) {
      ul.appendChild(criar("li", "vazio", "Seu carrinho está vazio."));
      abrirPainel(false);
      return;
    }

    carrinho.forEach((q, nome) => {
      const li = criar("li");
      li.appendChild(criar("span", "nome", nome));

      const botaoQtd = (texto, delta, acao) => {
        const b = criar("button", null, texto);
        b.type = "button";
        b.dataset.nome = nome;
        b.dataset.delta = delta;
        b.setAttribute("aria-label", `${acao} ${nome}`);
        return b;
      };
      const controle = criar("span", "qtd");
      controle.append(botaoQtd("−", -1, "Diminuir"), criar("span", null, q), botaoQtd("+", 1, "Aumentar"));
      li.appendChild(controle);
      li.appendChild(criar("strong", null, brl(q * catalogo.get(nome))));
      ul.appendChild(li);
    });
  }

  let ultimoFoco = null;
  function abrirPainel(abrir) {
    const painel = $("painel");
    if (painel.classList.contains("aberto") === abrir) return;
    painel.classList.toggle("aberto", abrir);
    $("fundo").hidden = !abrir;
    document.body.classList.toggle("sem-rolagem", abrir);
    if (abrir) {
      ultimoFoco = document.activeElement;
      $("fecharCarrinho").focus();
    } else if (ultimoFoco && ultimoFoco.isConnected && !ultimoFoco.hidden) {
      ultimoFoco.focus();
    }
  }

  function montarMensagem(f) {
    const entrega = f.tipo.value === "Entrega";
    const linhas = ["*Novo pedido — O Frangão*", ""];
    carrinho.forEach((q, nome) => linhas.push(`${q}x ${nome} — ${brl(q * catalogo.get(nome))}`));
    linhas.push("", `*Total: ${brl(totais().valor)}*`, "");
    linhas.push(`Nome: ${f.nome.value.trim()}`);
    linhas.push(`Tipo: ${f.tipo.value}`);
    if (entrega) linhas.push(`Endereço: ${f.endereco.value.trim()}`);
    linhas.push(`Pagamento: ${f.pagamento.value}`);
    if (f.obs.value.trim()) linhas.push(`Obs.: ${f.obs.value.trim()}`);
    return linhas.join("\n");
  }

  function ajustarEndereco() {
    const f = $("form");
    const entrega = f.tipo.value === "Entrega";
    $("campoEndereco").hidden = !entrega;
    f.endereco.required = entrega;
  }

  // O "required" nativo aceita só espaços; aqui exigimos texto de verdade.
  function validar(f) {
    [f.nome, f.endereco].forEach((campo) => {
      const obrigatorio = campo.required;
      campo.setCustomValidity(obrigatorio && !campo.value.trim() ? "Preencha este campo." : "");
    });
    return f.reportValidity();
  }

  // ---- Eventos ----
  $("categorias").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-nome]");
    if (b) alterar(b.dataset.nome, 1);
  });

  $("itensCarrinho").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-nome]");
    if (b) alterar(b.dataset.nome, Number(b.dataset.delta));
  });

  $("limpar").addEventListener("click", () => {
    carrinho.clear();
    salvar();
    atualizar();
  });

  $("abrirCarrinho").addEventListener("click", () => abrirPainel(true));
  $("fecharCarrinho").addEventListener("click", () => abrirPainel(false));
  $("fundo").addEventListener("click", () => abrirPainel(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") abrirPainel(false);
  });

  const form = $("form");
  form.addEventListener("change", ajustarEndereco);
  form.addEventListener("input", (e) => e.target.setCustomValidity?.(""));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (carrinho.size === 0 || !validar(form)) return;
    window.open(linkWhats(montarMensagem(form)), "_blank", "noopener");
  });

  carregar();
  renderCardapio();
  atualizar();
  ajustarEndereco();
})();
