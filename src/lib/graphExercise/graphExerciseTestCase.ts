import { MakeExercise } from "../Exercise";
import { PromiseManager } from "../PromiseManager";
import { it, expect, describe } from "vitest";
import {
  GraphExerciseFirstStep,
  GraphExerciseFollowingStep,
  GraphExerciseStepSequence,
} from "./GraphExerciseStep";
import { graphExerciseTestDescription } from "./graphExerciseTestDescription";
import { difference } from "lodash";
import { reduceArrayAsync } from "../reduceArrayAsync";
import { createGraphExerciseContainer } from "./graphExerciseContainer";
import { waitForPromises } from "../waitForPromises";

type Dependencies = {
  makeThenCatchExercise: MakeExercise;
  makeAsyncAwaitExercise: MakeExercise;
  makeMixedExercise: MakeExercise;
};

export const makeGraphExerciseTestCase =
  ({
    makeAsyncAwaitExercise,
    makeMixedExercise,
    makeThenCatchExercise,
  }: Dependencies) =>
  (label: string, steps: GraphExerciseStepSequence) => {
    describe(label, () => {
      test({
        steps,
        type: "mixed",
        makeExercise: makeMixedExercise,
      });

      test({
        steps,
        type: "async/await",
        makeExercise: makeAsyncAwaitExercise,
      });

      test({
        steps,
        type: "then",
        makeExercise: makeThenCatchExercise,
      });
    });
  };

type TestParams = {
  type: "then" | "async/await" | "mixed";
  steps: GraphExerciseStepSequence;
  makeExercise: MakeExercise;
};

const test = ({ type, steps, makeExercise }: TestParams) => {
  const { exercise, promiseManager } = createGraphExerciseContainer({
    makeExercise,
  });

  const description = graphExerciseTestDescription(type, steps);

  it.skipIf(makeExercise.skipExerciseSymbol).concurrent(
    description,
    async () => {
      const exercisePromise = exercise();

      const [firstStep, ...followingSteps] = steps;

      const { promisesCreatedAtFirstStepLabels } = testFirstStep({
        firstStep,
        promiseManager,
        steps,
      });

      const allPromisesCreatedLabels = await reduceArrayAsync(
        followingSteps,
        async (promisesCreatedSoFarLabels, currentStep, index) => {
          // To account for the first step
          const stepIndex = index + 1;

          const { promisesCreatedAtFollowingStepLabels } =
            await testFollowingStep({
              followingStep: currentStep,
              promiseManager,
              promisesCreatedSoFarLabels,
              stepIndex,
              steps,
            });

          return [
            ...promisesCreatedSoFarLabels,
            ...promisesCreatedAtFollowingStepLabels,
          ];
        },
        Promise.resolve(promisesCreatedAtFirstStepLabels)
      );

      // Making sure there are no pending promises
      await exercisePromise;

      // Making sure we didn't create any more promises
      const promisesCreatedAfterExerciseFinished = difference(
        promiseManager.keys(),
        allPromisesCreatedLabels
      );
      expect(promisesCreatedAfterExerciseFinished).toHaveFinished();
    }
  );
};

type TestFirstStepParams = {
  firstStep: GraphExerciseFirstStep;
  steps: GraphExerciseStepSequence;
  promiseManager: PromiseManager;
};

const testFirstStep = ({
  firstStep,
  promiseManager,
  steps,
}: TestFirstStepParams) => {
  const promisesExpectedToBeCreatedLabels = [...firstStep.created];
  const promisesCreatedAtFirstStepLabels = promiseManager.keys();

  expect(promisesCreatedAtFirstStepLabels).toHaveBeenCreatedAtStep(
    promisesExpectedToBeCreatedLabels,
    { currentStep: firstStep, stepIndex: 0, steps }
  );

  return {
    promisesCreatedAtFirstStepLabels,
  };
};

type TestFollowingStepParams = {
  followingStep: GraphExerciseFollowingStep;
  promiseManager: PromiseManager;
  promisesCreatedSoFarLabels: Array<string>;
  stepIndex: number;
  steps: GraphExerciseStepSequence;
};

const testFollowingStep = async ({
  followingStep,
  promiseManager,
  promisesCreatedSoFarLabels,
  stepIndex,
  steps,
}: TestFollowingStepParams) => {
  const { created, resolved, rejected } = followingStep;

  if (resolved !== undefined) {
    promiseManager.resolve(resolved);
  } else if (rejected !== undefined) {
    promiseManager.reject(rejected);
  }

  await waitForPromises();

  const promisesExpectedToBeCreatedLabels = [...created];
  const promisesCreatedAtFollowingStepLabels = difference(
    promiseManager.keys(),
    promisesCreatedSoFarLabels
  );

  expect(promisesCreatedAtFollowingStepLabels).toHaveBeenCreatedAtStep(
    promisesExpectedToBeCreatedLabels,
    {
      currentStep: followingStep,
      stepIndex,
      steps,
    }
  );

  return {
    promisesCreatedAtFollowingStepLabels,
  };
};
