// Credit Scoring System for Loan Application
// Evaluates borrower creditworthiness based on payment history, tenure, and savings

// ==================== TYPES & INTERFACES ====================

interface LoanData {
  loan_id: string;
  created_at: Date;
  member_id: string;
  status: "approved" | "completed";
  interest_rate: number;
  loan_balance: number;
  original_repayment_duration: number;
  extended_by: number;
  loan_amount: number;
}

interface RepaymentData {
  repayment_id: string;
  loan_id: string;
  amount: number;
  date_paid: Date;
  status: "approved";
}

interface MemberProfile {
  member_id: string;
  created_at: Date;
  current_savings_balance: number;
}

export interface CreditScoreInput {
  memberProfile: MemberProfile;
  loans: LoanData[];
  repayments: RepaymentData[];
}

interface LoanPerformanceMetrics {
  loanId: string;
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  averageDaysLate: number;
  loanDurationMonths: number;
  loanAmount: number;
  extensionsUsed: number;
  performanceScore: number;
  completedAt: Date;
}

interface CreditScoreResult {
  memberId: string;
  creditScore: number;
  creditGrade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  riskLevel: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor" | "High Risk";
  maxBorrowingAmount: number;
  factors: {
    paymentHistory: number;
    loanExperience: number;
    platformTenure: number;
    financialStability: number;
  };
  recommendations: string[];
}

// ==================== CONSTANTS ====================

const CREDIT_SCORE_WEIGHTS = {
  PAYMENT_HISTORY: 0.5,
  LOAN_EXPERIENCE: 0.25,
  PLATFORM_TENURE: 0.15,
  FINANCIAL_STABILITY: 0.1,
} as const;

const LOAN_PERFORMANCE_WEIGHTS = {
  MOST_RECENT: 0.5,
  SECOND_RECENT: 0.3,
  THIRD_RECENT: 0.2,
  OTHERS: 0.1, // Divided among remaining loans
} as const;

const CREDIT_MULTIPLIERS = {
  EXCELLENT: { min: 800, max: 850, multiplier: 2.2 },
  VERY_GOOD: { min: 740, max: 799, multiplier: 1.8 },
  GOOD: { min: 670, max: 739, multiplier: 1.5 },
  FAIR: { min: 580, max: 669, multiplier: 1.2 },
  POOR: { min: 500, max: 579, multiplier: 1.0 },
  HIGH_RISK: { min: 300, max: 499, multiplier: 0.7 },
} as const;

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculates the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the number of months between two dates
 */
function monthsBetween(startDate: Date, endDate: Date): number {
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}

/**
 * Generates monthly due dates based on loan disbursement date
 */
