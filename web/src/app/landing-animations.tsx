"use client";

import { useEffect } from "react";

export function LandingAnimations() {
  useEffect(() => {
    // Scroll-in for feature text + visuals
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => fadeObserver.observe(el));

    // Schedule card special animation
    const scheduleCard = document.querySelector(".schedule-card");
    const scheduleDays = document.querySelector(".sc-days");

    if (scheduleCard && scheduleDays) {
      const scheduleObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              scheduleDays.classList.add("animate");
              scheduleCard.classList.add("animate");
              scheduleObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      scheduleObserver.observe(scheduleCard);

      return () => {
        fadeObserver.disconnect();
        scheduleObserver.disconnect();
      };
    }

    return () => fadeObserver.disconnect();
  }, []);

  return null;
}
