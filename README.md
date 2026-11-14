# Amigo Secreto · Natal 2026

Site estático (`index.html` = site completo, `lojas/` = só a lista de lojas) + Supabase (projeto `spelling-bee`, tabelas `amigo_*`).

- Os pares são gerados uma vez no banco, como um ciclo único de 8: ninguém tira a si mesmo e ninguém fica "um tirou o outro".
- Cada pessoa entra com um PIN de 4 dígitos. O navegador só fala com funções `amigo_*`; as tabelas ficam fechadas para visitantes.
- Sorteio aceito até 24/12/2026 (horário de Brasília).

## Resetar o PIN de alguém (SQL editor do Supabase)
```sql
update amigo_participantes set pin_hash = null where nome = 'Leo';
```
Não consulte `amigo_pares`: é lá que está o segredo.
