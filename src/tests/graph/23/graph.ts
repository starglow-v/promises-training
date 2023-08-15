import { GraphRepresentation } from "../../../lib/graphExercise/graphExerciseTests";

export const graph: GraphRepresentation = [
  {
    label: "A",
    dependencies: [],
  },
  {
    label: "B",
    dependencies: [],
  },
  {
    label: "C",
    dependencies: [["A", "B"]],
  },
  {
    label: "D",
    dependencies: [["A"], ["!C"]],
  },
  {
    label: "E",
    dependencies: [["B"]],
  },
  {
    label: "F",
    dependencies: [["C"], ["E"]],
  },
  {
    label: "G",
    dependencies: [["!D", "!E"], ["!F"]],
  },
];
