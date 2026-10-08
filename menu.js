// Número do WhatsApp do restaurante que recebe os pedidos: só dígitos, com 55 + DDD.
const WHATSAPP = "554498066341";

// Cada item pode ter "opcoes" (tamanhos) ou "preco". Sem preço = a consultar.
// "img" é o nome do arquivo em assets/produtos/.
const CARDAPIO = [
  {
    id: "marmitex", nome: "Marmitex", itens: [
      { nome: "Cardápio do dia", desc: "Solicite o cardápio pelo WhatsApp", preco: null, img: "marmitex-dia" }
    ]
  },
  {
    id: "porcoes", nome: "Porções", itens: [
      { nome: "Porção de filé de tilápia", desc: "300 gramas", preco: 34.90, img: "porcao-file-tilapia" },
      { nome: "Porção de mandioca", desc: "700 gramas", preco: 18.00, img: "porcao-mandioca" },
      { nome: "Porção de frango com fritas", desc: "1 kg de frango", preco: 54.90, img: "porcao-frango-fritas" },
      { nome: "Porção de batata frita", desc: "400 gramas", preco: 20.00, img: "porcao-batata" },
      { nome: "Porção de frango crocante", desc: "700 gramas", preco: 34.90, img: "porcao-frango-crocante" },
      { nome: "Porção de frango a passarinho", desc: "700 gramas", preco: 34.90, img: "porcao-frango-passarinho" },
      { nome: "Porção de tilápia com fritas", desc: "500 gramas de tilápia", preco: 54.90, img: "porcao-tilapia-fritas" }
    ]
  },
  {
    id: "executivos", nome: "Pratos executivos", itens: [
      { nome: "Executivo Brasileirinho", desc: "Arroz, feijão, bife acebolado e fritas", preco: 22.00, img: "exec-brasileirinho" },
      { nome: "Executivo de filé de frango grelhado", desc: "Arroz, feijão e filé de frango grelhado", img: "exec-grelhado",
        opcoes: [{ rotulo: "P", preco: 22.00 }, { rotulo: "M", preco: 24.00 }, { rotulo: "G", preco: 28.00 }] },
      { nome: "Executivo de frango crocante", desc: "Arroz, feijão e frango crocante", preco: 22.00, img: "exec-crocante" },
      { nome: "Executivo de frango a passarinho", desc: "Arroz, feijão e frango a passarinho", preco: 22.00, img: "exec-passarinho" },
      { nome: "Executivo de filé de tilápia", desc: "Arroz, feijão, filé de tilápia e fritas", preco: 22.00, img: "exec-tilapia" }
    ]
  },
  {
    id: "feijoada", nome: "Feijoada", itens: [
      { nome: "Combo feijoada", desc: "Todos os sábados", preco: 54.90, img: "combo-feijoada" },
      { nome: "Feijoada", desc: "Todos os sábados", preco: 19.00, img: "feijoada" }
    ]
  },
  {
    id: "bebidas", nome: "Bebidas", itens: [
      { nome: "Coca-Cola lata", desc: "", preco: 6.00, img: "coca-lata" },
      { nome: "Coca-Cola 600 ml", desc: "", preco: 8.00, img: "coca-600" },
      { nome: "Coca-Cola 1 litro", desc: "", preco: 11.00, img: "coca-1l" },
      { nome: "Coca-Cola 2 litros", desc: "", preco: 15.00, img: "coca-2l" },
      { nome: "Guaraná 1 litro", desc: "", preco: 8.00, img: "guarana-1l" },
      { nome: "Outro Verde 2 litros", desc: "", preco: 10.00, img: "outro-verde-2l" }
    ]
  }
];
