"use client";

import { VideoPlayer } from "./VideoPlayer";
import { FileViewer } from "./FileViewer";
import { RichTextContent } from "@/components/ui/rich-text-content";

interface ModuleContentProps {
    contentType: string;
    content?: string;
    videoUrl?: string;
    fileUrl?: string;
    fileType?: string;
    title?: string;
    description?: string;
}

export function ModuleContent({
    contentType,
    content,
    videoUrl,
    fileUrl,
    fileType,
    title,
    description,
}: ModuleContentProps) {
    return (
        <>
            {/* Video Content */}
            {(contentType === "video" || contentType === "mixed") && videoUrl && (
                <VideoPlayer
                    videoUrl={videoUrl}
                    title={title}
                    description={description}
                />
            )}

            {/* File Content */}
            {(contentType === "file" || contentType === "mixed") && fileUrl && (
                <FileViewer
                    fileUrl={fileUrl}
                    fileName={title}
                    fileType={fileType}
                    description={description}
                />
            )}

            {/* Text/HTML Content */}
            {(contentType === "text" || contentType === "mixed") && content && (
                <div className="rounded-lg border bg-white dark:bg-slate-900 p-6">
                    <RichTextContent html={content} />
                </div>
            )}

            {/* Fallback message */}
            {!content && !videoUrl && !fileUrl && (
                <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        No content available for this module yet.
                    </p>
                </div>
            )}
        </>
    );
}
