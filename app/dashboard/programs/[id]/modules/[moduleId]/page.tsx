/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, Loader2, Clock, ChevronRight, CheckCircle2,
    FileText,
    Video,
    FolderOpen,
    BookOpen,
    Layers,
    ListChecks
} from "lucide-react";
import { getProgramModule } from "@/lib/api-client";
import { ModuleContent } from "@/components/programs/ModuleContent";
import { LessonsList } from "@/components/programs/LessonsList";

interface Answer {
    id: number;
    answer_text: string;
    is_correct: boolean;
    explanation?: string;
    position: number;
}

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    explanation?: string;
    points: number;
    position: number;
    answers: Answer[];
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    quiz_type: string;
    passing_score: number;
    max_attempts?: number;
    time_limit_minutes?: number;
    is_required: boolean;
    questions: Question[];
}

interface Module {
    id: number;
    title: string;
    description?: string;
    content_type: string;
    content?: string;
    video_url?: string;
    file_url?: string;
    file_type?: string;
    position: number;
    estimated_duration_minutes?: number;
    is_required: boolean;
    requires_quiz_pass?: boolean;
    lessons?: Lesson[];
    quizzes: Quiz[];
}

interface Lesson {
    id: number;
    module_id: number;
    title: string;
    description?: string | null;
    content_type: string;
    content?: string | null;
    video_url?: string | null;
    file_url?: string | null;
    file_type?: string | null;
    position: number;
    estimated_duration_minutes?: number;
    is_required: boolean;
}

export default function ModuleDetailPage() {
    const params = useParams();
    const programId = Number(params.id);
    const moduleId = Number(params.moduleId);

    const [module, setModule] = useState<Module | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchModule() {
            try {
                setLoading(true);
                const response = (await getProgramModule(programId, moduleId)) as any;

                if (response?.success && response.data) {
                    setModule(response.data);
                } else {
                    setError(response?.message || "Failed to load module");
                }
            } catch (err: any) {
                setError(err instanceof Error ? err.message : "Failed to load module");
            } finally {
                setLoading(false);
            }
        }
        if (programId && moduleId) fetchModule();
    }, [programId, moduleId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error || !module) {
        return (
            <div className="space-y-4">
                <Link
                    href={`/dashboard/programs/${programId}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Program
                </Link>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-400">
                    {error || "Module not found"}
                </div>
            </div>
        );
    }

    const getContentTypeIcon = (type: string) => {
        switch (type) {
            case "video":
                return <Video className="h-5 w-5 text-blue-500" />;
            case "file":
                return <FileText className="h-5 w-5 text-orange-500" />;
            case "mixed":
                return <FolderOpen className="h-5 w-5 text-purple-500" />;
            default:
                return <FileText className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const moduleDetails = [
        { label: "Content type", value: module.content_type },
        { label: "Requirement", value: module.is_required ? "Required" : "Optional" },
        { label: "Position", value: String(module.position) },
        ...(module.estimated_duration_minutes
            ? [{ label: "Estimated time", value: `${module.estimated_duration_minutes} minutes` }]
            : []),
        ...(module.file_type ? [{ label: "File type", value: module.file_type.toUpperCase() }] : []),
        { label: "Quiz pass", value: module.requires_quiz_pass ? "Required to complete" : "Not required" },
        { label: "Lessons", value: String(module.lessons?.length ?? 0) },
        { label: "Quizzes", value: String(module.quizzes?.length ?? 0) },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard/programs" className="hover:text-foreground transition-colors">
                    Programs
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/dashboard/programs/${programId}`} className="hover:text-foreground transition-colors">
                    Program
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{module.title}</span>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    {getContentTypeIcon(module.content_type)}
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{module.title}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="capitalize">{module.content_type}</Badge>
                    <Badge
                        variant="outline"
                        className={module.is_required
                            ? "text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700"
                            : "text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-700"}
                    >
                        {module.is_required ? "Required" : "Optional"}
                    </Badge>
                    {module.requires_quiz_pass && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700">
                            Quiz pass required
                        </Badge>
                    )}
                    {module.estimated_duration_minutes && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {module.estimated_duration_minutes} minutes
                        </span>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="h-5 w-5" />
                        Module Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {moduleDetails.map((detail) => (
                        <div key={detail.label} className="rounded-lg border bg-muted/30 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {detail.label}
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground capitalize">
                                {detail.value}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Module Content */}
            <ModuleContent
                contentType={module.content_type}
                content={module.content}
                videoUrl={module.video_url}
                fileUrl={module.file_url}
                fileType={module.file_type}
                title={module.title}
                description={module.description}
            />

            {/* Lessons */}
            {module.lessons && module.lessons.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Lessons ({module.lessons.length})
                    </h2>
                    <LessonsList
                        programId={programId}
                        moduleId={moduleId}
                        lessons={module.lessons}
                    />
                </div>
            )}

            {/* Quizzes */}
            {module.quizzes && module.quizzes.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        Quizzes ({module.quizzes.length})
                    </h2>

                    <div className="space-y-4">
                        {module.quizzes.map((quiz) => (
                            <Card key={quiz.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                            {quiz.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="capitalize">
                                                {quiz.quiz_type.replace("_", " ")}
                                            </Badge>
                                            {quiz.is_required && (
                                                <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                                                    Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                                        <span>Passing: {quiz.passing_score}%</span>
                                        {quiz.max_attempts && <span>Max attempts: {quiz.max_attempts}</span>}
                                        {quiz.time_limit_minutes && <span>Time limit: {quiz.time_limit_minutes} min</span>}
                                        <span>{quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {quiz.questions.length > 0 && (
                                        <div className="space-y-4">
                                            {quiz.questions.map((question, qIndex) => (
                                                <div key={question.id} className="rounded-lg border p-4">
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {qIndex + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-foreground">
                                                                {question.question_text}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1 mb-3">
                                                                <Badge variant="outline" className="text-xs capitalize py-0">
                                                                    {question.question_type.replace("_", " ")}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {question.points} point{question.points !== 1 ? "s" : ""}
                                                                </span>
                                                            </div>

                                                            {/* Answers */}
                                                            <div className="space-y-2">
                                                                {question.answers.map((answer) => (
                                                                    <div
                                                                        key={answer.id}
                                                                        className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${answer.is_correct
                                                                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                                                                : "bg-muted/50 border border-transparent"
                                                                            }`}
                                                                    >
                                                                        {answer.is_correct ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                                        ) : (
                                                                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30 mt-0.5 flex-shrink-0" />
                                                                        )}
                                                                        <div>
                                                                            <span className={answer.is_correct ? "font-medium text-green-800 dark:text-green-300" : "text-foreground"}>
                                                                                {answer.answer_text}
                                                                            </span>
                                                                            {answer.explanation && (
                                                                                <p className="text-xs text-muted-foreground mt-0.5">{answer.explanation}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {question.explanation && (
                                                                <div className="mt-2 rounded-md bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
                                                                    <p className="text-xs text-blue-800 dark:text-blue-300">
                                                                        <span className="font-medium">Explanation:</span> {question.explanation}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
