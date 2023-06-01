// >> ts-snippet
export function sum(a, b){
    return a + b;
}
// << ts-snippet

// >> ts-snippet-with-hidden-section
export function div(a, b){
    // >> (hide)
    console.log("You should not see this!")
    // << (hide)    
    return a / b;
}
// << ts-snippet-with-hidden-section

/*
// >> ts-snippet-from-comment-as-markdown
Inline comments in markdown can be inserted as a raw entry.

## Why?

- Because...
- Helpful!

// << ts-snippet-from-comment-as-markdown
*/


/*
// >> ts-snippet-from-comment-as-markdownprocessed
Inline comments in markdown can be inserted as a raw entry.

## Why?

- Because...
- Helpful!

// << ts-snippet-from-comment-as-markdownprocessed
*/