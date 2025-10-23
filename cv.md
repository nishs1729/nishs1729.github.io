---
layout: light_dark
permalink: /cv
title: CV
weight: 6
width: thick
light_theme: rain
dark_theme: stars
---
<br><br>
Post-doctoral Fellow <br>
Computational Neurobiology Lab <br>
Indian Institute of Science Education and Research, Pune
{% capture education_content %}
#### PhD in Computational Neuroscience
2015 – 2022 | Indian Institute of Science Education and Research, Pune, India

#### BS-MS in Physics
2009 – 2014 | Indian Institute of Technology, Kharagpur, India
{% endcapture %}
{% include cv_section.html title="EDUCATION" content=education_content %}


{% capture research_experience_content %}
##### Role of STP at DG-CA3 Synapses in Phase Precession, Pattern Separation, and Place Cell Remapping

| 2022 – 2025 | Advisor: Prof. Suhita Nadkarni |

We used a detailed network model of DG-CA3 synapses to assess their role in signal processing. We show that the sparse firing of DG granule cells, drastic short-term plasticity, their network topology, and local inhibition provide a plausible mechanism for phase precession, pattern separation, and place cell remapping.


##### Implications of Synaptic Design on Hippocampal Neuronal Function

| 2015 – 2022 | PhD Project | Advisor: Prof. Suhita Nadkarni |

Using physiologically realistic spatial models of CA3-CA1 and mossy fiber synapses, we studied how synaptic design (biochemical and structural) orchestrates short-term plasticity. We show that the dynamics of internal calcium stores modulate STP in CA3-CA1. In mossy fibers, calcium buffers and crosstalk among calcium domains enable a fast and large STP.


##### Critical Bursting in Rayleigh–Bénard Convection

| 2013 – 2014 | Master's Project | Advisor: Prof. Krishna Kumar |

Modeling a low-dimensional dynamical system of Rayleigh–Bénard Convection for poor conducting boundaries with rigid surfaces (no-slip boundary condition) at the onset of convection. In addition, I studied the statistics of critical bursting in such convection.

{% endcapture %}
{% include cv_section.html title="RESEARCH EXPERIENCE" content=research_experience_content %}


{% capture publications_content %}
{% for paper in site.data.papers %}
  1. **{{ paper.title }}** \
  {{ paper.authors }} \
  {{ paper.journal }} ({{ paper.year }}) [DOI]({{ paper.doi }}) | [PDF]({{ paper.pdf }})
{% endfor %}
{% endcapture %}
{% include cv_section.html title="PUBLICATIONS" content=publications_content %}


