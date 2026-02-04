# Erro: remote rejected (cannot lock ref)

## Mensagem

```
! [remote rejected] main -> main (cannot lock ref 'refs/heads/main': is at de0a4f8... but expected e8604f1...)
error: failed to push some refs to 'https://github.com/...'
```

## Causa

O remoto (`origin/main`) já está em um commit mais novo do que o que seu Git local esperava. Isso acontece quando alguém (ou você em outro lugar) já fez push antes, ou quando o ref do servidor foi atualizado.

## Correção

### 1. Atualizar referências e trazer as mudanças do remoto

```bash
git fetch origin
git pull origin main
```

- Se der **fast-forward**: não há conflitos; vá para o passo 2.
- Se pedir **merge** e houver conflitos: abra os arquivos listados, resolva (veja abaixo) e depois:
  ```bash
  git add .
  git commit -m "Merge origin/main"
  ```

### 2. Enviar de novo

```bash
git push origin main
```

## Resolvendo conflitos de merge

Se o `git pull` mostrar conflitos:

1. Abra cada arquivo em conflito (o Git marca com `<<<<<<<`, `=======`, `>>>>>>>`).
2. Escolha a versão que faz mais sentido para o site:
   - Manter **suas** alterações locais: fique com o bloco entre `<<<<<<<` e `=======`.
   - Manter a **versão do remoto**: fique com o bloco entre `=======` e `>>>>>>>`.
   - **Combinar** as duas: edite o arquivo deixando um único trecho correto e apague os marcadores de conflito.
3. Salve o arquivo, `git add <arquivo>` e finalize o merge com `git commit` (como acima).

Depois disso, o `git push origin main` deve funcionar.
