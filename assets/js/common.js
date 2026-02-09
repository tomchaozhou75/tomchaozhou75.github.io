document.addEventListener("DOMContentLoaded", () => {
  const toggleSpecs = [
    { trigger: "a.abstract", target: ".abstract.hidden" },
    { trigger: "a.award", target: ".award.hidden" },
    { trigger: "a.bibtex", target: ".bibtex.hidden" },
  ];

  const resolveToggleScope = (link) => {
    const linksContainer = link.closest(".links");
    if (linksContainer && linksContainer.parentElement) {
      return linksContainer.parentElement;
    }

    return link.closest("li, .card-body, article, .post, .row") || link.parentElement;
  };

  const closePanels = (scope, exceptPanel) => {
    scope.querySelectorAll(".abstract.hidden.open, .award.hidden.open, .bibtex.hidden.open").forEach((panel) => {
      if (panel !== exceptPanel) {
        panel.classList.remove("open");
      }
    });
  };

  toggleSpecs.forEach((spec) => {
    document.querySelectorAll(spec.trigger).forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const scope = resolveToggleScope(link);
        if (!scope) {
          return;
        }

        const panel = scope.querySelector(spec.target);
        if (panel) {
          closePanels(scope, panel);
          panel.classList.toggle("open");
        }
      });
    });
  });

  document.querySelectorAll("a.waves-effect, a.waves-light").forEach((anchor) => {
    anchor.classList.remove("waves-effect", "waves-light");
  });

  const tocSidebar = document.querySelector("#toc-sidebar");
  const buildSidebarToc = (tocRoot) => {
    const contentRoot = document.querySelector("main") || document.body;
    const headings = Array.from(contentRoot.querySelectorAll("h2, h3")).filter((heading) => {
      return !heading.hasAttribute("data-toc-skip");
    });

    if (!headings.length) {
      return;
    }

    const list = document.createElement("ul");
    list.className = "nav";

    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      if (heading.tagName.toLowerCase() === "h3") {
        link.classList.add("ml-4");
      }

      item.appendChild(link);
      list.appendChild(item);
    });

    tocRoot.replaceChildren(list);
  };

  if (tocSidebar) {
    document.querySelectorAll(".publications h2").forEach((heading) => {
      heading.setAttribute("data-toc-skip", "");
    });

    if (window.Toc && typeof window.Toc.init === "function") {
      window.Toc.init(tocSidebar);
    } else {
      buildSidebarToc(tocSidebar);
    }
  }

  const prefersTheme = () => {
    if (typeof window.determineComputedTheme === "function") {
      return window.determineComputedTheme();
    }
    return document.documentElement.dataset.theme || "light";
  };

  const jupyterTheme = prefersTheme();
  document.querySelectorAll(".jupyter-notebook-iframe-container iframe").forEach((iframe) => {
    const applyNotebookStyling = () => {
      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        return;
      }

      if (!iframeDocument.querySelector('link[data-al-folio-jupyter="true"]')) {
        const cssLink = iframeDocument.createElement("link");
        cssLink.href = "../css/jupyter.css";
        cssLink.rel = "stylesheet";
        cssLink.type = "text/css";
        cssLink.setAttribute("data-al-folio-jupyter", "true");
        iframeDocument.head.appendChild(cssLink);
      }

      if (jupyterTheme === "dark") {
        iframeDocument.body?.setAttribute("data-jp-theme-light", "false");
        iframeDocument.body?.setAttribute("data-jp-theme-name", "JupyterLab Dark");
      }
    };

    if (iframe.contentDocument?.readyState === "complete") {
      applyNotebookStyling();
    }
    iframe.addEventListener("load", applyNotebookStyling);
  });

  if (window.AlFolioUi && typeof window.AlFolioUi.initPopovers === "function") {
    window.AlFolioUi.initPopovers(document);
  }
});
