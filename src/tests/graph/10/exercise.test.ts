import makeExercises from "../../../exercises/graph/10/exercise";
import { makeGraphExerciseTestCase } from "../../../lib/graphExercise/graphExerciseTestCase";

const graphExerciseTestCase = makeGraphExerciseTestCase(makeExercises);

graphExerciseTestCase("10", [
  { created: ["A", "B"] },
  { resolved: "A", created: ["C"] },
  { resolved: "B", created: [] },
  { resolved: "C", created: ["D"] },
  { resolved: "D", created: [] },
]);

graphExerciseTestCase("10", [
  { created: ["A", "B"] },
  { resolved: "B", created: ["C"] },
  { resolved: "A", created: [] },
  { resolved: "C", created: ["D"] },
  { resolved: "D", created: [] },
]);

graphExerciseTestCase("10", [
  { created: ["A", "B"] },
  { resolved: "A", created: ["C"] },
  { resolved: "C", created: ["D"] },
  { resolved: "B", created: [] },
  { resolved: "D", created: [] },
]);

graphExerciseTestCase("10", [
  { created: ["A", "B"] },
  { resolved: "B", created: ["C"] },
  { resolved: "C", created: ["D"] },
  { resolved: "A", created: [] },
  { resolved: "D", created: [] },
]);

graphExerciseTestCase("10", [
  { created: ["A", "B"] },
  { resolved: "B", created: ["C"] },
  { resolved: "C", created: ["D"] },
  { resolved: "D", created: [] },
  { resolved: "A", created: [] },
]);
