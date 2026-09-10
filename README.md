# Portfólio — Paulo Henrique Araújo

Site estático em HTML e CSS. Abra `index.html` no navegador para acessar a página inicial ou `sobre-mim.html` para ver a implementação atual da página Sobre mim.

Não há instalação de dependências. Os links internos usam arquivos HTML explícitos e funcionam também ao abrir os arquivos diretamente no navegador. Para servir localmente, execute `node scripts/serve.mjs`; para preparar uma cópia de publicação em `dist/`, execute `node scripts/build.mjs`.

## Estrutura

```text
portfolio/
├── index.html                 # Página inicial
├── sobre-mim.html             # Sobre mim — implementação atual do Figma
├── manutencao.html            # Página de manutenção
├── projetos/
│   ├── index.html             # Índice de projetos
│   └── thomson-reuters/
│       └── index.html         # Caso Dom DS · Thomson Reuters
├── modo/
│   └── index.html             # Página provisória da Modo
├── assets/
│   ├── css/
│   │   ├── tokens.css         # Tokens usados por início, projetos e Modo
│   │   ├── base.css           # Estilos compartilhados dessas três páginas
│   │   ├── styles.css         # Estilos atuais da página Sobre mim
│   │   ├── sobre.css          # Estilos anteriores, preservados como referência
│   │   ├── manutencao.css     # Estilos da página de manutenção
│   │   ├── case.css           # Estilos do caso Dom DS
│   │   └── interactions.css   # Seleção de texto e linhas do cursor
│   ├── fonts/
│   │   ├── geist-variable.ttf
│   │   └── geist-mono-variable.ttf
│   ├── images/
│   │   ├── favicon.png        # Ícone exportado do Figma, node 198:134
│   │   ├── retrato-paulo.jpg
│   │   └── thomson-reuters/   # 13 assets exportados do Figma
│   └── js/
│       └── cursor.js          # Linhas do cursor nas páginas habilitadas
├── scripts/                  # Servidor local e cópia de publicação
├── .openai/hosting.json       # Identificação do site privado no Sites
└── README.md
```

## Edição

- **Sobre mim:** edite `sobre-mim.html` e `assets/css/styles.css`. A página usa a foto exportada do Figma e fontes Geist locais; funciona sem conexão. Referência: frame `82:2`, consultado em 8 de setembro de 2026.
- **Dom DS · Thomson Reuters:** edite `projetos/thomson-reuters/index.html` e `assets/css/case.css`. Referência: frame `193:3` do arquivo Figma `TvLJ3bRAY0jKiQPjm8BL2R`, consultado em 9 de setembro de 2026. O caso usa fontes locais, textos em HTML, timeline responsiva e 13 imagens que podem ser abertas em tamanho original. O número de componentes em homologação foi confirmado como 45. O Core Web usa Stencil para Angular e React; Core App usa React Native. A legenda editorial provisória do Storybook foi adaptada para o leitor do caso.
- **Assets do caso:** a origem de cada exportação está em `assets/images/thomson-reuters/manifest.json`. A prancha de tokens foi exportada com seus limites completos para evitar o corte causado pelo frame da seção no Figma.
- **Revisão visual do caso:** grade, tipografia, espaçamentos, resultados, timeline e contato conferidos contra o frame de 1440 px. A matriz de priorização usa a exportação atual do node `251:19969`. A adaptação para celular foi conferida em uma área útil de 375 px, sem transbordamento horizontal.
- **Início, projetos e Modo:** edite os respectivos HTMLs, `assets/css/tokens.css` e `assets/css/base.css`. Início e Modo ainda têm conteúdo provisório; essas páginas carregam Geist pelo Google Fonts.
- **Interações compartilhadas:** todas as páginas carregam `assets/css/interactions.css` para a seleção de texto invertida. Áreas escuras usam `.dark` ou `data-surface="dark"`. Início, manutenção, índice de projetos e casos carregam `assets/js/cursor.js` e habilitam as linhas com `data-cursor-guides` no `body`. O efeito usa o mouse, respeita movimento reduzido e não captura cliques ou seleção de texto.
- **Manutenção:** edite `manutencao.html` e `assets/css/manutencao.css`. A página usa Google Fonts e mantém a configuração `noindex, nofollow`.
- **CSS anterior:** `assets/css/sobre.css` não é carregado por nenhuma página atual. Foi preservado como referência; não substitui `assets/css/styles.css`.

## Navegação e distribuição

Início, Sobre mim, projetos e Modo estão ligados por caminhos locais. “Meu resumo” usa o endereço do Google Drive já presente na página Sobre mim; LinkedIn e e-mail mantêm seus destinos.

Copie a pasta inteira ou o conteúdo de `dist/` para distribuir o site, preservando a estrutura de `assets`, `projetos` e `modo`. Alterações locais não publicam automaticamente. A configuração do Sites usa a pasta `dist/` para uma prévia privada; o domínio pessoal não é alterado.
