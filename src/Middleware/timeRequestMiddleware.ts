import { Elysia } from "elysia";

export const timingMiddleware = (app: Elysia) =>
  app.derive(({ request }) => {
    const start = performance.now();
    return {
      getProcessingTime: () => {
        const end = performance.now();
        return end - start;
      }
    };
  }).onAfterHandle(({ getProcessingTime }) => {
    const duration = getProcessingTime();
    console.log(`Request processed in ${duration.toFixed(2)}ms`);
  });
