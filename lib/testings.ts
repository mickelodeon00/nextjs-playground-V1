import { sampleBorrowers } from "./creditscore-samples";
import { calculateCreditScore } from "./loan-ranking";

const results = sampleBorrowers.map((borrower) => {
  return calculateCreditScore(borrower);
});

console.info(results);