{% capture schools_workshops_content %}
- Participated in the 18-day [**OIST Computational Neuroscience Course**](https://groups.oist.jp/ocnc), a project-oriented course designed to teach computational neuroscience. [June 2023]

- Participated in the 16-day [**Computational Approach to Memory and Plasticity (CAMP)**](https://camp.ncbs.res.in/camp2018), a workshop organized by Prof. Upinder Bhalla, Prof. Rishikesh Narayanan, and Prof. Arvind Kumar at NCBS, Bengaluru. [July 2018]

- Participated in a workshop on image classification, segmentation, and neural network deployment using TensorRT conducted by **Deep Learning Institute, NVIDIA.** [14 Dec 2017]

- Attended a three-week [**5th SERC School on Nonlinear Dynamics**](http://www.serb.gov.in/pdfs/what-new/SERC%20School%20on%20Nonlinear%20Dynamics.pdf), PSG College of Technology, Coimbatore. [Dec 2016]

- Participated in a two-week [**8th SERB School on Neuroscience**](https://www.iiserpune.ac.in/events/536/serb-school-in-neuroscience), IISER Pune. [Dec 2014]
{% endcapture %}
{% include cv_section.html title="SCHOOLS AND WORKSHOPS" content=schools_workshops_content %}


{% capture conferences_content %}
- **Dec 2024:** Presented a talk on "Synaptic design determines signaling at hippocampal mossy fiber synapse" at the NGN Neuroscience Conference at IISER Thiruvananthapuram.

- **Feb 2023:** Presented a talk on "**Implications of Synaptic Design on Neuronal Function**" at the NGN Neuroscience Conference at IISER Pune.

- **2022, 2020, and 2017:** Organized and participated in the NGN Neuroscience Conference at IISER Pune. It is a 3-day conference focusing on early-career researchers.

- **Nov 2021:** Presented a poster on **"Form follows function: Synaptic design to account for short-term plasticity at mossy fiber boutons"** at Neuroscience 21, organized by the Society for Neuroscience, San Diego, USA.

- **Nov 2016:** Presented a poster on “**Modified synaptic transmission and short-term plasticity in Alzheimer’s disease**” at Neuroscience 18, organized by the Society for Neuroscience, San Diego.

- **Dec 2011:** Attended the **International Conference on Theoretical and Applied Physics (ICTAP)** at IIT Kharagpur.
{% endcapture %}
{% include cv_section.html title="CONFERENCES" content=conferences_content %}


{% capture teaching_experience_content %}
- Teaching assistant covering topics on dynamical systems, simulation using Brian2, Python, and MCell for [**Computational Approach to Memory and Plasticity (CAMP)**](https://campiiser.com/) in 2019, 2023, 2024 and 2025, a 16-day workshop on Computational Neuroscience organized by Prof. Collins Assisi and Prof. Suhita Nadkarni at IISER Pune.

- **Teaching assistant** for UG courses **(Neuroscience-I, Mathematical and Computational Biology, Introduction to Programming - Python, and Ecology and Evolution)** during my PhD at IISER Pune.

- Taught **hands-on simulation using MCell** at the Tata Institute for Fundamental Research, Mumbai, as a teaching assistant for Prof. Suhita Nadkarni.

- Teaching assistant for Prof. Suhita Nadkarni (4th year UG course - **Computational Biology**) for invited lectures on Computational Neuroscience at IISER Mohali.

- Teaching assistant for Prof. Argha Banerjee for **Matlab** at the two-week SERB school on [**Modeling Mountain Glacier Dynamics**](https://www.iiserpune.ac.in/events/176/course-on-modelling-mountain-glacier-dynamics) at IISER Pune [Oct 2015].
{% endcapture %}
{% include cv_section.html title="TEACHING EXPERIENCES" content=teaching_experience_content %}


{% capture skills_content %}
#### Domain Knowledge
- Mathematical modelling, Nonlinear dynamics, Neuroscience, Probability and statistics, Reaction network, Spiking neuron model, Monte Carlo 3D simulation, Reaction-diffusion systems

#### Programming
- Python (numpy, scipy, pandas, matplotlib), Matlab, Julia, C/C++, Bash

#### Modelling Tools
- MCell, Brian2, neuron, STEPS
{% endcapture %}
{% include cv_section.html title="SKILLS" content=skills_content %}


{% capture awards_content %}
- **EMBO travel grant** for attending Dendrites 2022: Dendritic anatomy, molecules and function in Heraklion, Greece. \| May 2022  

- **Infosys Foundation Scholarship** for attending Neuroscience 16, organized by the Society for Neuroscience, San Diego. \| Nov 2016  

- **DST-INSPIRE Fellowship** for PhD. \| 2015 – 2020  

- **DST-INSPIRE Scholarship** for Integrated MSc. \| 2009 – 2014  
{% endcapture %}
{% include cv_section.html title="AWARDS" content=awards_content %}


{% capture volunteering_content %}
- Lecture demonstrating simulations in Computational Neuroscience for high-school students in the BIS Brain Camp at Sophia College, Mumbai. \| Sept – 2018 

- Volunteered for Exciting Science Group, an NCL-IISER Pune initiative to **promote scientific methodology in school children**. We conducted science workshops for 8th-grade students in Vasantdada Patil School, Pune, every Saturday for 8 months. \| 2016 – 2017

- Volunteered for the Gyan-Setu organization to **promote science in rural schools** of Sikkim by demonstrating scientific principles using commonly available objects. \| June 2016

- Mentor, Student Mentorship Program, IIT Kharagpur. \| 2013 – 2014
{% endcapture %}
{% include cv_section.html title="VOLUNTEERING" content=volunteering_content %}
