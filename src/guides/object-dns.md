---
title: Guides - Object DNS
category: Guides
tags: ["guides", "http", "server"]
---

# Object DNS <Badge type="info" text="work in progress" />

Will be adding a guide for storing object [HTTP-in](https://wiki.secondlife.com/wiki/LSL_HTTP_server) URLs, for multiple languages here.

::: details What do you mean by DNS?

When you use [`ll.RequestURL`](https://wiki.secondlife.com/wiki/LlRequestURL) your object gets a random URL, which becomes invalid when either:

- The region it's in restarts
- The object it's attached to changes region
- The avatar (if attached) relogs

This means you need to somehow keep track of what the latest valid URL is, hence [DNS](https://en.wikipedia.org/wiki/Domain_Name_System).

:::
