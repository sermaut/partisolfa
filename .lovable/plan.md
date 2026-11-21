# Assistente de IA para orientar solicitações musicais

## O que será criado
- Na Nova Solicitação, incluir uma acção para gerar sugestões de orientações a partir do serviço, título e descrição preenchidos.
- Mostrar a sugestão para revisão antes de a aplicar ao campo de recomendações; manter edição manual, estados de carregamento e erros acessíveis.
- Usar o modelo OpenAI padrão do Lovable AI Gateway, com chamadas e instruções mantidas no servidor. Não expor chaves no navegador.

## Implementação
- Criar uma função do Lovable Cloud para validar a sessão e os dados de entrada, chamar o OpenAI via AI SDK Responses em fluxo e devolver a sugestão final.
- Ligar a função à Nova Solicitação e acrescentar os auxiliares do gateway necessários, seguindo as regras de CORS, autenticação e erros.
- Manter o site bloqueado como está; não alterar preços, saldo, upload nem o processo de envio.
- Registar em `AGENTS.md` a decisão técnica de alojar chamadas de IA em funções server-side.

## Verificação
- Confirmar compilação e verificar a interface se o bloqueio actual permitir; não desactivar o bloqueio para testar.
- A chamada real depende de a função e a chave do Lovable AI Gateway estarem disponíveis no ambiente Cloud.