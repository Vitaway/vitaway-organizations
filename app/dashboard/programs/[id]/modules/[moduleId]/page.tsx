/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, Loader2, Clock, FileText, Video, FolderOpen,
    ChevronRight, HelpCircle, CheckCircle2
} from "lucide-react";
import { getProgramModule } from "@/lib/api-client";

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
    position: number;
    estimated_duration_minutes?: number;
    is_required: boolean;
    quizzes: Quiz[];
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
                    {module.is_required && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                            Required
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

            {/* Module Content */}
            {(module.description || module.content) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {module.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                        )}
                        {module.content && (
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                                dangerouslySetInnerHTML={{ __html: module.content }}
                            />
                        )}
                        {module.video_url && (
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Video className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">Video Content</span>
                                </div>
                                <a
                                    href={module.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline break-all"
                                >
                                    {module.video_url}
                                </a>
                            </div>
                        )}
                        {module.file_url && (
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">Attached File</span>
                                </div>
                                <a
                                    href={module.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline break-all"
                                >
                                    {module.file_url}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quizzes */}
            {module.quizzes && module.quizzes.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
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
                                                                        className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                                                                            answer.is_correct
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