function generateDueDates(
  disbursementDate: Date,
  durationMonths: number
): Date[] {
  const dueDates: Date[] = [];
  const baseDay = disbursementDate.getDate();

  for (let i = 1; i <= durationMonths; i++) {
    const dueDate = new Date(disbursementDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(baseDay);
    dueDates.push(dueDate);
  }

  return dueDates;
}

/**
 * Maps credit score to grade and risk level
 */
function getCreditGradeAndRisk(score: number): {
  grade: CreditScoreResult["creditGrade"];
  risk: CreditScoreResult["riskLevel"];
} {
  if (score >= 800) return { grade: "A+", risk: "Excellent" };
  if (score >= 780) return { grade: "A", risk: "Excellent" };
  if (score >= 740) return { grade: "B+", risk: "Very Good" };
  if (score >= 670) return { grade: "B", risk: "Good" };
  if (score >= 620) return { grade: "C+", risk: "Fair" };
  if (score >= 580) return { grade: "C", risk: "Fair" };
  if (score >= 500) return { grade: "D", risk: "Poor" };
  return { grade: "F", risk: "High Risk" };
}

// ==================== CORE CALCULATION FUNCTIONS ====================

/**
 * Calculates individual loan performance metrics
 */
function calculateLoanPerformance(
  loan: LoanData,
  repayments: RepaymentData[]
): LoanPerformanceMetrics {
  const loanRepayments = repayments
    .filter((r) => r.loan_id === loan.loan_id && r.status === "approved")
    .sort((a, b) => a.date_paid.getTime() - b.date_paid.getTime());

  const dueDates = generateDueDates(
    loan.created_at,
    loan.original_repayment_duration
  );

  let onTimePayments = 0;
  let latePayments = 0;
  let totalDaysLate = 0;

  // Match payments to due dates
  loanRepayments.forEach((payment, index) => {
    if (index < dueDates.length) {
      const dueDate = dueDates[index];
      const daysLate = Math.max(0, daysBetween(dueDate, payment.date_paid));

      if (daysLate <= 2) {
        // Grace period of 2 days
        onTimePayments++;
      } else {
        latePayments++;
        totalDaysLate += daysLate;
      }
    }
  });

  const totalPayments = onTimePayments + latePayments;
  const averageDaysLate = latePayments > 0 ? totalDaysLate / latePayments : 0;

  // Calculate performance score (0-100)
  const onTimeRate = totalPayments > 0 ? onTimePayments / totalPayments : 0;
  const latenessPenalty = Math.min(averageDaysLate * 2, 40);
  const extensionPenalty = loan.extended_by * 10;
  const performanceScore = Math.max(
    0,
    onTimeRate * 100 - latenessPenalty - extensionPenalty
  );

  return {
    loanId: loan.loan_id,
    totalPayments,
    onTimePayments,
    latePayments,
    averageDaysLate,
    loanDurationMonths: loan.original_repayment_duration,
    loanAmount: loan.loan_amount,
    extensionsUsed: loan.extended_by,
    performanceScore,
    completedAt: loan.created_at, // Use creation date for sorting
  };
}

/**
 * Calculates weighted payment history score
 */
function calculatePaymentHistoryScore(
  loanPerformances: LoanPerformanceMetrics[]
): number {
  if (loanPerformances.length === 0) return 0;

  // Sort by completion date (most recent first)
  const sortedPerformances = [...loanPerformances].sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  let weightedScore = 0;
  let totalWeight = 0;

  sortedPerformances.forEach((performance, index) => {
    let weight: number;

    if (index === 0) weight = LOAN_PERFORMANCE_WEIGHTS.MOST_RECENT;
    else if (index === 1) weight = LOAN_PERFORMANCE_WEIGHTS.SECOND_RECENT;
    else if (index === 2) weight = LOAN_PERFORMANCE_WEIGHTS.THIRD_RECENT;
    else
      weight =
        LOAN_PERFORMANCE_WEIGHTS.OTHERS / (sortedPerformances.length - 3);

    weightedScore += performance.performanceScore * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

/**
 * Calculates loan experience score based on duration and progression
 */
function calculateLoanExperienceScore(
  loanPerformances: LoanPerformanceMetrics[]
): number {
  if (loanPerformances.length === 0) return 0;

  const totalBorrowingMonths = loanPerformances.reduce(
    (sum, loan) => sum + loan.loanDurationMonths,
    0
  );

  const largestLoanAmount = Math.max(
    ...loanPerformances.map((l) => l.loanAmount)
  );
  const totalLoansCount = loanPerformances.length;

  // Experience factors
  const durationScore = Math.min(totalBorrowingMonths * 2, 60); // Max 60 points
  const diversityScore = Math.min(totalLoansCount * 5, 25); // Max 25 points
  const scaleScore = Math.min((largestLoanAmount / 50000) * 15, 15); // Max 15 points

  return durationScore + diversityScore + scaleScore;
}

/**
 * Calculates platform tenure score
 */
function calculatePlatformTenureScore(memberProfile: MemberProfile): number {
  const tenureMonths = monthsBetween(memberProfile.created_at, new Date());

  // Tenure scoring: 0-36 months = 0-100 points
  return Math.min(tenureMonths * 2.8, 100);
}

/**
 * Calculates financial stability score based on savings
 */
function calculateFinancialStabilityScore(
  memberProfile: MemberProfile,
  activeLoans: LoanData[]
): number {
  const currentDebt = activeLoans.reduce(
    (sum, loan) => sum + loan.loan_balance,
    0
  );
  const savingsBalance = memberProfile.current_savings_balance;

  if (savingsBalance === 0) return 0;

  // Debt-to-savings ratio
  const debtToSavingsRatio = currentDebt / savingsBalance;

  // Savings score (0-100)
  const savingsScore = Math.min((savingsBalance / 10000) * 20, 60); // Max 60 points

  // Debt ratio penalty
  const debtPenalty = Math.min(debtToSavingsRatio * 30, 40); // Max 40 points penalty

  return Math.max(0, savingsScore - debtPenalty);
}

/**
 * Calculates maximum borrowing amount based on credit score and history
 */
function calculateMaxBorrowingAmount(
  creditScore: number,
  loanPerformances: LoanPerformanceMetrics[],
  savingsBalance: number
): number {
  if (loanPerformances.length === 0)
    return Math.max(50000, savingsBalance * 0.5);

  const largestSuccessfulLoan = Math.max(
    ...loanPerformances.map((l) => l.loanAmount)
  );

  // Determine multiplier based on credit score
  let multiplier = 0.7; // Default for high risk

  Object.values(CREDIT_MULTIPLIERS).forEach((range) => {
    if (creditScore >= range.min && creditScore <= range.max) {
      multiplier = range.multiplier;
    }
  });

  const baseBorrowingAmount = largestSuccessfulLoan * multiplier;
  const savingsBasedLimit = savingsBalance * 3; // Max 3x savings

  return Math.min(baseBorrowingAmount, savingsBasedLimit);
}

/**
 * Generates recommendations based on credit profile
 */
function generateRecommendations(
  creditScore: number,
  loanPerformances: LoanPerformanceMetrics[],
  memberProfile: MemberProfile
): string[] {
  const recommendations: string[] = [];

  if (creditScore < 600) {
    recommendations.push(
      "Focus on making all future payments on time to improve credit score"
    );
    recommendations.push(
      "Consider smaller loan amounts to build payment history"
    );
  }

  if (loanPerformances.length > 0) {
    const avgPerformance =
      loanPerformances.reduce((sum, p) => sum + p.performanceScore, 0) /
      loanPerformances.length;
    if (avgPerformance < 70) {
      recommendations.push(
        "Improve payment consistency to unlock higher borrowing limits"
      );
    }
  }

  if (memberProfile.current_savings_balance < 50000) {
    recommendations.push(
      "Increase savings balance to improve borrowing capacity"
    );
  }

  if (creditScore >= 750) {
    recommendations.push(
      "Excellent credit profile - eligible for premium loan products"
    );
  }

  return recommendations;
}

// ==================== MAIN CREDIT SCORING FUNCTION ====================

/**
 * Main function to calculate credit score and borrowing capacity
 */
export function calculateCreditScore(
  input: CreditScoreInput
): CreditScoreResult {
  const { memberProfile, loans, repayments } = input;

  // Filter completed loans for credit analysis
  const completedLoans = loans.filter((loan) => loan.status === "completed");
  const activeLoans = loans.filter((loan) => loan.status === "approved");

  // Calculate loan performance metrics
  const loanPerformances = completedLoans.map((loan) =>
    calculateLoanPerformance(loan, repayments)
  );

  // Calculate individual factor scores
  const paymentHistoryScore = calculatePaymentHistoryScore(loanPerformances);
  const loanExperienceScore = calculateLoanExperienceScore(loanPerformances);
  const platformTenureScore = calculatePlatformTenureScore(memberProfile);
  const financialStabilityScore = calculateFinancialStabilityScore(
    memberProfile,
    activeLoans
  );

  // Calculate weighted credit score
  const creditScore = Math.round(
    (paymentHistoryScore * CREDIT_SCORE_WEIGHTS.PAYMENT_HISTORY +
      loanExperienceScore * CREDIT_SCORE_WEIGHTS.LOAN_EXPERIENCE +
      platformTenureScore * CREDIT_SCORE_WEIGHTS.PLATFORM_TENURE +
      financialStabilityScore * CREDIT_SCORE_WEIGHTS.FINANCIAL_STABILITY) *
      8.5 +
      300
  );

  // Ensure score is within valid range
  const finalCreditScore = Math.max(300, Math.min(850, creditScore));

  // Get credit grade and risk level
  const { grade, risk } = getCreditGradeAndRisk(finalCreditScore);

  // Calculate maximum borrowing amount
  const maxBorrowingAmount = calculateMaxBorrowingAmount(
    finalCreditScore,
    loanPerformances,
    memberProfile.current_savings_balance
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    finalCreditScore,
    loanPerformances,
    memberProfile
  );

  return {
    memberId: memberProfile.member_id,
    creditScore: finalCreditScore,
    creditGrade: grade,
    riskLevel: risk,
    maxBorrowingAmount: Math.round(maxBorrowingAmount),
    factors: {
      paymentHistory: Math.round(paymentHistoryScore),
      loanExperience: Math.round(loanExperienceScore),
      platformTenure: Math.round(platformTenureScore),
      financialStability: Math.round(financialStabilityScore),
    },
    recommendations,
  };
}

// ==================== USAGE EXAMPLE ====================

/*
// Example usage:
const sampleInput: CreditScoreInput = {
  memberProfile: {
    member_id: "user_123",
    created_at: new Date("2022-01-15"),
    current_savings_balance: 150000,
  },
  loans: [
    {
      loan_id: "loan_1",
      created_at: new Date("2023-02-01"),
      member_id: "user_123",
      status: "completed",
      interest_rate: 0.05,
      loan_balance: 0,
      original_repayment_duration: 6,
      extended_by: 0,
      loan_amount: 100000,
    },
    {
      loan_id: "loan_2",
      created_at: new Date("2023-09-01"),
      member_id: "user_123",
      status: "completed",
      interest_rate: 0.05,
      loan_balance: 0,
      original_repayment_duration: 12,
      extended_by: 1,
      loan_amount: 200000,
    },
  ],
  repayments: [
    // Loan 1 payments
    {
      repayment_id: "rep_1",
      loan_id: "loan_1",
      amount: 17500,
      date_paid: new Date("2023-03-01"),
      status: "approved",
    },
    // ... more repayments
  ],
};

const result = calculateCreditScore(sampleInput);
console.log(`Credit Score: ${result.creditScore}`);
console.log(`Max Borrowing: ₦${result.maxBorrowingAmount.toLocaleString()}`);
*/
