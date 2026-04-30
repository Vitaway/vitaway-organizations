'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileText, Video, FolderOpen, Clock, ChevronRight, 
    CheckCircle2, AlertCircle, BookOpen, Eye, Download
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { FileViewer } from './FileViewer';
import { LessonPreview } from './LessonPreview';

interface Lesson {
    id: number;
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
}

interface LessonsListProps {
    programId: number;
    moduleId: number;
    lessons: Lesson[];
    isLoading?: boolean;
}

export function LessonsList({ programId, moduleId, lessons, isLoading = false }: LessonsListProps) {
    const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);

    const getContentTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="h-5 w-5 text-blue-500" />;
            case 'file':
                return <FileText className="h-5 w-5 text-orange-500" />;
            case 'text':
                return <FileText className="h-5 w-5 text-slate-500" />;
            default:
                return <FileText className="h-5 w-5 text-muted-foreground" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (!lessons || lessons.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No lessons in this module yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {lessons.map((lesson, index) => (
                <Card
                    key={lesson.id}
                    className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
                    onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                >
                    <CardContent className="flex items-center gap-4 py-4">
                        {/* Position number */}
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index + 1}
                        </div>

                        {/* Content type icon */}
                        <div className="flex-shrink-0">
                            {getContentTypeIcon(lesson.content_type)}
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-foreground">
                                    {lesson.title}
                                </h3>
                                {lesson.is_required && (
                                    <Badge variant="outline" className="text-xs py-0">Required</Badge>
                                )}
                                {(lesson.video_url || lesson.file_url || lesson.content) && (
                                    <LessonPreview lesson={lesson} />
                                )}
                            </div>
                            {lesson.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {lesson.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted-foreground capitalize">{lesson.content_type}</span>
                                {lesson.estimated_duration_minutes && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock size={10} />
                                        {lesson.estimated_duration_minutes} min
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight
                            size={20}
                            className={`text-muted-foreground transition-transform ${
                                expandedLessonId === lesson.id ? 'rotate-90' : ''
                            }`}
                        />
                    </CardContent>

                    {/* Expanded content */}
                    {expandedLessonId === lesson.id && (
                        <CardContent className="border-t bg-muted/30 py-6 space-y-4">
                            {/* Description */}
                            {lesson.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                </div>
                            )}

                            {/* Video Preview */}
                            {lesson.content_type === 'video' && lesson.video_url && (
                                <div className="mt-4">
                                    <div className="scale-95 origin-top-left">
                                        <VideoPlayer
                                            videoUrl={lesson.video_url}
                                            title={lesson.title}
                                            description="Lesson Video"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* File Preview */}
                            {lesson.content_type === 'file' && lesson.file_url && (
                                <div className="mt-4">
                                    <div className="scale-95 origin-top-left">
                                        <FileViewer
                                            fileUrl={lesson.file_url}
                                            fileName={lesson.title}
                                            fileType={lesson.file_type}
                                            description="Lesson File"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Text Content */}
                            {lesson.content_type === 'text' && lesson.content && (
                                <div className="mt-4 rounded-lg border bg-white dark:bg-slate-900 p-4">
                                    <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                                        {lesson.content}
                                    </div>
                                </div>
                            )}

                            {/* View Full Lesson Link */}
                            <div className="flex gap-2 pt-2">
                                <Link
                                    href={`/dashboard/programs/${programId}/modules/${moduleId}/lessons/${lesson.id}`}
                                    className="inline-flex items-center text-primary hover:underline text-sm font-medium flex-1"
                                >
                                    View Full Lesson <ChevronRight size={14} className="ml-1" />
                                </Link>
                            </div>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
}
