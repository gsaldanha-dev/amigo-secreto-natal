# Amigo Secreto · Natal 2026

Site estático com três páginas: `/` = cadastro (loja e foto), `/sorteio/` = sorteio (abre terça 17/11/2026 às 8h), `/lojas/` = lista de lojas. Código comum em `comum.js` e `comum.css`. + Supabase (projeto `spelling-bee`, tabelas `amigo_*`).

- Os pares são gerados uma vez no banco, como um ciclo único de 8: ninguém tira a si mesmo e ninguém fica "um tirou o outro".
- Cada pessoa entra com um PIN de 4 dígitos. O navegador só fala com funções `amigo_*`; as tabelas ficam fechadas para visitantes.
- Sorteio aceito de 17/11/2026 08:00 até 24/12/2026 (horário de Brasília); a trava fica no banco, não só no site.

## Resetar o PIN de alguém (SQL editor do Supabase)
```sql
update amigo_participantes set pin_hash = null where nome = 'Leo';
```
Não consulte `amigo_pares`: é lá que está o segredo.
