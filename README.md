# Loja de variedades

Protótipo React/Vite de loja comercial multicategorias, com busca, filtros, ordenação, carrinho demonstrativo e cupons.

## Funcionalidades

- Catálogo de eletrônicos, casa, beleza, acessórios e presentes
- Botões e fotos de produtos iniciam um pedido no WhatsApp com mensagem codificada
- Carrinho demonstrativo com quantidades e cupons
- Temas e cores personalizáveis; imagem de fundo apenas por upload; alternância entre modo claro/escuro
- Até cinco fotos por produto, adicionadas pelo computador e navegáveis por miniaturas na vitrine; imagens existentes podem ser mantidas ao editar
- Vitrine inicial simplificada; detalhes, opções de compra e carrinho são exibidos em telas próprias
- Upload da foto da identidade da loja, com otimização local no navegador
- Atalho visível “Área da equipe” na home, com painel demonstrativo protegido por senha
- Edição do nome e da foto da loja pela Área da equipe; imagens enviadas são otimizadas e salvas neste navegador
- Criação, pausa, ativação e remoção de cupons percentuais pela Área da equipe
- Configuração dos links de Instagram, Facebook, TikTok e YouTube, exibidos no cabeçalho e no rodapé da loja
- Tela de abertura animada e transições na vitrine, nos produtos e nas telas de compra
- Layout adaptado para celular; animações respeitam a preferência por movimento reduzido

## Executar

```bash
npm install
npm run dev
```

## Acesso administrativo demonstrativo

Use o atalho **Área da equipe** no cabeçalho da home ou acesse `/admin`. A senha padrão da demonstração é `zoo2026`. Para trocá-la localmente, copie `.env.example` para `.env.local`, altere `VITE_ADMIN_PASSWORD` e reinicie o Vite. O login é pedido novamente ao recarregar a página.

O gate de senha existe no frontend e não é autenticação segura: a variável Vite fica acessível no bundle do navegador. Não use dados reais nem publique esse painel como sistema administrativo. Uma versão de produção precisa validar identidade e autorização no servidor.

## Build e limitações

```bash
npm run build
```

LocalStorage não sincroniza entre dispositivos. Cupons e checkout são demonstrativos, sem pagamento real; os cupons aceitam descontos percentuais de 1% a 100%. Redes sociais e catálogo são salvos neste navegador. O WhatsApp usa `+55 81 98976-9880`; as imagens do catálogo são URLs externas HTTPS.
