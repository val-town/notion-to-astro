# notion-to-astro

So you've written your documentation in [Notion](https://www.notion.so/)
but want to switch
to [Astro Starlight](https://starlight.astro.build/) to publish it.
So have we! This is the script we used to convert from one to the other.
Here's what it does:

| Notion                        | Astro Starlight              |
| ----------------------------- | ---------------------------- |
| File names include UUIDs      | Clean file names             |
| Title is the first h1 heading | Title is in YAML frontmatter |
| Embeds are self-links         | Embeds are HTML              |

## One-pass

This is intended to be run once in order to start a conversion,
and then you'd do some manual tweaking. It isn't a solution to
maintain content in Notion while publishing with Starlight:
that would require something a lot more complicated.
