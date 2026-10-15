import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, CameraOff, RefreshCw, AlertCircle, Save, Brain, Activity, Gauge, Timer, Target, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  POSE_CONNECTIONS,
  computeJointAngles,
  localPostureScore,
  countRep,
  getSkeletonColor,
  scoreColor,
  getPrimaryMetric,
  getPhaseLabel,
  getTargetCue,
  getMetricSet,
  type ExerciseType,
  type RepCounter,
  type JointAngles,
  type PoseLandmarkPoint,
} from "@/lib/postureUtils";

interface PoseLandmarkerLike {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks?: PoseLandmarkPoint[][] };
}

interface PostureSessionClient {
  from: (table: "posture_sessions") => {
    insert: (row: Record<string, string | number | null>) => Promise<{ error: Error | null }>;
  };
}

const PostureDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const poseLandmarkerRef = useRef<PoseLandmarkerLike | null>(null);
  const repRef = useRef<RepCounter>({ count: 0, phase: "up" });
  const sessionStartRef = useRef<number>(0);
  const scoreStatsRef = useRef({ total: 0, count: 0 });
  const lastAiCallRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);
  const latestLandmarksRef = useRef<PoseLandmarkPoint[]>([]);
  const latestAnglesRef = useRef<JointAngles | null>(null);

  const { user } = useAuth();

  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [exercise, setExercise] = useState<ExerciseType>("pushup");
  const [reps, setReps] = useState(0);
  const [postureScore, setPostureScore] = useState<number>(0);
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    status: string;
    feedback: string;
    corrections: string[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jointAngles, setJointAngles] = useState<JointAngles | null>(null);

  const fpsRef = useRef({ frames: 0, lastTime: performance.now() });

  // Initialize MediaPipe PoseLandmarker
  const initPose = useCallback(async () => {
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { PoseLandmarker, FilesetResolver } = vision;
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    } catch (err) {
      console.error("Failed to init pose landmarker:", err);
      setError("Could not load pose detection model. Try refreshing.");
    }
  }, []);

  // Draw color-coded skeleton
  const drawSkeleton = useCallback(
    (landmarks: PoseLandmarkPoint[][], width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);

      if (!landmarks.length) return;
      const lm = landmarks[0];
      latestLandmarksRef.current = lm;

      // Compute angles and score
      const angles = computeJointAngles(lm);
      const score = localPostureScore(angles, exercise);
      latestAnglesRef.current = angles;
      scoreStatsRef.current.total += score;
      scoreStatsRef.current.count += 1;

      const now = performance.now();
      if (now - lastUiUpdateRef.current >= 120) {
        setJointAngles(angles);
        setPostureScore(score);
        lastUiUpdateRef.current = now;
      }

      // Rep counting
      const newRep = countRep(repRef.current, angles, exercise, lm);
      if (newRep.count !== repRef.current.count) {
        setReps(newRep.count);
      }
      repRef.current = newRep;

      // Color-coded skeleton
      const colors = getSkeletonColor(score);

      // Draw connections
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.shadowColor = colors.line;
      ctx.shadowBlur = 6;
      for (const [a, b] of POSE_CONNECTIONS) {
        if (a < lm.length && b < lm.length && lm[a].visibility > 0.5 && lm[b].visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(lm[a].x * width, lm[a].y * height);
          ctx.lineTo(lm[b].x * width, lm[b].y * height);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // Draw landmarks
      for (let i = 0; i < lm.length; i++) {
        if (lm[i].visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(lm[i].x * width, lm[i].y * height, 5, 0, 2 * Math.PI);
          ctx.fillStyle = i <= 10 ? "hsl(258, 90%, 66%)" : colors.dot;
          ctx.fill();
          ctx.strokeStyle = "hsl(0, 0%, 7%)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Draw angle labels on key joints
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      const labelJoints = exercise === "pushup"
        ? [{ idx: 13, label: `${Math.round(angles.leftElbow)}°` }, { idx: 14, label: `${Math.round(angles.rightElbow)}°` }]
        : exercise === "squat"
        ? [{ idx: 25, label: `${Math.round(angles.leftKnee)}°` }, { idx: 26, label: `${Math.round(angles.rightKnee)}°` }]
        : [];

      for (const { idx, label } of labelJoints) {
        if (idx < lm.length && lm[idx].visibility > 0.5) {
          const x = lm[idx].x * width;
          const y = lm[idx].y * height - 14;
          ctx.fillStyle = "hsl(0, 0%, 0%)";
          ctx.fillRect(x - 20, y - 12, 40, 16);
          ctx.fillStyle = "hsl(0, 0%, 100%)";
          ctx.fillText(label, x, y);
        }
      }

      // Draw score overlay
      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = scoreColor(score);
      ctx.shadowColor = "hsl(0,0%,0%)";
      ctx.shadowBlur = 4;
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${score}`, 16, 32);
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`Reps: ${repRef.current.count}`, 16, 58);
      ctx.shadowBlur = 0;
    },
    [exercise]
  );

  // Detection loop
  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    if (!video || !poseLandmarker || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const now = performance.now();
    const result = poseLandmarker.detectForVideo(video, now);
    drawSkeleton(result.landmarks || [], video.videoWidth, video.videoHeight);

    // FPS counter
    fpsRef.current.frames++;
    if (now - fpsRef.current.lastTime >= 1000) {
      setFps(fpsRef.current.frames);
      fpsRef.current = { frames: 0, lastTime: now };
    }

    animationRef.current = requestAnimationFrame(detectLoop);
  }, [drawSkeleton]);

  // Start camera
  const startCamera = async () => {
    setLoading(true);
    setError(null);
    repRef.current = { count: 0, phase: "up" };
    scoreStatsRef.current = { total: 0, count: 0 };
    latestAnglesRef.current = null;
    lastUiUpdateRef.current = 0;
    setReps(0);
    setPostureScore(0);
    setJointAngles(null);
    setAiAnalysis(null);
    sessionStartRef.current = Date.now();

    try {
      await initPose();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        animationRef.current = requestAnimationFrame(detectLoop);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("Permission")
          ? "Camera access denied. Please allow camera permissions."
          : "Could not access camera. Make sure no other app is using it."
      );
    } finally {
      setLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    cancelAnimationFrame(animationRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFps(0);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // AI Analysis
  const requestAiAnalysis = async () => {
    const angles = latestAnglesRef.current;
    if (!latestLandmarksRef.current.length || !angles) return;
    const now = Date.now();
    if (now - lastAiCallRef.current < 5000) {
      toast.info("Please wait a few seconds between AI analyses.");
      return;
    }
    lastAiCallRef.current = now;
    setAiLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/posture-analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            landmarks: latestLandmarksRef.current,
            exerciseType: exercise,
            jointAngles: angles,
          }),
        }
      );

      if (response.status === 429) {
        toast.error("Rate limit exceeded. Try again later.");
        return;
      }
      if (response.status === 402) {
        toast.error("AI usage limit reached. Please add credits.");
        return;
      }
      if (!response.ok) throw new Error("AI analysis failed");

      const data = await response.json();
      setAiAnalysis(data);
      toast.success(`AI Score: ${data.score}/100 — ${data.status}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not get AI analysis. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Save session
  const saveSession = async () => {
    if (!user) {
      toast.error("Please log in to save sessions.");
      return;
    }
    setSaving(true);
    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const avgScore = scoreStatsRef.current.count
      ? Math.round(scoreStatsRef.current.total / scoreStatsRef.current.count)
      : 0;

    const postureClient = supabase as unknown as PostureSessionClient;
    const { error: dbError } = await postureClient.from("posture_sessions").insert({
      user_id: user.id,
      exercise_type: exercise,
      total_reps: repRef.current.count,
      avg_posture_score: avgScore,
      duration_seconds: duration,
      ai_feedback: aiAnalysis?.feedback || null,
    });

    setSaving(false);
    if (dbError) {
      console.error(dbError);
      toast.error("Failed to save session.");
    } else {
      toast.success("Session saved!");
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (videoElement?.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const scoreBadgeClass =
    postureScore >= 80
      ? "bg-success/20 text-success border-success/30"
      : postureScore >= 50
      ? "bg-warning/20 text-warning border-warning/30"
      : "bg-destructive/20 text-destructive border-destructive/30";

  const primaryMetric = useMemo(() => getPrimaryMetric(jointAngles, exercise), [jointAngles, exercise]);
  const phaseLabel = getPhaseLabel(repRef.current, exercise);
  const coachingCue = useMemo(() => getTargetCue(jointAngles, postureScore, exercise), [jointAngles, postureScore, exercise]);
  const liveMetrics = useMemo(() => getMetricSet(jointAngles, exercise), [jointAngles, exercise]);
  const detectionStatus = loading
    ? "Loading model"
    : cameraActive
    ? postureScore > 0
      ? "Detecting pose"
      : "Searching pose"
    : "Ready";
  const averageScore = scoreStatsRef.current.count
    ? Math.round(scoreStatsRef.current.total / scoreStatsRef.current.count)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.12),transparent_32%),radial-gradient(circle_at_78%_10%,hsl(var(--secondary)/0.10),transparent_28%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur">
              <Waves className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Biomechanics Lab</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
              Real-time Posture Intelligence
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Browser-based MediaPipe analysis with live joint angles, rep counting, score-aware skeleton feedback, and AI correction insights.
            </p>
          </div>

          <Card className="border-border/50 bg-card/70 backdrop-blur-xl shadow-soft min-w-[260px]">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Exercise Mode</p>
              <Select value={exercise} onValueChange={(v) => setExercise(v as ExerciseType)}>
                <SelectTrigger className="w-full bg-muted/40 border-border/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pushup">Push-ups</SelectItem>
                  <SelectItem value="squat">Squats</SelectItem>
                  <SelectItem value="general">General Posture</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="space-y-6">
            <Card className={cn("border-border/50 bg-card/70 backdrop-blur-xl overflow-hidden shadow-strong", cameraActive && "shadow-glow")}>
              <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-2 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Live Analysis Stage
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-muted/40 border-border/60">{detectionStatus}</Badge>
                  {cameraActive && (
                    <>
                      <Badge variant="outline" className="text-xs tabular-nums">{fps} FPS</Badge>
                      <Badge variant="outline" className={cn("text-xs", scoreBadgeClass)}>Score: {postureScore}</Badge>
                      <Badge variant="outline" className="text-xs"><Activity className="w-3 h-3 mr-1" />{reps} reps</Badge>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full aspect-[4/3] bg-muted/30 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-neon-grid opacity-30 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-background/30 pointer-events-none" />
                  {!cameraActive && !loading && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground relative z-10">
                      <CameraOff className="w-16 h-16 opacity-30" />
                      <p className="text-sm">Camera is off</p>
                    </div>
                  )}
                  {loading && (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground relative z-10">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm">Loading pose model & camera…</p>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    className={cn("absolute inset-0 w-full h-full object-cover", cameraActive ? "opacity-100" : "opacity-0")}
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

                  {cameraActive && (
                    <div className="absolute top-4 left-4 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-soft">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{primaryMetric.label}</p>
                      <p className="text-4xl font-black text-primary tabular-nums">{primaryMetric.value}°</p>
                      <p className="text-xs text-muted-foreground">{primaryMetric.target}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {aiAnalysis && (
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />AI Posture Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold tabular-nums" style={{ color: scoreColor(aiAnalysis.score) }}>{aiAnalysis.score}</div>
                    <div>
                      <Badge variant="outline" className={cn("text-sm capitalize", aiAnalysis.status === "excellent" && "bg-success/20 text-success border-success/30", aiAnalysis.status === "good" && "bg-success/10 text-success border-success/20", aiAnalysis.status === "fair" && "bg-warning/20 text-warning border-warning/30", aiAnalysis.status === "poor" && "bg-destructive/20 text-destructive border-destructive/30")}>{aiAnalysis.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">{aiAnalysis.feedback}</p>
                    </div>
                  </div>
                  {aiAnalysis.corrections.length > 0 && (
                    <ul className="grid gap-2">
                      {aiAnalysis.corrections.map((c, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-destructive mt-0.5">•</span>{c}</li>)}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-soft">
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                    <Gauge className="w-5 h-5 text-primary mb-2" />
                    <p className="text-3xl font-bold tabular-nums">{postureScore}</p>
                    <p className="text-xs text-muted-foreground">Live score</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                    <Activity className="w-5 h-5 text-secondary mb-2" />
                    <p className="text-3xl font-bold tabular-nums">{reps}</p>
                    <p className="text-xs text-muted-foreground">Reps</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                    <Timer className="w-5 h-5 text-accent mb-2" />
                    <p className="text-3xl font-bold tabular-nums">{fps}</p>
                    <p className="text-xs text-muted-foreground">FPS</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                    <Target className="w-5 h-5 text-warning mb-2" />
                    <p className="text-lg font-bold">{phaseLabel}</p>
                    <p className="text-xs text-muted-foreground">Phase</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary mb-2">Coach Cue</p>
                  <p className="text-sm text-foreground">{coachingCue}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Live Telemetry</p>
                  {liveMetrics.length ? liveMetrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
                      <div>
                        <p className="text-sm font-medium text-foreground">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">{metric.target}</p>
                      </div>
                      <p className="text-xl font-bold tabular-nums text-primary">{metric.value}°</p>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Start the camera to see joint-angle telemetry.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {!cameraActive ? (
                    <Button onClick={startCamera} disabled={loading} size="lg" className="gap-2 bg-gradient-primary">
                      <Camera className="w-5 h-5" />{loading ? "Starting…" : "Start Camera"}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={requestAiAnalysis} disabled={aiLoading} size="lg" variant="secondary" className="gap-2"><Brain className="w-5 h-5" />{aiLoading ? "Analyzing…" : "AI Analysis"}</Button>
                      <Button onClick={saveSession} disabled={saving} size="lg" variant="outline" className="gap-2"><Save className="w-5 h-5" />{saving ? "Saving…" : `Save Session (${averageScore} avg)`}</Button>
                      <Button onClick={stopCamera} variant="destructive" size="lg" className="gap-2"><CameraOff className="w-5 h-5" />Stop Camera</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardContent className="py-4">
                <p className="text-sm font-medium text-foreground mb-2">Best results</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Stand 5-8 feet from the camera</li>
                  <li>• Use good lighting and fitted clothing</li>
                  <li>• Keep your full body in frame</li>
                  <li>• Move slowly for stable angle readings</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostureDetection;
