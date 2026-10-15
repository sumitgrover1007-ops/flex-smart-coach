// Joint angle calculation from 3 landmarks
export function calcAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// Pose connections for skeleton drawing
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [23, 25], [25, 27],
  [24, 26], [26, 28],
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [15, 17], [15, 19], [15, 21],
  [16, 18], [16, 20], [16, 22],
  [27, 29], [27, 31],
  [28, 30], [28, 32],
];

export type ExerciseType = "pushup" | "squat" | "general";

export interface JointAngles {
  leftElbow: number;
  rightElbow: number;
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  leftShoulder: number;
  rightShoulder: number;
}

export interface PoseLandmarkPoint {
  x: number;
  y: number;
  visibility?: number;
}

export interface PrimaryMetric {
  label: string;
  value: number;
  target: string;
}

export function computeJointAngles(lm: PoseLandmarkPoint[]): JointAngles {
  const [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist] = [lm[11], lm[12], lm[13], lm[14], lm[15], lm[16]];
  const [leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle] = [lm[23], lm[24], lm[25], lm[26], lm[27], lm[28]];

  return {
    leftElbow: calcAngle(leftShoulder, leftElbow, leftWrist),
    rightElbow: calcAngle(rightShoulder, rightElbow, rightWrist),
    leftKnee: calcAngle(leftHip, leftKnee, leftAnkle),
    rightKnee: calcAngle(rightHip, rightKnee, rightAnkle),
    leftHip: calcAngle(leftShoulder, leftHip, leftKnee),
    rightHip: calcAngle(rightShoulder, rightHip, rightKnee),
    leftShoulder: calcAngle(leftElbow, leftShoulder, leftHip),
    rightShoulder: calcAngle(rightElbow, rightShoulder, rightHip),
  };
}

function averagePair(a: number, b: number): number {
  return (a + b) / 2;
}

// Score posture locally (quick, no AI)
export function localPostureScore(angles: JointAngles, exercise: ExerciseType): number {
  if (exercise === "pushup") {
    // Good pushup: elbows ~90° at bottom, hips ~170-180° (straight body)
    const elbowScore = Math.max(0, 100 - Math.abs(averagePair(angles.leftElbow, angles.rightElbow) - 90) * 1.5);
    const hipScore = Math.max(0, 100 - Math.abs(averagePair(angles.leftHip, angles.rightHip) - 170) * 2);
    return Math.round((elbowScore + hipScore) / 2);
  }
  if (exercise === "squat") {
    // Good squat: knees ~90° at bottom, hips ~90°
    const kneeScore = Math.max(0, 100 - Math.abs(averagePair(angles.leftKnee, angles.rightKnee) - 90) * 1.2);
    const hipScore = Math.max(0, 100 - Math.abs(averagePair(angles.leftHip, angles.rightHip) - 90) * 1.2);
    return Math.round((kneeScore + hipScore) / 2);
  }
  // General: check for straight back
  const hipScore = Math.max(0, 100 - Math.abs(averagePair(angles.leftHip, angles.rightHip) - 170) * 2);
  return Math.round(hipScore);
}

// Rep counting state machine
export interface RepCounter {
  count: number;
  phase: "up" | "down";
  signal?: number[];
  filteredSignal?: number[];
  avg?: number[];
  std?: number[];
  peaks?: number[];
  prevPeak?: 0 | 1;
  maxValue?: number;
}

