<!-- ---
layout: light_dark
title: Research
permalink: /research
weight: 2
width: thin
light_theme: rain
dark_theme: firefly
--- -->

## This is the page for Research
---
meow meow meow


<br>
#### Projects 1
---
bla bla bla


<br>
#### Projects 2
---
bla bla bla 2


<br>
#### Publications
---

{% for paper in site.data.papers %}
1. **{{ paper.title }}** <br>
{{ paper.authors }} <br>
{{ paper.journal }} ({{ paper.year }}) [DOI]({{ paper.doi }}) | [PDF]({{ paper.pdf }})

{% endfor %}