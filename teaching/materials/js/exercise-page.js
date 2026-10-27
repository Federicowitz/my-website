(function () {
  const config = window.exercisePageConfig;

  if (!config) {
    return;
  }

  const rulesList = document.getElementById("rulesList");
  const exerciseList = document.getElementById("exerciseList");
  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  const resetButton = document.getElementById("resetButton");
  const markAllButton = document.getElementById("markAllButton");

  const normalizeExercise = (exercise) => {
    if (!Array.isArray(exercise)) {
      return exercise;
    }

    return {
      title: exercise[0],
      level: exercise[1],
      text: exercise[2],
      requirements: exercise[3] || [],
      hints: exercise[4] || [],
      code: exercise[5]
    };
  };

  const exercises = config.exercises.map(normalizeExercise);

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.innerText = text;
    }
    return element;
  };

  const appendListItems = (parent, items) => {
    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerText = item;
      parent.appendChild(li);
    });
  };

  const loadProgress = () => {
    const saved = localStorage.getItem(config.storageKey);
    if (!saved) {
      return {};
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      return {};
    }
  };

  const saveProgress = (progress) => {
    localStorage.setItem(config.storageKey, JSON.stringify(progress));
  };

  let progress = loadProgress();

  const updateProgressText = () => {
    const completed = exercises.filter((exercise, index) => progress[index] === true).length;
    const percentage = exercises.length === 0 ? 0 : Math.round((completed / exercises.length) * 100);
    progressText.innerText = `Esercizi completati: ${completed} / ${exercises.length}`;
    progressFill.style.width = `${percentage}%`;
  };

  const renderRules = () => {
    rulesList.innerHTML = "";
    appendListItems(rulesList, config.rules);
  };

  const renderExercises = () => {
    exerciseList.innerHTML = "";

    exercises.forEach((exercise, index) => {
      const article = createElement("article", "exercise");
      article.id = `exercise-${index}`;
      if (progress[index] === true) {
        article.classList.add("done");
      }

      const header = createElement("div", "exercise-header");
      const titleGroup = document.createElement("div");

      const level = createElement("span", "level", exercise.level);
      const title = createElement("h2", "", exercise.title);
      titleGroup.appendChild(level);
      titleGroup.appendChild(title);

      const label = createElement("label", "check-label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = progress[index] === true;
      checkbox.dataset.index = index;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode("Fatto"));

      header.appendChild(titleGroup);
      header.appendChild(label);
      article.appendChild(header);
      article.appendChild(createElement("p", "", exercise.text));

      if (exercise.code) {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerText = exercise.code;
        pre.appendChild(code);
        article.appendChild(pre);
      }

      const requirementsTitle = createElement("h3", "", "Richieste");
      const requirementsList = document.createElement("ul");
      appendListItems(requirementsList, exercise.requirements);

      const hintsTitle = createElement("h3", "", "Suggerimenti");
      const hintsList = document.createElement("ul");
      appendListItems(hintsList, exercise.hints);

      article.appendChild(requirementsTitle);
      article.appendChild(requirementsList);
      article.appendChild(hintsTitle);
      article.appendChild(hintsList);

      exerciseList.appendChild(article);
    });

    const checkboxes = document.querySelectorAll("input[type='checkbox'][data-index]");
    checkboxes.forEach((checkbox) => {
      checkbox.onchange = () => {
        const index = checkbox.dataset.index;
        progress[index] = checkbox.checked;
        saveProgress(progress);
        renderExercises();
        updateProgressText();
      };
    });
  };

  resetButton.onclick = () => {
    const confirmed = confirm("Vuoi cancellare il completamento di tutti gli esercizi?");
    if (!confirmed) {
      return;
    }

    progress = {};
    saveProgress(progress);
    renderExercises();
    updateProgressText();
  };

  markAllButton.onclick = () => {
    exercises.forEach((exercise, index) => {
      progress[index] = true;
    });
    saveProgress(progress);
    renderExercises();
    updateProgressText();
  };

  renderRules();
  renderExercises();
  updateProgressText();
})();
