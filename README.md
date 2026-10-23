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

## Editar dados do studio
No início de `assets/js/main.js`, no bloco `CONFIG`:
- `whatsapp` — número com DDI e DDD, só dígitos (atual: 5514991096648)
- `endereco` e `horario` — aparecem na seção de contato
- `horariosSemana`, `horariosSabado`, `horariosDomingo` — horários do calendário
- `diasFechados` — ex.: `[0]` fecha o domingo
- `mesesAFrente` — até quantos meses o cliente pode escolher

Os serviços ficam na lista `SERVICOS`, logo abaixo.
# rr-automativa
