# PartiSolfa: Your Music Solution

Cria uma plataforma web profissional chamada PARTISOLFA, destinada à recepção e devolução de tarefas musicais, com sistema de contas, créditos, upload de ficheiros e painel administrativo.

OBJETIVO DA PLATAFORMA
A PartiSolfa funciona como uma plataforma automática onde os usuários solicitam serviços musicais, enviando ficheiros (áudio, imagens e PDFs) e recebendo o resultado resolvido directamente na sua conta.  
A comunicação com o usuário deve transmitir que é a própria plataforma que analisa e resolve as solicitações, sem qualquer referência a administradores.

SERVIÇOS DISPONÍVEIS
1. Aperfeiçoamento de músicas e partituras
2. Criação de arranjos musicais

Em ambos os casos:
- O usuário envia ficheiros e recomendações
- O resultado final é devolvido na conta do usuário

SISTEMA DE CONTAS
- Registo e login por e-mail e palavra-passe
- Cada nova conta recebe automaticamente 1.5 créditos
- Dashboard do usuário com:
  - Saldo de créditos
  - Nova solicitação
  - Histórico de tarefas
  - Estado das solicitações
  - Download dos resultados

SISTEMA DE CRÉDITOS
- 1 crédito = 150 Kwanza (Kz)
- Cada serviço consome 1 crédito
- Bloquear novas solicitações se o saldo for insuficiente

DEPÓSITO DE CRÉDITOS
- Sistema de depósito manual
- O usuário informa o valor e anexa comprovativo de transferência
- Dados bancários:
  IBAN: 0040 0000 63929866101 68
  Banco: BAI – Angola
- As solicitações de depósito vão para o painel administrativo
- Após aprovação, o sistema converte automaticamente:
  150 Kz = 1 crédito

UPLOAD DE FICHEIROS
- Tipos permitidos:
  - Áudio (mp3, wav)
  - Imagens (jpg, png)
  - Documentos (PDF)
- Os ficheiros e resultados devem ser visíveis apenas ao usuário solicitante

PAINEL ADMINISTRATIVO
- Gestão de solicitações
- Aprovação de depósitos
- Conversão automática de valores em créditos
- Upload dos resultados
- Alteração do estado das tarefas
- Sistema de notificações internas

PÁGINAS DO SITE
- Página Inicial (textos comerciais claros e profissionais)
- Criar Conta / Login
- Painel do Usuário
- Nova Solicitação
- Depósito de Créditos
- Histórico de Tarefas
- Termos de Uso
- Aviso Legal
- Política de Privacidade
- Painel Administrativo

EXPERIÊNCIA DO USUÁRIO
- Interface moderna, simples e profissional
- Linguagem em português de Angola
- Comunicação baseada em confiança e clareza
- Site responsivo para telemóvel e computador

SEGURANÇA E CONFIANÇA
- Protecção dos dados dos usuários
- Acesso restrito aos ficheiros
- Estrutura preparada para crescimento futuro

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://partisolfa.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/92939889-fcf7-40d1-8c92-1ac91e9d0252).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
