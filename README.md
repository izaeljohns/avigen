# AviGen

Web app de **avicultura de precisão e genética animal**, com múltiplas propriedades (multitenant), incubação, plantel com anilhas, manejo sanitário e financeiro.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (geralmente `http://localhost:5173`).

## Acesso rápido

Na tela de login use **Abrir unidade demonstrativa**, ou:

- E-mail: `demo@avigen.app`
- Senha: `demo123`

Os dados ficam no **LocalStorage** do navegador (sem servidor).

## Módulos

- Autenticação e cadastro de unidades de criação
- Incubação: chocadeiras mecânicas/naturais, lotes de ovos e eclosão em 21 dias
- Plantel: ficha da ave, foto, anilha e filtros
- Manejo: calendário de vacinas, medicação e tarefas
- Financeiro: custos, receitas e painel com lucro
