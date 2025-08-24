document.addEventListener('DOMContentLoaded', function() {
  const tabComponents = document.querySelectorAll('.tabs-component');
  let componentCounter = 0;

  tabComponents.forEach(component => {
    componentCounter++;
    const rawContentDiv = component.querySelector('.tab-raw-content');
    const leftNav = component.querySelector('.tab-section-list');
    const rightContent = component.querySelector('.tab-right-col');

    if (!rawContentDiv || !leftNav || !rightContent) {
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawContentDiv.innerHTML;

    let currentSectionDiv = null;
    let sectionCounter = 0;

    Array.from(tempDiv.children).forEach(element => {
      if (element.tagName === 'H1') {
        sectionCounter++;
        const sectionId = `component-${componentCounter}-section-${sectionCounter}`;

        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = element.textContent;
        link.dataset.target = sectionId;
        listItem.appendChild(link);
        leftNav.appendChild(listItem);

        currentSectionDiv = document.createElement('div');
        currentSectionDiv.id = sectionId;
        currentSectionDiv.classList.add('tab-section');
        rightContent.appendChild(currentSectionDiv);

      } else if (currentSectionDiv) {
        currentSectionDiv.appendChild(element.cloneNode(true));
      }
    });

    leftNav.addEventListener('click', function(event) {
      event.preventDefault();
      const targetLink = event.target.closest('a');
      if (targetLink && !targetLink.classList.contains('active')) {
        const targetId = targetLink.dataset.target;

        const currentActiveSection = rightContent.querySelector('.tab-section.active');
        const currentHeight = currentActiveSection ? currentActiveSection.scrollHeight : 0;
        rightContent.style.height = `${currentHeight}px`;

        const sections = rightContent.querySelectorAll('.tab-section');
        sections.forEach(section => section.classList.remove('active'));

        const links = leftNav.querySelectorAll('a');
        links.forEach(link => link.classList.remove('active'));

        targetLink.classList.add('active');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          targetSection.classList.add('active');
          const targetHeight = targetSection.scrollHeight;
          rightContent.style.height = `${targetHeight}px`;

          setTimeout(() => {
            rightContent.style.height = '';
          }, 500);
        }
      }
    });

    const firstLink = leftNav.querySelector('a');
    if (firstLink) {
      firstLink.classList.add('active');
      const firstSectionId = firstLink.dataset.target;
      const firstSection = document.getElementById(firstSectionId);
      if (firstSection) {
        firstSection.classList.add('active');
        // Set initial height without animation
        rightContent.style.height = `${firstSection.scrollHeight}px`;
        setTimeout(() => {
          rightContent.style.height = '';
        }, 500);
      }
    }
  });
});