# Welcome to `markdown-snippet-injector`

A tool for injecting code snippets into Markdown files:

1. Define snippets in your source by using a simple notation
2. Put placeholders associated with the snippets in your MarkDown files
3. Run MarkDown injector to replace the placeholders during your documentation build:

`mdinject --root=<path-to-source-code> --docs-root=<path-to-docs>`

## Options

```pwsh
      --help                          Show help                        [boolean]
      --version                       Show version number              [boolean]
  -r, --root                          Root of snippet sources
                       [string] [default: current working directory plus "/src"]
  -d, --docs-root                     Root of documentation sources
                      [string] [default: current working directory plus "/docs"]
      --snippet-titles                Suffix used for the placeholder command in
                                      the target files.
                                              [default: "JavaScript|TypeScript"]
  -l, --log-level                     Level of detail in logs
     [choices: "none", "error", "warning", "info", "verbose", "debug"] [default:
                                                                         "info"]
      --wrap                          Wrap the snippet around the snippet
                                      content if possible.
                                                       [boolean] [default: true]
  -s, --source-file-extension-filter  File extension filter for source files
                                                            [default: ".js|.ts"]
  -t, --target-file-extension-filter  File extension filter for source files
                                                                [default: ".md"]
      --placeholder-prefix            Prefix used for the placeholder command in
                                      the target files.          [default: "%%"]
      --placeholder-suffix            Suffix used for the placeholder command in
                                      the target files.          [default: "%%"]
```

## Using `markdown-snippet-injector`

### Defining snippets in `JavaScript` and `TypeScript` source files

Defining code snippets in your source files is done by enclosing them with a starting token and ending token prefixed by a line comment.

After the comment the two character `>>` indicate that there is a starting token. Next come the `id` of the snippet, this is wrapped in single quotes like this `id='snippet-name-goes-here'` next are options, if you are not setting any it should be empty like this `options=''`

Full example without an option:

```javascript
  // >> id='snippetinjector-hasSnippet' options=''
```

Full example with an option:

```javascript
  // >> id='snippetinjector-hasSnippet' options='file=snippetinjector/hassnippet.md'
```

The enmding token is simpler, it is the comment followed by two characters `<<` indicating end and then the name of the snippet. the `id` key is not needed for the end.

Full example without an option:

```javascript
  // << snippetinjector-hasSnippet
```

Examples of what it would looks like in code files.

```javascript
// >> id='sum-snippet' options=''
export function sum(a, b){
    return a + b;
}
// << sum-snippet

// >> id='multiplication-snippet' options=''
export function multiply(a, b){
    return a * b;
}
// << multiplication-snippet

// >> id='division-snippet' options='file=math/divide.md'
export function divide(a, b){
    return a / b;
}
// << division-snippet
```

### Defining source snippets in `XML` files

For XML files the same process is followed with the `<!--` and `-->` comment tokens wrapping the starting and ending tags.

```XML
<!-- >> id='list-plants' options='file=math/divide.md' -->
<Plants>
  <Plant id="adj435">
    <Name>Rose</Name>
  </Plant>
  <Plant id="j239fj">
    <Name>Daisy</Name>
  </Plant>
</Plants>
<!-- << list-plants -->
```

### Defining source snippets in `CSS` files

For CSS files the same process is followed with the `/*` and `*/` comment tokens wrapping the starting and ending tags.

Code snippets inside CSS files are defined as follows:

``` CSS
/* >> id='css-snippet' options='file=math/divide.md' */
.btn {
    color: green;
    text-align: center;
}
/* << css-snippet */
```

### Source Snippet Options

You can specify multiple options, use th `&` character to separate them.

#### Destination File

`file=<path and filename>`

You can specify a file in options and when the source files are processed it will create the file and insert the contents. This allows you to make multiple files without having to keep on adding the markdown files with the placeholders in them.

#### Header File and Footer File

`header=<path and filename>`

`footer=<path and filename>`

If specified with the file option it will use the contents of these files to insert before and after the snippet.

## Defining placeholders for the snippets in your `MarkDown` files

Use the `%%snippet id='<your-snippet-id>'  options=''/%%` notation to define the corresponding placeholders in your markdown files. They will be replaced by the snippet injector when run. The starting and ending characters can be specified via command line options.

