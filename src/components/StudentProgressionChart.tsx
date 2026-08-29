import React, { useState, useMemo } from "react";
import {
  Student,
  ClassStream,
  GradebookData,
  SubjectAssessment
} from "../types";
import {
  getZambianSubjectsForGrade,
  calculateEczGrade,
  calculateGrade7EczGrade,
  ECZ_GRADE_SCALE,
  GRADE_7_ECZ_SCALE,
  isGrade4to7Grade,
  isGrade4to7Class
} from "../data/zambianSchoolData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  TrendingUp,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Filter,
  Eye,
  Info
} from "lucide-react";

interface StudentProgressionChartProps {
  student: Student;
  currentClass: ClassStream;
  gradebook: GradebookData;
}

// Distinct, eye-friendly palette for subjects
const SUBJECT_COLORS = [
  "#059669", // Emerald (Math / Primary)
  "#2563eb", // Blue (English)
  "#7c3aed", // Violet (Science)
  "#d97706", // Amber (Social Studies)
  "#0891b2", // Cyan (Zambian Language)
  "#e11d48", // Rose (CTS)
  "#4f46e5", // Indigo (Expressive Arts)
  "#16a34a", // Green
  "#9333ea"  // Purple
];

const TERMS = ["Term 1", "Term 2", "Term 3"] as const;

