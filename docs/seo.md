### **1. URL no projeto**

Na Vercel, em **Settings → Environment Variables**, deixe:

- NEXT_PUBLIC_SITE_URL = [https://leituranova.com.br](https://leituranova.com.br)

(faça um redeploy depois de alterar, se precisar.)

---

### **2. Google Search Console**

- Acesse: Google Search Console.

- **Adicionar propriedade** → URL do prefixo: [https://leituranova.com.br](https://leituranova.com.br).

- **Verificar** por método HTML (meta tag) ou por arquivo. O Next já expõe o que for necessário; use o que o Google oferecer.

- Depois de verificado: **Sitemaps** → adicionar: [https://leituranova.com.br/sitemap.xml](https://leituranova.com.br/sitemap.xml) → Enviar.

- Em **Inspeção de URL**, teste a home e páginas importantes para pedir indexação.

---

### **3. Bing Webmaster Tools**

- Acesse: Bing Webmaster Tools.

- Adicione o site [https://leituranova.com.br](https://leituranova.com.br), verifique o domínio.

- Envie o mesmo sitemap: [https://leituranova.com.br/sitemap.xml](https://leituranova.com.br/sitemap.xml).

---

### **4. Conferir no próprio site**

- Sitemap: abra no navegador [https://leituranova.com.br/sitemap.xml](https://leituranova.com.br/sitemap.xml) (deve listar as URLs).

- Robots: [https://leituranova.com.br/robots.txt](https://leituranova.com.br/robots.txt) (deve permitir e apontar para o sitemap).

---

### **5. Google Business (opcional, mas bom para negócio local)**

- Se tiver endereço físico (ex.: Av. Esperança, Guarulhos): crie/reivindique o perfil em Google Business com o mesmo endereço, telefone e site. Ajuda em buscas locais e no resultado com mapa.

---

### **6. Links e conteúdo**

- Compartilhe o site em redes (Instagram/Facebook da Leitura Nova).

- Use o link [https://leituranova.com.br](https://leituranova.com.br) em assinaturas de e-mail e materiais.

- Mantenha o conteúdo atual (títulos, descrições, JSON-LD) como está; o que configuramos no código já está adequado para SEO.
- 

Resumo: **verificar a URL na Vercel → Google Search Console (verificar + enviar sitemap) → Bing (verificar + sitemap) → conferir sitemap/robots no navegador → Google Business se fizer sentido.** Isso cobre o essencial de SEO técnico e descoberta pelos buscadores.