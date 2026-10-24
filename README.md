# RR Studio Details — Landing page

Site estático (HTML, CSS e JavaScript puros). Não precisa instalar nada nem rodar build.

## Estrutura
```
index.html              página
assets/css/style.css    estilos
assets/js/main.js       orçamento, calendário e WhatsApp
assets/img/             logo, avatar, ícones e imagem de compartilhamento
favicon.ico
```

## Publicar na Vercel
1. Crie uma conta em vercel.com e clique em **Add New → Project**.
2. Envie esta pasta (pelo GitHub ou arrastando a pasta no painel).
3. Framework Preset: **Other**. Build Command e Output Directory: deixe vazios.
4. Clique em **Deploy**.

Na Netlify também funciona: arraste a pasta em app.netlify.com/drop.

## Tutorial "Como funciona"

O tutorial guiado fica em três arquivos:
- `assets/js/tutorial-data.js` — roteiro, textos e seções-alvo (edite aqui)
- `assets/js/tutorial.js` — lógica do player (não precisa editar)
- `assets/css/tutorial.css` — estilos (não precisa editar)

### Áudios (pré-gravados ou gerados)

Coloque os arquivos em `assets/audio/tutorial/` com os nomes `01.mp3` … `06.mp3`.

**Especificações técnicas:**
- Formato: MP3 mono, 64–96 kbps
- Volume: normalizado em −16 LUFS, sem chiado
- Sem música de fundo (ou trilha muito baixa, −30 dB)

**Voz:**
- Voz feminina adulta, pt-BR, sotaque neutro
- Tom suave, calmo e acolhedor (como uma atendente simpática)
- Ritmo: ~140 palavras por minuto
- Pausas naturais entre frases (~400 ms) e entre etapas

**Pronúncias:**
- "RR" → "érre érre"
- "PPF" → "pê-pê-éfe"
- "WhatsApp" → "uótsap"

**Serviços recomendados:** ElevenLabs, Azure Neural TTS ou Google Cloud TTS (pt-BR neural).
Use exatamente os textos das `phrases` em `tutorial-data.js`.

**Legendas sincronizadas:** após gerar/gravar, preencha o campo `timestamps` de cada etapa
em `tutorial-data.js` com os segundos de início de cada frase:
```js
timestamps: [0, 3.2, 7.8]  // uma entrada por frase
```
Sem o campo preenchido o tutorial funciona normalmente com a voz do aparelho como fallback.

---

## Editar dados do studio
No início de `assets/js/main.js`, no bloco `CONFIG`:
- `whatsapp` — número com DDI e DDD, só dígitos (atual: 5514991096648)
- `endereco` e `horario` — aparecem na seção de contato
- `horariosSemana`, `horariosSabado`, `horariosDomingo` — horários do calendário
- `diasFechados` — ex.: `[0]` fecha o domingo
- `mesesAFrente` — até quantos meses o cliente pode escolher

Os serviços ficam na lista `SERVICOS`, logo abaixo.
# rr-automativa
