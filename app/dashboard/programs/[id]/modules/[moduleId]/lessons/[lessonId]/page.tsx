/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, Loader2, Clock, ChevronRight, FileText,
    Video, Download, AlertCircle
} from "lucide-react";
import { getProgramLesson } from "@/lib/api-client";
import { VideoPlayer } from "@/components/programs/VideoPlayer";
import { FileViewer } from "@/components/programs/FileViewer";

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
    created_at?: string;
    updated_at?: string;
}

export default function LessonDetailPage() {
    const params = useParams();
    const programId = Number(params.id);
    const moduleId = Number(params.moduleId);
    const lessonId = Number(params.lessonId);

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLesson() {
            try {
                setLoading(true);
                const response = (await getProgramLesson(programId, moduleId, lessonId)) as any;

                if (response?.success && response.data) {
                    setLesson(response.data);
                } else {
                    setError(response?.message || "Failed to load lesson");
                }
            } catch (err: any) {
                setError(err instanceof Error ? err.message : "Failed to load lesson");
            } finally {
                setLoading(false);
            }
        }
        if (programId && moduleId && lessonId) fetchLesson();
    }, [programId, moduleId, lessonId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="space-y-4">
                <Link
                    href={`/dashboard/programs/${programId}/modules/${moduleId}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Module
                </Link>
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-400">
                    {error || "Lesson not found"}
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
            case "text":
                return <FileText className="h-5 w-5 text-slate-500" />;
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
                <Link href={`/dashboard/programs/${programId}/modules/${moduleId}`} className="hover:text-foreground transition-colors">
                    Module
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{lesson.title}</span>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    {getContentTypeIcon(lesson.content_type)}
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="capitalize">{lesson.content_type}</Badge>
                    {lesson.is_required && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                            Required
                        </Badge>
                    )}
                    {lesson.estimated_duration_minutes && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {lesson.estimated_duration_minutes} minutes
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            {lesson.description && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Content Display */}
            {lesson.content_type === "video" && lesson.video_url && (
                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Video Content</h2>
                    <VideoPlayer
                        url={lesson.video_url}
                        title={lesson.title}
                    />
                </div>
            )}

            {lesson.content_type === "file" && lesson.file_url && (
                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">File Content</h2>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <FileText className="h-10 w-10 text-orange-500" />
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{lesson.file_type ? lesson.file_type.toUpperCase() : 'File'}</p>
                                    <p className="text-sm text-muted-foreground">Learning material</p>
                                </div>
                                <a
                                    href={lesson.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Download size={16} />
                                    Download
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {lesson.content_type === "text" && lesson.content && (
                <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Lesson Content</h2>
                    <Card>
                        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {lesson.content}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!lesson.content && !lesson.video_url && !lesson.file_url && (
                <Card>
                    <CardContent className="flex items-start gap-3 py-6">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            No content available for this lesson yet.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Link
                    href={`/dashboard/programs/${programId}/modules/${moduleId}`}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Module
                </Link>
            </div>
        </div>
    );
}
