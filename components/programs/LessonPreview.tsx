'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Video, Download } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { FileViewer } from './FileViewer';

interface LessonPreviewProps {
    lesson: {
        id: number;
        title: string;
        description?: string | null;
        content_type: string;
        content?: string | null;
        video_url?: string | null;
        file_url?: string | null;
        file_type?: string | null;
        estimated_duration_minutes?: number;
    };
}

export function LessonPreview({ lesson }: LessonPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    const canPreview = lesson.video_url || lesson.file_url || lesson.content;

    if (!canPreview) return null;

    const getPreviewLabel = () => {
        switch (lesson.content_type) {
            case 'video':
                return 'Watch Video';
            case 'file':
                return 'View File';
            case 'text':
                return 'Read Content';
            default:
                return 'Preview';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-8 px-2"
                    title={`${getPreviewLabel()} - ${lesson.title}`}
                >
                    <Eye size={16} />
                    <span className="hidden sm:inline text-xs">{getPreviewLabel()}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {lesson.content_type === 'video' ? (
                            <Video className="h-5 w-5 text-blue-500" />
                        ) : lesson.content_type === 'file' ? (
                            <FileText className="h-5 w-5 text-orange-500" />
                        ) : (
                            <FileText className="h-5 w-5 text-slate-500" />
                        )}
                        {lesson.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {lesson.description && (
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    )}

                    {/* Video Preview */}
                    {lesson.content_type === 'video' && lesson.video_url && (
                        <VideoPlayer
                            videoUrl={lesson.video_url}
                            title={lesson.title}
                            description={lesson.description}
                        />
                    )}

                    {/* File Preview */}
                    {lesson.content_type === 'file' && lesson.file_url && (
                        <FileViewer
                            fileUrl={lesson.file_url}
                            fileName={lesson.title}
                            fileType={lesson.file_type}
                            description={lesson.description}
                        />
                    )}

                    {/* Text Content */}
                    {lesson.content_type === 'text' && lesson.content && (
                        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {lesson.content}
                                </div>
                            </div>
                        </div>
                    )}

                    {lesson.estimated_duration_minutes && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
                            <Badge variant="outline">{lesson.estimated_duration_minutes} min</Badge>
                            <span>Estimated time to complete</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
