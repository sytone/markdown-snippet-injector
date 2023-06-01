# XML snippet
<snippet id='xml-snippet' options=''/>

This one has some hidden parts:
<snippet id='xml-snippet-with-hidden-section' options=''/>

# JS/TS snippet:
<snippet id='ts-snippet' options=''/>

This one has some hidden parts:
<snippet id='ts-snippet-with-hidden-section' options=''/>

This one should be native Markdown:
---
<snippet id='ts-snippet-from-comment-as-markdown' options='nocodeblock'/>
---

This one should be native Markdown and already processed:
---
<snippet id='ts-snippet-from-comment-as-markdownprocessed' options='nocodeblock'>
Inline comments in markdown can be inserted as a raw entry.

## Why?

- Because...
- Helpful!
</snippet>
---

# CSS snippet:
<snippet id='css-snippet' options=''/>
<snippet id='cssSnippet' options=''/>

This one has some hidden parts:
<snippet id='css-snippet-with-hidden-section' options=''/>

This one is already processed snippet
<snippet id='css-already-processed' options='noop'>
```
.btn {
    color: green;
    background-color: blue;
}
```
</snippet>