export function StudentProgressionChart({
  student,
  currentClass,
  gradebook
}: StudentProgressionChartProps) {
  const subjects = useMemo(() => {
    return getZambianSubjectsForGrade(currentClass.gradeNum);
  }, [currentClass.gradeNum]);

  // Chart presentation mode
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [metricType, setMetricType] = useState<"total" | "ca" | "exam">("total");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    // Default to first 4 subjects + average
    return subjects.slice(0, 4);
  });
  const [showAverageLine, setShowAverageLine] = useState(true);

  const isG4to7 = isGrade4to7Grade(student.grade) || isGrade4to7Class(currentClass.name);

  // Build structured data across the 3 terms
  const { progressionByTerm, subjectProgressionSummary, termAverages, overallImprovement } = useMemo(() => {
    const classId = student.classId;
    const studentId = student.id;

    const termData: Array<{
      term: string;
      termShort: string;
      average: number;
      best5Points: number;
      [subjectKey: string]: any;
    }> = [];

    const summaryMap: Record<string, {
      subject: string;
      t1: number;
      t2: number;
      t3: number;
      delta: number;
      latestGrade: number;
      latestRemark: string;
    }> = {};

    subjects.forEach(subj => {
      summaryMap[subj] = {
        subject: subj,
        t1: 0,
        t2: 0,
        t3: 0,
        delta: 0,
        latestGrade: isG4to7 ? 5 : 9,
        latestRemark: "Pending"
      };
    });

    TERMS.forEach((termName, idx) => {
      let sumScores = 0;
      let count = 0;
      const termEntry: any = {
        term: termName,
        termShort: `T${idx + 1}`
      };

      const pointsArr: number[] = [];

      subjects.forEach(subj => {
        const assessment: SubjectAssessment | undefined =
          gradebook[classId]?.[termName]?.[subj]?.[studentId];

        const score = assessment ? assessment.totalScore : 0;
        const ca = assessment ? assessment.caScore : 0;
        const exam = assessment ? assessment.midTermScore + assessment.endTermScore : 0;
        const point = assessment
          ? (isG4to7 ? (assessment.grade7Grade || calculateGrade7EczGrade(score).point) : assessment.eczGrade)
          : (isG4to7 ? 5 : 9);

        // Choose value based on metric
        const chartVal = metricType === "total" ? score : metricType === "ca" ? ca : exam;
        termEntry[subj] = chartVal;
        termEntry[`${subj}_score`] = score;
        termEntry[`${subj}_point`] = point;
        termEntry[`${subj}_ca`] = ca;
        termEntry[`${subj}_exam`] = exam;

        if (assessment) {
          sumScores += score;
          count += 1;
          pointsArr.push(point);

          if (termName === "Term 1") summaryMap[subj].t1 = score;
          if (termName === "Term 2") summaryMap[subj].t2 = score;
          if (termName === "Term 3") {
            summaryMap[subj].t3 = score;
            summaryMap[subj].latestGrade = point;
            summaryMap[subj].latestRemark = assessment.remark || (isG4to7 ? (GRADE_7_ECZ_SCALE[point]?.label || "Satisfactory") : (ECZ_GRADE_SCALE[point]?.label || "Satisfactory"));
          }
        }
      });

      const avg = count > 0 ? parseFloat((sumScores / count).toFixed(1)) : 0;
      termEntry.average = avg;

      pointsArr.sort((a, b) => a - b);
      termEntry.best5Points = isG4to7
        ? pointsArr.slice(0, 6).reduce((a, b) => a + b, 0)
        : pointsArr.slice(0, 5).reduce((a, b) => a + b, 0);

      termData.push(termEntry);
    });

    // Calculate subject deltas (T3 - T1 or T2 - T1)
    Object.keys(summaryMap).forEach(k => {
      const item = summaryMap[k];
      const start = item.t1 || item.t2;
      const end = item.t3 || item.t2 || item.t1;
      item.delta = end - start;
    });

    const t1Avg = termData[0]?.average || 0;
    const t3Avg = termData[2]?.average || termData[1]?.average || t1Avg;
    const netGrowth = parseFloat((t3Avg - t1Avg).toFixed(1));

    return {
      progressionByTerm: termData,
      subjectProgressionSummary: Object.values(summaryMap),
      termAverages: termData.map(d => ({ term: d.term, avg: d.average, best5: d.best5Points })),
      overallImprovement: netGrowth
    };
  }, [student.id, student.classId, gradebook, subjects, metricType, isG4to7]);

  // Find highest improving subject
  const highestImprovingSubj = useMemo(() => {
    const sorted = [...subjectProgressionSummary].sort((a, b) => b.delta - a.delta);
    return sorted[0] || null;
  }, [subjectProgressionSummary]);

  // Subject toggle handler
  const handleToggleSubject = (subj: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subj)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(s => s !== subj);
      } else {
        return [...prev, subj];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedSubjects([...subjects]);
  };

  const handleSelectCore = () => {
    setSelectedSubjects(subjects.slice(0, 3));
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-sm text-xs max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="font-bold text-emerald-400 font-serif">{label} Assessment</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Class Avg: {payload.find((p: any) => p.dataKey === "average")?.value ?? "—"}%
            </span>
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {payload.map((entry: any, index: number) => {
              if (entry.dataKey === "average" && !showAverageLine) return null;
              const isAvg = entry.dataKey === "average";
              const unit = metricType === "total" ? "%" : metricType === "ca" ? "/30" : "/70";

              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color || "#10b981" }}
                    />
                    <span className={`truncate ${isAvg ? "font-bold text-amber-300" : "text-slate-200"}`}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold shrink-0">
                    {entry.value}{unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm font-sans space-y-5 print:hidden">
      {/* Header with Title and Growth Summary Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                3-Term Academic Progression & Score Trajectory
              </h3>
              <p className="text-xs text-slate-500">
                Visual tracking of {student.name}'s performance across Term 1, Term 2, and Term 3 (2026)
              </p>
            </div>
          </div>
        </div>

        {/* Growth Stats Highlights */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-emerald-800 font-medium">Yearly Trajectory:</span>
            <span className={`font-bold flex items-center font-mono ${
              overallImprovement > 0 ? "text-emerald-700" : overallImprovement < 0 ? "text-rose-600" : "text-slate-700"
            }`}>
              {overallImprovement > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : overallImprovement < 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <Minus className="w-3.5 h-3.5 mr-0.5" />
              )}
              {overallImprovement > 0 ? `+${overallImprovement}%` : `${overallImprovement}%`}
            </span>
          </div>

          {highestImprovingSubj && highestImprovingSubj.delta > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl text-xs text-sky-900">
              <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="text-slate-600">Top Growth:</span>
              <span className="font-bold text-sky-800 truncate max-w-[130px]" title={highestImprovingSubj.subject}>
                {highestImprovingSubj.subject.split(" ")[0]} (+{highestImprovingSubj.delta}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar: Chart Type, Metric, and Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        {/* Left: Metric toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Metric:</span>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setMetricType("total")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                metricType === "total" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Total Score (100%)
            </button>
            <button
              onClick={() => setMetricType("ca")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                metricType === "ca" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CA (30%)
            </button>
            <button
              onClick={() => setMetricType("exam")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                metricType === "exam" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Exam (70%)
            </button>
          </div>

          <button
            onClick={() => setShowAverageLine(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              showAverageLine
                ? "bg-amber-100/70 border-amber-300 text-amber-900 shadow-2xs"
                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Overall Average Line</span>
          </button>
        </div>

        {/* Right: Chart format & Quick selection */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">View:</span>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setChartType("line")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                chartType === "line" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Line Trend View"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Trend Lines</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                chartType === "bar" ? "bg-slate-800 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Bar Comparison View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Term Bars</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-700 bg-white border border-slate-300 rounded-lg hover:border-emerald-400 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleSelectCore}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-emerald-700 bg-white border border-slate-300 rounded-lg hover:border-emerald-400 transition-colors"
          >
            Core 3
          </button>
        </div>
      </div>

      {/* Interactive Subject Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Filter Subjects on Chart ({selectedSubjects.length} of {subjects.length} active):
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subj, idx) => {
            const isSelected = selectedSubjects.includes(subj);
            const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
            const summary = subjectProgressionSummary.find(s => s.subject === subj);
            const delta = summary?.delta || 0;

            return (
              <button
                key={subj}
                onClick={() => handleToggleSubject(subj)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-800 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate max-w-[140px] sm:max-w-none">{subj}</span>
                {delta !== 0 && (
                  <span className={`text-[10px] font-mono font-bold px-1 rounded ${
                    delta > 0
                      ? isSelected ? "bg-emerald-800 text-emerald-200" : "bg-emerald-100 text-emerald-800"
                      : isSelected ? "bg-rose-900 text-rose-200" : "bg-rose-100 text-rose-800"
                  }`}>
                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Recharts Stage */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={progressionByTerm}
              margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="term"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                tickLine={{ stroke: "#cbd5e1" }}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                domain={[
                  0,
                  metricType === "total" ? 100 : metricType === "ca" ? 30 : 70
                ]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={{ stroke: "#cbd5e1" }}
                axisLine={{ stroke: "#cbd5e1" }}
                unit={metricType === "total" ? "%" : ""}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                iconType="circle"
              />

              {metricType === "total" && (
                <>
                  <ReferenceLine
                    y={70}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    label={{
                      value: "Distinction (70%)",
                      fill: "#059669",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    label={{
                      value: "Pass / Credit (50%)",
                      fill: "#d97706",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                </>
              )}

              {/* Overall Average Line */}
              {showAverageLine && (
                <Line
                  type="monotone"
                  dataKey="average"
                  name="Term Average (%)"
                  stroke="#d97706"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: "#d97706", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              )}

              {/* Subject Lines */}
              {subjects.map((subj, idx) => {
                if (!selectedSubjects.includes(subj)) return null;
                const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

                return (
                  <Line
                    key={subj}
                    type="monotone"
                    dataKey={subj}
                    name={subj}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, stroke: "#1e293b", strokeWidth: 2 }}
                  />
                );
              })}
            </LineChart>
          ) : (
            <BarChart
              data={progressionByTerm}
              margin={{ top: 10, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="term"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                tickLine={{ stroke: "#cbd5e1" }}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                domain={[
                  0,
                  metricType === "total" ? 100 : metricType === "ca" ? 30 : 70
                ]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={{ stroke: "#cbd5e1" }}
                axisLine={{ stroke: "#cbd5e1" }}
                unit={metricType === "total" ? "%" : ""}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                iconType="circle"
              />

              {showAverageLine && (
                <Bar
                  dataKey="average"
                  name="Term Average (%)"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              )}

              {subjects.map((subj, idx) => {
                if (!selectedSubjects.includes(subj)) return null;
                const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

                return (
                  <Bar
                    key={subj}
                    dataKey={subj}
                    name={subj}
                    fill={color}
                    radius={[4, 4, 0, 0]}
                  />
                );
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Term-by-Term Score Cards Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {termAverages.map((t, idx) => {
          const isSelectedTerm = t.term === "Term 1"; // Reference
          const prevAvg = idx > 0 ? termAverages[idx - 1].avg : t.avg;
          const diff = parseFloat((t.avg - prevAvg).toFixed(1));

          return (
            <div
              key={t.term}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.term} Performance
                </span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {t.avg}%
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {isG4to7 ? "Best 6 Aggregate: " : "Best 5 Aggregate: "}
                  <strong className="text-emerald-700">{t.best5} pts</strong>
                </span>
              </div>

              {idx > 0 && (
                <div className={`text-right px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                  diff > 0
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : diff < 0
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-slate-200 text-slate-700"
                }`}>
                  <span>{diff > 0 ? `+${diff}%` : `${diff}%`}</span>
                  <span className="block text-[9px] font-normal text-slate-500">vs Term {idx}</span>
                </div>
              )}

              {idx === 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-md">
                  Baseline
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