function getVisibleShoulderY(landmarks?: PoseLandmarkPoint[]): number {
  if (!landmarks?.length) return 0;

  const leftVisibility = landmarks[11]?.visibility ?? 0;
  const rightVisibility = landmarks[12]?.visibility ?? 0;
  return leftVisibility >= rightVisibility ? landmarks[11]?.y ?? 0 : landmarks[12]?.y ?? 0;
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function standardDeviation(values: number[], mean: number): number {
  if (!values.length) return 0;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function pushupPeakCounter(counter: RepCounter, landmarks?: PoseLandmarkPoint[]): RepCounter {
  const maxSeqLen = 200;
  const lag = 60;
  const threshold = 0.1;
  const rawValue = getVisibleShoulderY(landmarks);
  const signal = [...(counter.signal ?? []), rawValue].slice(-maxSeqLen);
  const previousFiltered = counter.filteredSignal ?? [];
  const previousAvg = counter.avg ?? [];
  const previousStd = counter.std ?? [];
  const previousPeaks = counter.peaks ?? [];
  const i = signal.length - 1;
  const smoothingWindow = signal.slice(Math.max(0, signal.length - 10));
  const filteredValue = average(smoothingWindow);
  const filteredSignal = [...previousFiltered, filteredValue].slice(-maxSeqLen);

  let isPeak: 0 | 1 = 0;
  let avgValue = filteredValue;
  let stdValue = 0;

  if (i >= lag) {
    const baseline = filteredSignal.slice(Math.max(0, filteredSignal.length - lag - 1), -1);
    const previousAvgValue = previousAvg[previousAvg.length - 1] ?? average(baseline);
    const previousStdValue = previousStd[previousStd.length - 1] ?? standardDeviation(baseline, previousAvgValue);
    isPeak = filteredValue - previousAvgValue > threshold * previousStdValue ? 1 : 0;
    avgValue = average(baseline);
    stdValue = standardDeviation(baseline, avgValue);
  } else {
    avgValue = average(filteredSignal);
    stdValue = standardDeviation(filteredSignal, avgValue);
  }

  const prevPeak = counter.prevPeak ?? 0;
  const shouldCount = prevPeak === 0 && isPeak === 1 && rawValue > 0;

  return {
    count: shouldCount ? counter.count + 1 : counter.count,
    phase: isPeak ? "down" : "up",
    signal,
    filteredSignal,
    avg: [...previousAvg, avgValue].slice(-maxSeqLen),
    std: [...previousStd, stdValue].slice(-maxSeqLen),
    peaks: [...previousPeaks, isPeak].slice(-maxSeqLen),
    prevPeak: isPeak,
    maxValue: Math.max(counter.maxValue ?? 1, rawValue),
  };
}

export function countRep(
  counter: RepCounter,
  angles: JointAngles,
  exercise: ExerciseType,
  landmarks?: PoseLandmarkPoint[]
): RepCounter {
  if (exercise === "pushup") {
    return pushupPeakCounter(counter, landmarks);
  }

  const angle = exercise === "squat" ? averagePair(angles.leftKnee, angles.rightKnee) : 0;

  if (exercise === "squat") {
    if (counter.phase === "up" && angle < 110) {
      return { count: counter.count, phase: "down" };
    }
    if (counter.phase === "down" && angle > 160) {
      return { count: counter.count + 1, phase: "up" };
    }
  }

  return counter;
}

// Get color based on score
export function scoreColor(score: number): string {
  if (score >= 80) return "hsl(142, 71%, 45%)"; // green
  if (score >= 50) return "hsl(38, 92%, 50%)";  // amber
  return "hsl(0, 84%, 60%)";                     // red
}

// Get skeleton color based on local score
export function getSkeletonColor(score: number): { line: string; dot: string } {
  if (score >= 80) return { line: "hsl(142, 71%, 45%)", dot: "hsl(142, 71%, 55%)" };
  if (score >= 50) return { line: "hsl(38, 92%, 50%)", dot: "hsl(38, 92%, 60%)" };
  return { line: "hsl(0, 84%, 60%)", dot: "hsl(0, 84%, 70%)" };
}

export function getPrimaryMetric(angles: JointAngles | null, exercise: ExerciseType): PrimaryMetric {
  if (!angles) return { label: "Primary Angle", value: 0, target: "Start camera" };

  if (exercise === "pushup") {
    return {
      label: "Elbow Bend",
      value: Math.round(averagePair(angles.leftElbow, angles.rightElbow)),
      target: "Target bottom: 85–105°",
    };
  }

  if (exercise === "squat") {
    return {
      label: "Knee Depth",
      value: Math.round(averagePair(angles.leftKnee, angles.rightKnee)),
      target: "Target bottom: 85–115°",
    };
  }

  return {
    label: "Hip Alignment",
    value: Math.round(averagePair(angles.leftHip, angles.rightHip)),
    target: "Neutral posture: 160–180°",
  };
}

export function getPhaseLabel(counter: RepCounter, exercise: ExerciseType): string {
  if (exercise === "general") return "Tracking";
  return counter.phase === "down" ? "Lowering" : "Rising";
}

export function getTargetCue(angles: JointAngles | null, score: number, exercise: ExerciseType): string {
  if (!angles) return "Start camera and keep your full body in frame.";
  if (score >= 85) return "Excellent form. Keep the same rhythm and control.";

  if (exercise === "pushup") {
    const elbow = averagePair(angles.leftElbow, angles.rightElbow);
    const hip = averagePair(angles.leftHip, angles.rightHip);
    if (hip < 150) return "Lift your hips slightly and brace your core.";
    if (hip > 185) return "Avoid piking. Keep shoulders, hips, and heels aligned.";
    if (elbow > 120) return "Lower deeper until elbows approach 90°.";
    if (elbow < 75) return "Do not collapse at the bottom. Push smoothly upward.";
    return "Keep elbows near 45° and maintain a straight body line.";
  }

  if (exercise === "squat") {
    const knee = averagePair(angles.leftKnee, angles.rightKnee);
    const hip = averagePair(angles.leftHip, angles.rightHip);
    if (knee > 125) return "Sit deeper by pushing hips back and knees outward.";
    if (hip > 130) return "Drop hips lower while keeping your chest lifted.";
    if (knee < 70) return "You are very deep. Keep control and drive through heels.";
    return "Keep knees tracking over toes and maintain a neutral spine.";
  }

  if (averagePair(angles.leftHip, angles.rightHip) < 155) return "Stand taller and stack shoulders over hips.";
  return "Stay tall, relaxed, and balanced while tracking.";
}

export function getMetricSet(angles: JointAngles | null, exercise: ExerciseType): PrimaryMetric[] {
  if (!angles) return [];

  if (exercise === "pushup") {
    return [
      getPrimaryMetric(angles, exercise),
      { label: "Hip Line", value: Math.round(averagePair(angles.leftHip, angles.rightHip)), target: "160–180°" },
      { label: "Shoulder Load", value: Math.round(averagePair(angles.leftShoulder, angles.rightShoulder)), target: "45–85°" },
    ];
  }

  if (exercise === "squat") {
    return [
      getPrimaryMetric(angles, exercise),
      { label: "Hip Depth", value: Math.round(averagePair(angles.leftHip, angles.rightHip)), target: "85–115°" },
      { label: "Torso Control", value: Math.round(averagePair(angles.leftShoulder, angles.rightShoulder)), target: "Stable" },
    ];
  }

  return [
    getPrimaryMetric(angles, exercise),
    { label: "Left Knee", value: Math.round(angles.leftKnee), target: "Stable" },
    { label: "Right Knee", value: Math.round(angles.rightKnee), target: "Stable" },
  ];
}
