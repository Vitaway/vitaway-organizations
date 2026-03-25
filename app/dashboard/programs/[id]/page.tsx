/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, Loader2, BookOpen, Clock, Layers, Target,
    ChevronRight, FileText, Video, FolderOpen
} from "lucide-react";
import { getProgram, getProgramModules } from "@/lib/api-client";

interface Module {
    id: number;
    title: string;
    description?: string;
    content_type: string;
    position: number;
    estimated_duration_minutes?: number;
    is_required: boolean;
    quizzes?: any[];
}

interface Program {
    id: number;
    title: string;
    description: string;
    status: string;
    difficulty_level: string;
    estimated_duration_hours: number;
    total_modules: number;
    learning_objectives: string;
    thumbnail_url?: string;
    created_at: string;
}

export default function ProgramDetailPage() {
    const params = useParams();
    const programId = Number(params.id);

    const [program, setProgram] = useState<Program | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [programRes, modulesRes] = await Promise.all([
                    getProgram(programId) as Promise<any>,
                    getProgramModules(programId) as Promise<any>,
                ]);

                if (programRes?.success && programRes.data) {
                    setProgram(programRes.data);
                } else {
                    setError(programRes?.message || "Failed to load program");
                    return;
                }

                if (modulesRes?.success && modulesRes.data) {
                    setModules(modulesRes.data.data || modulesRes.data || []);
                }
            } catch (err: any) {
                setError(err instanceof Error ? err.message : "Failed to load program");
            } finally {
                setLoading(false);
            }
        }
        if (programId) fetchData();
    }, [programId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="space-y-4">
                <Link href="/dashboard/programs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Programs
                </Link>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-400">
                    {error || "Program not found"}
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "draft":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "archived":
                return "bg-muted text-muted-foreground";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case "beginner":
                return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "intermediate":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "advanced":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

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
            <Link href="/dashboard/programs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Programs
            </Link>

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{program.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <Badge className={getStatusColor(program.status)}>
                        {program.status}
                    </Badge>
                    {program.difficulty_level && (
                        <Badge className={getDifficultyColor(program.difficulty_level)}>
                            {program.difficulty_level}
                        </Badge>
                    )}
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Layers size={14} />
                        {program.total_modules} modules
                    </span>
                    {program.estimated_duration_hours > 0 && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {program.estimated_duration_hours}h estimated
                        </span>
                    )}
                </div>
            </div>

            {/* Program Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Program Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {program.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
                    )}
                    {program.learning_objectives && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium text-foreground">Learning Objectives</p>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-6">{program.learning_objectives}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modules List */}
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Modules ({modules.length})
                </h2>

                {modules.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Layers className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No modules in this program yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {modules.map((module, index) => (
                            <Link
                                key={module.id}
                                href={`/dashboard/programs/${programId}/modules/${module.id}`}
                                className="group block"
                            >
                                <Card className="hover:shadow-md transition-all hover:border-primary/50">
                                    <CardContent className="flex items-center gap-4 py-4">
                                        {/* Position number */}
                                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                            {index + 1}
                                        </div>

                                        {/* Content type icon */}
                                        <div className="flex-shrink-0">
                                            {getContentTypeIcon(module.content_type)}
                                        </div>

                                        {/* Module info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                {module.title}
                                            </h3>
                                            {module.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                                    {module.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground capitalize">{module.content_type}</span>
                                                {module.estimated_duration_minutes && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {module.estimated_duration_minutes} min
                                                    </span>
                                                )}
                                                {module.quizzes && module.quizzes.length > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {module.quizzes.length} quiz{module.quizzes.length > 1 ? "zes" : ""}
                                                    </span>
                                                )}
                                                {module.is_required && (
                                                    <Badge variant="outline" className="text-xs py-0">Required</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
