const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const $ = (id) => document.getElementById(id);

// carrinho: chave -> { nome, preco, qtd }
const carrinho = new Map();

function renderCardapio() {
  const atalhos = $("atalhos");
  const lista = $("categorias");

  CARDAPIO.forEach((cat) => {
    const a = document.createElement("a");
    a.href = "#" + cat.id;
    a.textContent = cat.nome;
    atalhos.appendChild(a);

    const sec = document.createElement("section");
    sec.className = "categoria";
    sec.id = cat.id;
    sec.innerHTML = "<h3></h3>";
    sec.querySelector("h3").textContent = cat.nome;

    cat.itens.forEach((item) => {
      const el = document.createElement("div");
      el.className = "item";

      if (item.img) {
        const foto = document.createElement("img");
        foto.className = "item-foto";
        foto.src = `assets/produtos/${item.img}.jpg`;
        foto.alt = item.nome;
        foto.loading = "lazy";
        el.appendChild(foto);
      }

      const info = document.createElement("div");
      info.className = "item-info";
      const nome = document.createElement("div");
      nome.className = "item-nome";
      nome.textContent = item.nome;
      info.appendChild(nome);
      if (item.desc) {
        const d = document.createElement("div");
        d.className = "item-desc";
        d.textContent = item.desc;
        info.appendChild(d);
      }
      const preco = document.createElement("div");
      preco.className = "item-preco";
      if (item.opcoes) {
        el.classList.add("com-opcoes");
        item.opcoes.forEach((o) => {
          const s = document.createElement("span");
          s.className = "opcao-preco";
          s.textContent = `${o.rotulo} ${brl(o.preco)}`;
          preco.appendChild(s);
        });
      } else if (item.preco != null) {
        preco.textContent = brl(item.preco);
      }
      if (preco.textContent || preco.children.length) info.appendChild(preco);
      el.appendChild(info);

      const acoes = document.createElement("div");
      acoes.className = "item-acoes";
      if (item.opcoes) {
        item.opcoes.forEach((o) => {
          const b = document.createElement("button");
          b.className = "add";
          b.textContent = "+ " + o.rotulo;
          b.setAttribute("aria-label", `Adicionar ${item.nome} ${o.rotulo}`);
          b.onclick = () => adicionar(`${item.nome} (${o.rotulo})`, o.preco);
          acoes.appendChild(b);
        });
      } else if (item.preco != null) {
        const b = document.createElement("button");
        b.className = "add";
        b.textContent = "+";
        b.setAttribute("aria-label", "Adicionar " + item.nome);
        b.onclick = () => adicionar(item.nome, item.preco);
        acoes.appendChild(b);
      } else {
        const l = document.createElement("a");
        l.className = "add add-whats";
        l.textContent = "Solicitar";
        l.target = "_blank";
        l.rel = "noopener";
        l.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de ver o cardápio do dia (marmitex).")}`;
        acoes.appendChild(l);
      }
      el.appendChild(acoes);
      sec.appendChild(el);
    });

    lista.appendChild(sec);
  });
}

function adicionar(nome, preco) {
  const atual = carrinho.get(nome);
  if (atual) atual.qtd++;
  else carrinho.set(nome, { nome, preco, qtd: 1 });
  atualizar();
}

function alterar(nome, delta) {
  const it = carrinho.get(nome);
  if (!it) return;
  it.qtd += delta;
  if (it.qtd <= 0) carrinho.delete(nome);
  atualizar();
}

function totais() {
  let qtd = 0, valor = 0;
  carrinho.forEach((i) => { qtd += i.qtd; valor += i.qtd * i.preco; });
  return { qtd, valor };
}

function atualizar() {
  const { qtd, valor } = totais();
  $("abrirCarrinho").hidden = qtd === 0;
  $("qtdTotal").textContent = qtd + (qtd === 1 ? " item" : " itens");
  $("valorTotal").textContent = brl(valor);
  $("totalPainel").textContent = brl(valor);

  $("form").hidden = qtd === 0;
  const ul = $("itensCarrinho");
  ul.innerHTML = "";
  if (qtd === 0) {
    ul.innerHTML = '<li class="vazio">Seu carrinho está vazio.</li>';
    abrirPainel(false);
    return;
  }
  carrinho.forEach((i) => {
    const li = document.createElement("li");
    li.innerHTML = '<span class="nome"></span><span class="qtd"><button type="button">−</button><span></span><button type="button">+</button></span><strong></strong>';
    li.querySelector(".nome").textContent = i.nome;
    const [menos, mais] = li.querySelectorAll("button");
    menos.setAttribute("aria-label", "Diminuir " + i.nome);
    mais.setAttribute("aria-label", "Aumentar " + i.nome);
    menos.onclick = () => alterar(i.nome, -1);
    mais.onclick = () => alterar(i.nome, 1);
    li.querySelector(".qtd span").textContent = i.qtd;
    li.querySelector("strong").textContent = brl(i.qtd * i.preco);
    ul.appendChild(li);
  });
}

function abrirPainel(abrir) {
  $("painel").classList.toggle("aberto", abrir);
  $("fundo").hidden = !abrir;
}

function montarMensagem(f) {
  const linhas = ["*Novo pedido — O Frangão*", ""];
  carrinho.forEach((i) => linhas.push(`${i.qtd}x ${i.nome} — ${brl(i.qtd * i.preco)}`));
  linhas.push("", `*Total: ${brl(totais().valor)}*`, "");
  linhas.push(`Nome: ${f.nome.value.trim()}`);
  linhas.push(`Tipo: ${f.tipo.value}`);
  if (f.tipo.value === "Entrega") linhas.push(`Endereço: ${f.endereco.value.trim()}`);
  linhas.push(`Pagamento: ${f.pagamento.value}`);
  if (f.obs.value.trim()) linhas.push(`Obs.: ${f.obs.value.trim()}`);
  return linhas.join("\n");
}

function ajustarEndereco() {
  const entrega = $("form").tipo.value === "Entrega";
  $("campoEndereco").hidden = !entrega;
  $("form").endereco.required = entrega;
}

renderCardapio();
atualizar();
ajustarEndereco();

$("abrirCarrinho").onclick = () => abrirPainel(true);
$("fecharCarrinho").onclick = () => abrirPainel(false);
$("fundo").onclick = () => abrirPainel(false);
$("form").addEventListener("change", ajustarEndereco);
$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (carrinho.size === 0) return;
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(montarMensagem(e.target))}`;
  window.open(url, "_blank", "noopener");
});
