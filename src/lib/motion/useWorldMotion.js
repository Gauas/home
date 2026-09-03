import { useLayoutEffect } from "react";
import { animate } from "animejs/animation";
import { onScroll } from "animejs/events";
import { createScope } from "animejs/scope";
import { WORLD_STATE_META } from "../world/WorldStateMeta";
import { MOTION, MOTION_MEDIA } from "./constants";

export function useWorldMotion(rootRef, world, ready) {
  useLayoutEffect(() => {
    if (!rootRef.current || !world || !ready) return undefined;

    const scope = createScope({
      root: rootRef,
      mediaQueries: MOTION_MEDIA,
    }).add((self) => {
      const root = rootRef.current;
      const reduced = Boolean(self.matches.reduceMotion);

      const introAnimation = animate(world.params, {
        intro: [0, 1],
        duration: reduced ? 1 : 1100,
        ease: MOTION.EASE_IN_OUT,
      });

      const routeLinks = [...root.querySelectorAll("[data-route-state]")];
      const processItems = [...root.querySelectorAll("[data-process-step]")];
      const sections = [...root.querySelectorAll(".world-scene")];
      let lastState = -1;
      let lastProcess = -1;
      let scrollFrame = 0;

      const updateFromScroll = () => {
        scrollFrame = 0;
        const scrollRoot = root.querySelector(".world-scroll");
        const maxScroll = Math.max(1, scrollRoot.scrollHeight - window.innerHeight);
        const scrollY = Math.max(0, Math.min(maxScroll, window.scrollY));
        let segment = 0;
        while (segment < sections.length - 1 && scrollY >= sections[segment + 1].offsetTop) segment += 1;
        let worldProgress = WORLD_STATE_META[segment].at;
        if (segment < sections.length - 1) {
          const start = sections[segment].offsetTop;
          const end = sections[segment + 1].offsetTop;
          const local = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
          worldProgress += (WORLD_STATE_META[segment + 1].at - WORLD_STATE_META[segment].at) * local;
        }
        world.setProgress(worldProgress);

        const activationLine = scrollY + Math.min(window.innerHeight * 0.22, 160);
        let activeIndex = 0;
        while (activeIndex < sections.length - 1 && activationLine >= sections[activeIndex + 1].offsetTop) activeIndex += 1;
        const state = WORLD_STATE_META[activeIndex];
        if (state.id !== lastState) {
          routeLinks.forEach((link) => {
            const active = Number(link.dataset.routeState) === state.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
          });
          lastState = state.id;
        }

        const processStart = sections[4].offsetTop;
        const processEnd = sections[5].offsetTop;
        const processLocal = Math.max(0, Math.min(1, (scrollY - processStart) / Math.max(1, processEnd - processStart)));
        const processScene = state.id === 4 ? Math.round(processLocal * 4) : -1;
        if (processScene !== lastProcess) {
          processItems.forEach((item, index) => {
            const active = processScene >= 0 && index === processScene;
            item.classList.toggle("is-active", active);
            item.classList.toggle("is-complete", processScene >= 0 && index < processScene);
            if (active) item.setAttribute("aria-current", "step");
            else item.removeAttribute("aria-current");
          });
          lastProcess = processScene;
        }
      };

      const requestScrollUpdate = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFromScroll);
      };
      window.addEventListener("scroll", requestScrollUpdate, { passive: true });
      window.addEventListener("resize", requestScrollUpdate, { passive: true });
      updateFromScroll();

      const revealTargets = root.querySelectorAll(
        ".scene__title, .scene__copy, .services-list, .work-showcase, .engineering-facts, .process-list, .contact__cta",
      );
      const revealAnimations = reduced
        ? []
        : [...revealTargets].map((element) => animate(element, {
            translateY: [12, 0],
            duration: 620,
            ease: MOTION.EASE_OUT,
            autoplay: onScroll({
              target: element,
              enter: "top 92%",
              repeat: false,
            }),
          }));

      return () => {
        introAnimation.revert();
        revealAnimations.forEach((animation) => animation.revert());
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        window.removeEventListener("scroll", requestScrollUpdate);
        window.removeEventListener("resize", requestScrollUpdate);
        routeLinks.forEach((link) => {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        });
        processItems.forEach((item) => {
          item.classList.remove("is-active", "is-complete");
          item.removeAttribute("aria-current");
        });
      };
    });

    return () => scope.revert();
  }, [ready, rootRef, world]);
}
