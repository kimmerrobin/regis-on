# 🚀 Guia de Vibe Coding & Colaboração - PresençaBio

Bem-vindos ao projeto! Este guia foi feito para que todos os 3 integrantes possam participar do desenvolvimento utilizando Inteligência Artificial (Vibe Coding), mesmo sem conhecimento prévio em programação tradicional.

---

## 🎯 Proposta do Aplicativo
**PresençaBio**: Aplicativo de Gestão e Registro Digital de Presença em Treinamentos por Reconhecimento Facial.
* **Problema que resolvemos**: Fim das listas de presença manuais em papel, perda de tempo, assinaturas ilegíveis ou trabalhadores com dificuldade de escrita.
* **Público-alvo**: Técnicos em Segurança do Trabalho (TST), RH e gestores de treinamento.
* **Diferencial de Negócio**: Conformidade com Normas Regulamentadoras (NRs: NR-35, NR-10, NR-6) e LGPD, com foto comprobatória da presença.

---

## 📂 Como o Projeto Está Organizado
* `src/components/FacialScanner.jsx` -> Tela principal de **chamada com a câmera**, mira biométrica e validação facial.
* `src/components/Dashboard.jsx` -> Painel com métricas de tempo economizado, turmas em andamento e visão executiva.
* `src/components/AttendanceReport.jsx` -> Tela que gera o **relatório e lista de presença oficial em PDF**.
* `src/components/EmployeeManager.jsx` -> Cadastro de trabalhadores e fotos/selfies de referência.
* `src/data/mockData.js` -> Dados iniciais de funcionários e treinamentos para testes.

---

## 💡 Como Vibe-Codar com a IA (Fórmula do Prompt Perfeito)

Quando for pedir alterações ou novas funcionalidades para a IA, use a seguinte estrutura:

1. **Onde mexer**: Diga em qual tela ou componente deseja a alteração (ex: *"No componente AttendanceReport..."*).
2. **O que fazer**: Descreva a funcionalidade ou visual com clareza (ex: *"Adicione um botão para filtrar presenças por setor da fábrica"*).
3. **Detalhes e Estilo**: Diga como quer que fique visualmente (ex: *"Use cores em tons de cinza e verde esmeralda, com cantos arredondados"*).
4. **Testar e Ajustar**: Olhe o resultado no navegador. Se algo não ficou bom, dê feedback: *"O botão ficou muito pequeno no celular, aumente o tamanho dele e coloque um ícone de filtro"*.

---

## 👥 Sugestão de Divisão de Tarefas entre os 3 Colegas

* **Integrante 1 (Experiência do Usuário & Scanner Facial)**:
  * Melhorar o design do scanner na câmera.
  * Adicionar sons ou mensagens de voz ("Presença confirmada, bom treinamento!").
  * Testar o uso em celulares diferentes.

* **Integrante 2 (Relatórios & Negócio / Pitch)**:
  * Aperfeiçoar o relatório para incluir carimbos específicos de NRs (ex: NR-1, NR-35).
  * Criar opções de download em CSV/Excel além do PDF.
  * Validar o modelo de negócio (quanto a empresa economiza em papel e horas de trabalho).

* **Integrante 3 (Gestão de Dados & Colaboradores)**:
  * Criar importação em massa de colaboradores via planilha.
  * Criar filtros de presença por cargo, turno ou setor.
