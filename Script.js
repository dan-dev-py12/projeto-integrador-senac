// ---------- Dados iniciais----------
const clientesIniciais = [
    { id: 1, nome: "Daniel Almeida Raposo", email: "daniel@example.com",  telefone: "(82) 356-7733", endereco: "", nascimento: "" },
    { id: 2, nome: "Verity Hoover",         email: "verity@example.com",  telefone: "(82) 356-2233", endereco: "", nascimento: "" },
    { id: 3, nome: "Naruto Uzumaki",        email: "naruto@example.com",  telefone: "(82) 356-7733", endereco: "", nascimento: "" },
    { id: 4, nome: "Pedrinho Matos",        email: "pedro@example.com",   telefone: "(82) 956-7772", endereco: "", nascimento: "" },
    { id: 5, nome: "João Vitor",            email: "joao@example.com",    telefone: "(82) 956-7736", endereco: "", nascimento: "" },
    { id: 6, nome: "Ricardo Silva",         email: "ricardo@example.com", telefone: "(82) 956-5232", endereco: "", nascimento: "" },
    { id: 7, nome: "Flora de Liz",          email: "flora@example.com",   telefone: "(11) 956-7327", endereco: "", nascimento: "" },
    { id: 8, nome: "Taylor Silva",          email: "taylor@example.com",  telefone: "(11) 956-1629", endereco: "", nascimento: "" },
];
 
const CHAVE = "sao-joao-clientes";
 
// ---------- Elementos da página ----------
const form        = document.getElementById("ccliente");
const tituloForm  = document.getElementById("titulo-form");
const btnSalvar   = document.getElementById("salvar");
const btnCancelar = document.getElementById("cancelar");
const filtro      = document.getElementById("filtro");
const lista       = document.getElementById("lista-clientes");
 
const campos = {
    nome:       document.getElementById("nome"),
    email:      document.getElementById("email"),
    telefone:   document.getElementById("telefone"),
    endereco:   document.getElementById("endereco"),
    nascimento: document.getElementById("nascimento"),
};
 
// ---------- Estado ----------
let clientes = carregar();
let editandoId = null; // null = cadastrando | número = editando esse cliente
 
// ---------- Salvar / carregar no navegador (localStorage) ----------
function carregar() {
    try {
        const salvo = localStorage.getItem(CHAVE);
        return salvo ? JSON.parse(salvo) : [...clientesIniciais];
    } catch {
        return [...clientesIniciais];
    }
}
 
function persistir() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(clientes));
    } catch {
        // se o navegador bloquear o armazenamento, o site continua funcionando
    }
}
 
// ---------- Mostrar a lista na tabela ----------
function renderizar() {
    const termo = filtro.value.trim().toLowerCase();
    const visiveis = clientes.filter(c => c.nome.toLowerCase().includes(termo));
 
    lista.innerHTML = "";
 
    if (visiveis.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 6;
        td.className = "vazio";
        td.textContent = "Nenhum cliente encontrado.";
        tr.appendChild(td);
        lista.appendChild(tr);
        return;
    }
 
    visiveis.forEach(c => lista.appendChild(criarLinha(c)));
}
 
function criarLinha(c) {
    const tr = document.createElement("tr");
 
    // textContent (e não innerHTML) evita que alguém injete HTML/JS pelo nome
    [c.id, c.nome, c.email, c.telefone, "Cliente"].forEach(valor => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
    });
 
    const tdAcoes = document.createElement("td");
 
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "editar";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => iniciarEdicao(c.id));
 
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "excluir";
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => excluir(c.id));
 
    tdAcoes.append(btnEditar, btnExcluir);
    tr.appendChild(tdAcoes);
 
    return tr;
}
 
// ---------- Salvar cadastro (novo ou editado) ----------
form.addEventListener("submit", (evento) => {
    evento.preventDefault(); // impede a página de recarregar
 
    const dados = {
        nome:       campos.nome.value.trim(),
        email:      campos.email.value.trim(),
        telefone:   campos.telefone.value.trim(),
        endereco:   campos.endereco.value.trim(),
        nascimento: campos.nascimento.value,
    };
 
    if (!dados.nome) {
        campos.nome.focus();
        return;
    }
 
    if (editandoId === null) {
        const proximoId = clientes.length ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
        clientes.push({ id: proximoId, ...dados });
    } else {
        const cliente = clientes.find(c => c.id === editandoId);
        Object.assign(cliente, dados);
    }
 
    persistir();
    sairDoModoEdicao();
    renderizar();
});
 
// ---------- Editar ----------
function iniciarEdicao(id) {
    const c = clientes.find(cli => cli.id === id);
    if (!c) return;
 
    editandoId = id;
    campos.nome.value       = c.nome;
    campos.email.value      = c.email;
    campos.telefone.value   = c.telefone;
    campos.endereco.value   = c.endereco;
    campos.nascimento.value = c.nascimento;
 
    tituloForm.innerHTML = "Editar<br>Cliente";
    btnSalvar.textContent = "Salvar Alterações";
    btnCancelar.hidden = false;
 
    form.scrollIntoView({ behavior: "smooth", block: "start" }); // útil no celular
    campos.nome.focus();
}
 
function sairDoModoEdicao() {
    editandoId = null;
    form.reset();
    tituloForm.innerHTML = "Cadastrar<br>Novo Cliente";
    btnSalvar.textContent = "Salvar Cadastro";
    btnCancelar.hidden = true;
}
 
btnCancelar.addEventListener("click", sairDoModoEdicao);
 
// ---------- Excluir ----------
function excluir(id) {
    const c = clientes.find(cli => cli.id === id);
    if (!c) return;
 
    if (!confirm(`Excluir o cliente "${c.nome}"?`)) return;
 
    clientes = clientes.filter(cli => cli.id !== id);
    persistir();
 
    if (editandoId === id) sairDoModoEdicao();
    renderizar();
}
 
// ---------- Filtrar por nome (atualiza enquanto digita) ----------
filtro.addEventListener("input", renderizar);
 
// ---------- Começa mostrando a lista ----------
renderizar();
 