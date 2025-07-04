const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware de parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Criar diretórios necessários
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Diretório criado:', dataDir);
}

// SQLite robusto
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro SQLite:', err.message);
    process.exit(1);
  }
  console.log('SQLite conectado:', dbPath);
});

// Novo: importar modelos
const UserModel = require('./models/user');
const CompanyModel = require('./models/company');
const AccountModel = require('./models/account');
const CategoryModel = require('./models/category');
const TransactionModel = require('./models/transaction');

const userModel = new UserModel(db);
const companyModel = new CompanyModel(db);
const accountModel = new AccountModel(db);
const categoryModel = new CategoryModel(db);
const transactionModel = new TransactionModel(db);

userModel.init();
companyModel.init();
accountModel.init();
categoryModel.init();
transactionModel.init();

// Sessão
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: dataDir }),
  secret: process.env.SESSION_SECRET || 'troque-esse-segredo',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true só se HTTPS
}));

// Importar rotas de autenticação
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Novo: importar rotas de empresa
const companyRoutes = require('./routes/company');
app.use('/', companyRoutes);

// Novo: importar rotas de conta, categoria, transação e relatórios
const accountRoutes = require('./routes/account');
const categoryRoutes = require('./routes/category');
const transactionRoutes = require('./routes/transaction');
const reportRoutes = require('./routes/report');

app.use('/', accountRoutes);
app.use('/', categoryRoutes);
app.use('/', transactionRoutes);
app.use('/', reportRoutes);

// Placeholder para rotas futuras
app.get('/', (req, res) => {
  res.send('Sistema SaaS Financeiro Empresarial - Em desenvolvimento');
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

module.exports = { app, db };