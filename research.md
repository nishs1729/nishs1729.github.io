---
layout: light_dark
title: Research
permalink: /research
weight: 2
width: thin
light_theme: rain
dark_theme: firefly
---

#### **DG–CA3 Network Dynamics**
---

| Ongoing |

The dentate gyrus (DG) to CA3 pathway is a computational gateway in the hippocampus, transforming sparse granule cell inputs into the rich, decorrelated patterns that CA3 uses for episodic memory. Mossy fiber (MF) synapses here are special—their **strong short-term facilitation** teams up with feedforward inhibition to dynamically shape neural coding.

I built a **biophysical network model** using Brian2 with three key components:
- **MF bouton (MFB)**: A phenomenological model capturing STP dynamics from detailed synaptic simulations
- **HH-type CA3 pyramidal neurons**: For realistic spiking behavior
- **Fast-spiking interneurons**: Delivering GABA-mediated inhibition

**Key Discoveries:**

1. **Phase Precession**: STP progressively shifts CA3 firing phases across theta cycles, generating this hallmark rhythm.

2. **Pattern Separation**: Without STP, CA3 outputs remain correlated; with it, "synaptic detonation" (facilitated MF input overpowering inhibition) creates sharply decorrelated temporal and spatial patterns.

3. **Flexible Remapping**: Variability in DG–CA3 synaptic strength triggers place cell remapping in response to environmental changes.

_Key Finding:_ STP at DG–CA3 synapses isn't just a modulator—it's the **core engine** driving phase coding, pattern separation, and adaptive spatial representations in hippocampal memory circuits.


<br>
#### Mossy Fiber Boutons: Unraveling Multi-Zone Synaptic Coordination
---
The **mossy fiber (MF) boutons** of the hippocampus are remarkable synapses. These are large, complex terminals that connect **granule cells in dentate gyrus** to **CA3 pyramidal neurons**. They exhibit powerful forms of **short-term plasticity**, enabling them to act as both **conditionl detonators** and **pattern separators** in the hippocampal network.

In this project, I used a **multi-scale modeling approach** that bridged molecular and network levels of analysis:

* **MCell** captured detailed **calcium dynamics**,
* **STEPS** modeled the **vesicle release machinery**, and
* **Brian2** simulated DG-CA3 network activity.

This integrated framework revealed that, contrary to the long-standing assumption that each active zone (AZ) within a mossy fiber bouton operates independently, there is **significant calcium cross-talk** between active zones. This interaction, mediated by local **buffer saturation** and **residual calcium**, enables the bouton to **dynamically switch** to coupled modes of activity during bursts of stimulation.

The study provides a **quantitative and mechanistic picture** of how the mossy fiber bouton’s intricate structure and biochemistry generate its unique facilitation profile, and how this synaptic logic contributes to the **computational power of the hippocampal network**.

_Key Finding:_ Mossy fiber boutons’s multiple active zones aren't independent actors. Calcium cross-talk between AZs, combined with synaptotagmin-7's unique calcium sensitivity and local buffer saturation, drives the synapse's characteristic facilitation.


<br>
#### Role of endoplasmic reticulum in short-term plasticity in hippocampal neurons
---
In this project, I built a detailed **3D computational model of the CA3–CA1 hippocampal synapse** to uncover the molecular mechanisms underlying **short-term plasticity (STP)** — the rapid, transient changes in synaptic strength that shape learning and memory. Using MCell, a Monte Carlo simulation platform for cellular microphysiology, the model incorporated key molecular components such as ion channels, calcium buffers, and neurotransmitter receptors, allowing realistic simulation of molecular diffusion and reaction dynamics within the synapse.

A central question was the role of the **endoplasmic reticulum (ER)** — the cell’s internal calcium store — in regulating synaptic calcium dynamics and STP. The simulations revealed that SERCA pumps, which transport calcium into the ER, play a crucial buffering role in maintaining low neurotransmitter release probability and normal STP. Disruption of this calcium handling, as observed in **rodent models of Alzheimer’s disease**, led to excessive ER calcium accumulation and impaired STP.

These findings point to a potential molecular mechanism for the synaptic dysfunction seen in Alzheimer’s and highlight how delicate calcium homeostasis is to the proper function of hippocampal circuits.

_Key Finding:_ ER is essential for STP in CA3-CA1 synapses and its calcium dysregulation offers a mechanistic link between Alzheimer's pathology and memory impairment.

<br>
#### Publications
---

{% for paper in site.data.papers %}
1. **{{ paper.title }}** <br>
{{ paper.authors }} <br>
{{ paper.journal }} ({{ paper.year }}) [DOI]({{ paper.doi }}) | [PDF]({{ paper.pdf }})

{% endfor %}