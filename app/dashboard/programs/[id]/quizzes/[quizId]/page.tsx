/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft, Loader2, ChevronRight, HelpCircle,
    CheckCircle2, Clock, Target
} from "lucide-react";
import { getProgramQuiz } from "@/lib/api-client";

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

export default function QuizDetailPage() {
    const params = useParams();
    const programId = Number(params.id);
    const quizId = Number(params.quizId);

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchQuiz() {
            try {
                setLoading(true);
                const response = (await getProgramQuiz(programId, quizId)) as any;
                if (response?.success && response.data) {
                    setQuiz(response.data);
                } else {
                    setError(response?.message || "Failed to load quiz");
                }
            } catch (err: any) {
                setError(err instanceof Error ? err.message : "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        }
        if (programId && quizId) fetchQuiz();
    }, [programId, quizId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="space-y-4">
                <Link
                    href={`/dashboard/programs/${programId}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Program
                </Link>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-400">
                    {error || "Quiz not found"}
                </div>
            </div>
        );
    }

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

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
                <span className="text-foreground font-medium">{quiz.title}</span>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <HelpCircle className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{quiz.title}</h1>
                </div>
                {quiz.description && (
                    <p className="text-muted-foreground">{quiz.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3">
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

            {/* Quiz Info */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{quiz.passing_score}%</p>
                            <p className="text-xs text-muted-foreground">Passing Score</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <HelpCircle className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{quiz.questions.length}</p>
                            <p className="text-xs text-muted-foreground">Questions</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
                            <p className="text-xs text-muted-foreground">Total Points</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {quiz.time_limit_minutes || "No"}{quiz.time_limit_minutes ? " min" : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">Time Limit</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Questions */}
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                    Questions
                </h2>

                <div className="space-y-4">
                    {quiz.questions.map((question, qIndex) => (
                        <Card key={question.id}>
                            <CardContent className="py-4">
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold">
                                        {qIndex + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
