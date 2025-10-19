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

// Listar todas as questões
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

// Buscar uma questão pelo ID
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" });
    }

    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// Excluir uma questão pelo ID
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();

    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" });
    }

    await db.query("DELETE FROM questoes WHERE id = $1", [id]);
    res.status(200).json({ mensagem: "Questão excluída com sucesso!!" });
  } catch (e) {
    console.error("Erro ao excluir questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// 🆕 Inserir uma nova questão
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada");

  try {
    const data = req.body;

    // Validação
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem: "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD();
    const consulta =
      "INSERT INTO questoes (enunciado, disciplina, tema, nivel) VALUES ($1, $2, $3, $4)";
    await db.query(consulta, [data.enunciado, data.disciplina, data.tema, data.nivel]);

    res.status(201).json({ mensagem: "Questão criada com sucesso!" });
  } catch (e) {
    console.error("Erro ao inserir questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// 🆕 Atualizar uma questão pelo ID
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes/:id solicitada");

  try {
    const id = req.params.id; // Pega o ID da questão da URL
    const db = conectarBD(); // Conecta ao banco de dados

    // Verifica se a questão existe
    let resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);
    let questao = resultado.rows;

    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" });
    }

    const data = req.body; // Pega os dados enviados no corpo da requisição

    // Mantém os valores atuais caso algum campo não seja informado
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão no banco
    await db.query(
      "UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5",
      [data.enunciado, data.disciplina, data.tema, data.nivel, id]
    );

    res.status(200).json({ message: "Questão atualizada com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ######
// Inicializar servidor
// ######
app.listen(port, () => {
  console.log(`✅ Serviço rodando na porta: ${port}`);
});



