---
layout: light_dark
title: Publication
permalink: /publication
weight: 3
width: thin
light_theme: rain
dark_theme: firefly
---

#### Publications
---

{% for paper in site.data.papers %}
1. **{{ paper.title }}** <br>
{{ paper.authors }} <br>
{{ paper.journal }} ({{ paper.year }}) [DOI]({{ paper.doi }}){:target="_blank"} | [PDF]({{ paper.pdf }}){:target="_blank"}

{% endfor %}