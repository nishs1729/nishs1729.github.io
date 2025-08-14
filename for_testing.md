---
layout: moths
# title: Testing
# weight: 99
permalink: /testing
width: thin
light_theme: moths
dark_theme: firefly
---

### Outreach activity 1
---
{% include carousel.html carousel_data=site.data.test_carousel1 id="c1" %}

Description
<br>

### Outreach activity 2
---
{% include carousel_plain.html carousel_data=site.data.test_carousel2 id="c2" %}

Description

# Comprehensive Markdown and Visual Elements Test Page

This page is designed to test the rendering of various text and visual elements within the Jekyll theme.

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Text Formatting

This is a standard paragraph.
This text contains **bold text**, *italic text*, ***bold and italic text***, and ~~strikethrough text~~.
You can also use `inline code` for short snippets.

Here's a paragraph with a footnote[^1].

[^1]: This is the content of the footnote.

---

## Blockquotes

> This is a simple blockquote.
> It can span multiple lines.

> This is a blockquote with multiple paragraphs.
>
> This is the second paragraph within the blockquote. It demonstrates how multiple paragraphs are handled.

---

## Lists

### Unordered Lists

*   Item 1
    *   Nested Item 1.1
        *   Deeply Nested Item 1.1.1
    *   Nested Item 1.2
*   Item 2
*   Item 3

### Ordered Lists

1.  First item
2.  Second item
    1.  Nested ordered item 2.1
    2.  Nested ordered item 2.2
3.  Third item

### Task Lists

- [x] Completed task
- [ ] Pending task
- [x] Another completed task
    - [ ] Sub-task

---

## Code Blocks

### Inline Code

Here's some `inline code` for a variable name or a function call.

### Fenced Code Blocks (with syntax highlighting)

```python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
```

```javascript
// JavaScript example
function greet(name) {
    console.log(`Hello, ${name}!`);
}
greet("World");
```

```yaml
# YAML example
database:
  host: localhost
  port: 5432
  user: admin
```

---

## Tables

| Header 1 | Header 2 | Header 3 |
| :------- | :------: | -------: |
| Left     | Center   | Right    |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

---

## Links and Images

### Links

[Visit Google](https://www.google.com "Google's Homepage")
[Link to another page on this site](/about)

### Images

![A placeholder image of a profile picture](/assets/images/profile.png "Profile Picture")

---

## Horizontal Rule

---

## Definition Lists (Kramdown specific)

Term 1
: Definition for Term 1

Term 2
: Definition for Term 2, which can be quite long and span multiple lines.
: Another definition for Term 2.

---

## Emojis

Here are some emojis: 😄👍🚀✨

---

## Raw HTML (if supported by Jekyll's markdown parser)

<p style="color: blue; font-weight: bold;">This is a paragraph styled with inline HTML.</p>

<button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer;">A Simple HTML Button</button>

---

## Alerts/Notes (using blockquotes for styling)

> **Note:** This is an important note or alert. Pay attention to this information.

> **Warning:** This is a warning message. Proceed with caution.

---

This concludes the elaborate test page for various markdown and visual elements.