# deprecated notice
As of learning about skypack.dev via the [updated deno manual](https://deno.land/manual@v1.7.0/typescript/types#deno-friendly-cdns), I strongly discourage anyone from using this remix of the d3 library.

# d3_4_deno
A simple transformation of d3 for use within a deno workflow

[Manage your external dependencies with care.](https://deno.land/manual/examples/manage_dependencies)

The following `tsconfig.json` may come in handy if your running into type errors:

```json
{
  "compilerOptions": {
    "lib": ["DOM", "ESNext"]
  }
}
```

The repo is made by running the `main.ts` script and tested via running:

`deno run -c ./tsconfig.json src/mod.js`

You're welcome to create an issue or PR should the need arise :)
