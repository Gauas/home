import { useLayoutEffect } from "react";
import { animate } from "animejs/animation";
import { onScroll } from "animejs/events";
import { createScope } from "animejs/scope";
import { createTimeline } from "animejs/timeline";
import { splitText } from "animejs/text";
import { stagger } from "animejs/utils";
import { WORLD_STATE_META } from "../world/WorldStateMeta";
import { MOTION, MOTION_MEDIA } from "./constants";

function stateForProgress(progress) {
  let state = WORLD_STATE_META[0];
  for (const candidate of WORLD_STATE_META) {
    if (progress >= candidate.at - 0.035) state = candidate;
  }
  return state;
}

export function useWorldMotion(rootRef, world, ready) {
  useLayoutEffect(() => {
    if (!rootRef.current || !world || !ready) return undefined;
    const scope = createScope({
      root: rootRef,
      mediaQueries: MOTION_MEDIA,
    }).add((self) => {
      const root = rootRef.current;
      const reduced = Boolean(self.matches.reduceMotion);
      const splitters = [];
      const titleAnimations = [];

      const introTimeline = createTimeline({ defaults: { ease: MOTION.EASE_OUT } })
        .add(world.params, {
          intro: [0, 1],
          duration: reduced ? 1 : 1450,
          ease: MOTION.EASE_IN_OUT,
        }, 0)
        .add(".intro__logo", {
          opacity: [0, 1],
          scale: [0.82, 1],
          filter: ["blur(12px)", "blur(0px)"],
          duration: reduced ? 1 : 980,
        }, reduced ? 0 : 280)
        .add(".intro__meta > *", {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: reduced ? 1 : 520,
          delay: reduced ? 0 : stagger(70),
        }, reduced ? 0 : 900)
        .add(".world-state, .world-nav__links", {
          opacity: [0, 1],
          translateY: [-8, 0],
          duration: reduced ? 1 : 480,
          delay: reduced ? 0 : stagger(55),
        }, reduced ? 0 : 720);

      root.querySelectorAll(".scene__title").forEach((title) => {
        const split = splitText(title, {
          lines: { wrap: "clip", class: "world-line" },
          words: { wrap: "clip", class: "world-word" },
          accessible: true,
        });
        splitters.push(split);
        titleAnimations.push(animate(split.words, {
          opacity: [0, 1],
          translateY: ["105%", "0%"],
          rotate: [1.8, 0],
          duration: reduced ? 1 : 760,
          delay: reduced ? 0 : stagger(58),
          ease: MOTION.EASE_OUT,
          autoplay: onScroll({ target: title.closest(".world-scene"), enter: "top 72%", repeat: false }),
        }));
      });

      const progressLine = root.querySelector(".world-progress__fill");
      const currentNumber = root.querySelector(".world-state__number");
      const currentName = root.querySelector(".world-state__name");
      const headerLogo = root.querySelector(".world-nav__logo");
      const routeLinks = [...root.querySelectorAll("[data-route-state]")];
      const processItems = [...root.querySelectorAll("[data-process-step]")];
      const projectCurrent = root.querySelector(".project-counter > span");
      const projectProgress = root.querySelector(".project-counter > i");
      const scrub = { value: 0 };
      let lastState = -1;
      let lastProject = -1;
      let lastProcess = -1;
      const scrollAnimation = animate(scrub, {
        value: [0, 1],
        ease: "linear",
        autoplay: onScroll({
          target: ".world-scroll",
          enter: "top top",
          leave: "bottom bottom",
          sync: reduced ? true : 0.16,
        }),
        onUpdate: () => {
          world.setProgress(scrub.value);
          progressLine?.style.setProperty("transform", `scaleX(${scrub.value})`);
          headerLogo?.classList.toggle("is-visible", scrub.value > 0.145);
          const state = stateForProgress(scrub.value);
          if (state.id !== lastState) {
            if (currentNumber) currentNumber.textContent = String(state.id + 1).padStart(2, "0");
            if (currentName) currentName.textContent = state.name;
            routeLinks.forEach((link) => link.classList.toggle("is-active", Number(link.dataset.routeState) === state.id));
            lastState = state.id;
          }
          const projectScene = Math.max(0, Math.min(2, Math.round(((scrub.value - 0.3) / 0.2) * 2)));
          if (projectScene !== lastProject) {
            if (projectCurrent) projectCurrent.textContent = String(projectScene + 1).padStart(2, "0");
            projectProgress?.style.setProperty("--project-progress", String((projectScene + 1) / 3));
            lastProject = projectScene;
          }
          const processScene = Math.max(0, Math.min(4, Math.round(((scrub.value - 0.69) / 0.21) * 4)));
          if (processScene !== lastProcess) {
            processItems.forEach((item, index) => {
              item.classList.toggle("is-active", index === processScene);
              item.classList.toggle("is-complete", index < processScene);
              const button = item.querySelector("button");
              if (index === processScene) button?.setAttribute("aria-current", "step");
              else button?.removeAttribute("aria-current");
            });
            lastProcess = processScene;
          }
        },
      });

      const copyAnimations = [...root.querySelectorAll(".scene__copy, .scene__index, .destination-list, .engineering-ledger, .process-list, .project-ledger, .project-counter")].map((element) => animate(element, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: reduced ? 1 : 560,
        ease: MOTION.EASE_OUT,
        autoplay: onScroll({ target: element.closest(".world-scene"), enter: "top 62%", repeat: false }),
      }));

      return () => {
        scrollAnimation.revert();
        titleAnimations.forEach((animation) => animation.revert());
        copyAnimations.forEach((animation) => animation.revert());
        splitters.forEach((split) => split.revert());
        introTimeline.revert();
        progressLine?.style.removeProperty("transform");
        projectProgress?.style.removeProperty("--project-progress");
        routeLinks.forEach((link) => link.classList.remove("is-active"));
        headerLogo?.classList.remove("is-visible");
        processItems.forEach((item) => {
          item.classList.remove("is-active", "is-complete");
          item.querySelector("button")?.removeAttribute("aria-current");
        });
      };
    });
    return () => scope.revert();
  }, [ready, rootRef, world]);
}