```MarkDown
    # Using the multiply function:
        %%snippet id='multiplication-snippet'/%%
    # Using the sum function:
        %%snippet id='sum-snippet'/%%
```

If you set `--wrap` flag your snippets will be wrapped around the snippet notation you have been provided. This way when you update your snippet source - the `markdown-snippet-injector` will reflect the changes in your markdown as well.

Example:

`mdinject --wrap --root=<path-to-source-code> --docs-root=<path-to-docs>`

main.css

```css
/* >> id='css-snippet; options='' */
.btn {
    color: green;
    text-align: center;
}
/* << css-snippet */
```

README.MD

```markdown
This is a CSS snippet
%%snippet id='css-snippet'/%%
```

After first build the README.MD will looks like:

````markdown
This is a CSS snippet
%%snippet id='css-snippet'%%
```

.btn {
    color: green;
    text-align: center;
}

```
%%/snippet%%
````

Then when you update `main.css`, your README.MD will be updated as well.

## Advanced features

### Nested snippets

Nested snippets are also supported. This is helpful in scenarios where you want to explain parts of a larger snippet in steps:

```javascript
// >> view-model-snippet
export class ViewModel {

    private _items: ObservableArray<DataItem>;

    constructor() {
        this.initDataItems();
    }

    get dataItems() {
        return this._items;
    }
// >> handling-event-snippet
    public onShouldRefreshOnPull(args: listViewModule.ListViewEventData) {
        var that = new WeakRef(this);
        console.log("Event fired");
        timer.setTimeout(function() {
            for (var i = 0; i < 25; i++) {
                that.get()._items.splice(0, 0, new DataItem(that.get()._items.length, "Item " + that.get()._items.length, "This is item description."));

            }
            var listView = args.object;
            listView.notifyPullToRefreshFinished();
        }, 1000);

    }    
// << handling-event-snippet

    private initDataItems() {
        this._items = new ObservableArray<DataItem>();

        for (var i = 0; i < 25; i++) {
            this._items.push(new DataItem(i, "Item " + i, "This is item description."));
        }
    }
}

export class DataItem {
    public id: number;
    public itemName;
    public itemDescription;

    constructor(id: number, name: string, description: string) {
        this.id = id;
        this.itemName = name;
        this.itemDescription = description;
    }
}
// << view-model-snippet
```

This will produce two code snippets: one containing the whole view-model class and the other containing the `onShouldRefreshOnPull` function.

### Hiding Blocks

You can mark parts of the original code to be hidden - not shown in the documentation:

``` TS
// >> ts-snippet-with-hidden-section
export function div(a, b){
    // >> (hide)
    console.log("You should not see this!")
    // << (hide)    
    return a / b;
}
// << ts-snippet-with-hidden-section
```

The syntax is similar in `XML` and `CSS`.

### Defining file extension filters

You can choose what kind of files will be processed during snippet injection by using the `-s, --source-file-extension-filter` and `-t, --target-file-extension-filter` parameters. The default values of these properties are `.ts` and `.md` respectively.

### Multiple source and target extension types

You can define multiple source or target extension types by setting the corresponding parameters to a set of extensions separated by a `|`:

```pwsh
mdinject --root=. --docs-root=../ --source-file-extension-filter=".ts|.js" --target-file-extension-filter=".md|.txt"
```

In this way all target files will be processed and the corresponding snippet placeholders will be replaced.

### Defining a title for the injected snippet

When injected, a snippet is formatted using the default MarkDown code-snippet format. You can append a title to the injected snippet by using the `--snippettitles` parameter. By default, `.js` and `.ts` files are recognized and the snippets coming from them are titled `JavaScript` or `TypeScript`. You can define custom snippet titles by setting the `--snippettitles` parameter to a set of titles separated by a `|`:

```pwsh
mdinject --root=. --docs-root=../ --source-file-extension-filter=".java|.cs" --target-file-extension-filter=".md|.txt" --snippet-titles="Java|C#"
```

> Note that the order of the snippet titles must be the related to the order of the source extension types so that they match.

## Run e2e tests

1. Clone repo
2. npm install
3. npm test

E2E tests are developed with [Mocha](https://mochajs.org).

## Release Process

Update version in package.json

Update changelog
`npx git-cliff@latest --init`

npm run build
npm publish
