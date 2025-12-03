<img width="1200" height="129" alt="finvisionlogo" src="https://github.com/user-attachments/assets/37df6d7d-7d1c-4c20-a045-3c2e52c5c26b" />

# FinancialControlSystem-Frontend-TCC
> Interface web do Sistema de Controle Financeiro Multi-Tenancy – Desenvolvido por Lucas Mendes Israel

[![Status do Projeto](https://img.shields.io/static/v1?label=STATUS&message=CONCLUÍDO&color=GREEN&style=for-the-badge)]()

### Aplicação: https://finvision-financialctrl.vercel.app/  
### Backend: https://github.com/LucasMIsrael/FinancialControlSystem-Backend-TCC
### Demonstração em vídeo: 

https://github.com/user-attachments/assets/668fafa8-b59e-43fe-973f-fb8c794641a7

<br>

## 🔎 Visão Geral  
Este repositório contém o **frontend do FinVision**, desenvolvido em **Angular**, responsável pela interface web do sistema de controle financeiro multi-tenancy.  
O sistema permite ao usuário visualizar, cadastrar e monitorar suas finanças de forma prática, com dashboards, metas, análise por IA e relatórios.

A plataforma foi desenvolvida como Trabalho de Conclusão de Curso (TCC/Portfólio) para o curso de Engenharia de Software na Universidade Católica de SC – Joinville.

<br>

## 🎨 Tecnologias Utilizadas  
- **Angular 16 + PrimeNG Charts**
- **TypeScript**
- **CSS / HTML5**
- **Consumo de API REST**
- **Karma para testes unitários**

<br>

## 🛠️ Como rodar o projeto localmente  

### ✔ Pré-requisitos:
- Node.js LTS  
- Angular CLI  
- Backend em execução (local ou remoto)  

```bash
# 1. Clone o repositório
git clone https://github.com/LucasMIsrael/FinancialControlSystem-Frontend-TCC.git

# 2. Acesse o diretório
cd FinancialControlSystem-Frontend-TCC

# 3. Instale as dependências
npm install

# 4. Configure o arquivo de ambiente
# Edite: src/environments/environment.ts
# e coloque a URL da API (ex: http://localhost:5243)

# 5. Execute o servidor de desenvolvimento
ng serve

# Aplicação disponível em:
http://localhost:4200/
```
<br>

## 🚀 Funcionalidades Principais
- `Multi-Tenancy`: suporte a múltiplos tenants/ambientes com isolamento de dados;
- `Autenticação`: autenticação e login integrado ao backend com JWT;
- `Transações`: gerenciamento visual de transações planejadas e inesperadas;
- `Metas`: cadastro e acompanhamento de metas financeiras;
- `Dashboard`: dashboard com gráficos interativos;
- `Ranking`: ranking dos 10 ambientes com maior desempenho;
- `Análise de IA`: análise de finanças com apoio de Inteligência Artificial.

<br>

## 📁 Estrutura resumida do projeto
```bash
src/
├── app/
│   ├── models/            → interfaces/dtos e tipos
│   ├── pages/             → páginas principais do sistema e seus componentes
│   ├── services/          → comunicação com a API
│   └── app.module.ts
│
├── assets/                → imagens e ícones
└── environments/          → configuração de API (dev/prod)
```

<br>

## 📦 Scripts disponíveis
```bash
ng serve          # inicia o servidor de desenvolvimento
ng test           # executa os testes unitários (Karma)
ng lint           # executa as análises de código via lint
ng generate       # gera componentes/serviços/módulos automaticamente
```
