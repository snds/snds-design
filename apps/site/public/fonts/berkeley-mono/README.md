# Berkeley Mono (licensed)

Place your **licensed** Berkeley Mono `.woff2` files in this folder.

Expected filenames (rename your downloads to match):

```
BerkeleyMono-Regular.woff2    → weight 400
BerkeleyMono-Bold.woff2       → weight 700
```

If your license came as a **variable** font instead, drop:

```
BerkeleyMonoVariable.woff2
```

…and switch the commented block in `apps/site/src/styles/fonts.css.ts`.

Until they exist, the site falls back to a system monospace so it still renders.

> **Public repo?** Don't commit licensed fonts to a public repo — it
> redistributes them. Either keep the repo private, git-ignore this
> folder and inject the files in CI, or host the woff2 on your private
> host and point `fonts.css.ts` at that URL. (Decide at deploy time.)

> Tip: if you only have `.otf`/`.ttf`, convert to `woff2` (e.g. `npx
> fonttools ttLib.woff2 compress Font.ttf`, or fontsquirrel/woff2 tooling).
> woff2 is ~40% smaller and the right format for the web.
