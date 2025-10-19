// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis de ambiente

// ######
// Configurações do servidor
// ######
const app = express();
const port = 3000;
const { Pool } = pkg;
let pool = null;

// Middleware para interpretar requisições com corpo em JSON
app.use(express.json());

// ######
// Funções auxiliares
// ######
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}

// ######
// Rotas (endpoints)
// ######

// Rota principal
app.get("/", async (req, res) => {
  console.log("Rota GET / solicitada");
  const db = conectarBD();
  let dbStatus = "ok";

  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  res.json({
    mensagem: "API para Questões de Prova",
    autor: "Arthur Porto",
    dbStatus: dbStatus,
  });
});

// ===== ROTAS CRUD DE QUESTÕES =====
app.get("/questoes", async (req, res) => {
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM questoes");
    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar questões:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.get("/questoes/:id", async (req, res) => {
  const { id } = req.params;
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ mensagem: "Questão não encontrada" });
    res.json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.post("/questoes", async (req, res) => {
  const { enunciado, disciplina, tema, nivel } = req.body;
  if (!enunciado || !disciplina || !tema || !nivel)
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });

  const db = conectarBD();
  try {
    await db.query("INSERT INTO questoes (enunciado, disciplina, tema, nivel) VALUES ($1, $2, $3, $4)", [enunciado, disciplina, tema, nivel]);
    res.status(201).json({ mensagem: "Questão criada com sucesso!" });
  } catch (e) {
    console.error("Erro ao inserir questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.put("/questoes/:id", async (req, res) => {
  const { id } = req.params;
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ mensagem: "Questão não encontrada" });

    const questao = resultado.rows[0];
    const { enunciado, disciplina, tema, nivel } = req.body;

    await db.query(
      "UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5",
      [enunciado || questao.enunciado, disciplina || questao.disciplina, tema || questao.tema, nivel || questao.nivel, id]
    );
    res.json({ mensagem: "Questão atualizada com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.delete("/questoes/:id", async (req, res) => {
  const { id } = req.params;
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ mensagem: "Questão não encontrada" });

    await db.query("DELETE FROM questoes WHERE id = $1", [id]);
    res.json({ mensagem: "Questão excluída com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ===== ROTAS CRUD DE USUÁRIOS =====
app.get("/usuarios", async (req, res) => {
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT id, nome, email, criado_em FROM usuarios");
    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar usuários:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ mensagem: "Usuário não encontrado" });
    res.json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar usuário:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.post("/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: "Todos os campos são obrigatórios." });

  const db = conectarBD();
  try {
    await db.query("INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)", [nome, email, senha]);
    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (e) {
    console.error("Erro ao criar usuário:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    const usuario = resultado.rows[0];
    const { nome, email, senha } = req.body;

    await db.query(
      "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4",
      [nome || usuario.nome, email || usuario.email, senha || usuario.senha, id]
    );
    res.json({ mensagem: "Usuário atualizado com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar usuário:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (resultado.rows.length === 0) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.json({ mensagem: "Usuário excluído com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir usuário:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ######
// Inicializar servidor
// ######
app.listen(port, () => {
  console.log(`✅ Serviço rodando na porta: ${port}`);
});




